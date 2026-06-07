import { Divider } from '@/components/Divider'
import Heading from '@/components/Heading/Heading'
import Prices from '@/components/Prices'
import { createClient } from '@/utils/supabase/server'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ClearCart from './ClearCart'

export const metadata: Metadata = {
  title: 'Order Successful — Thread & Crochet',
  description: 'Your order has been successfully placed.',
}

interface PageProps {
  searchParams: Promise<{ order_number?: string; payment_id?: string }>
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams
  const orderNumber = params.order_number
  const paymentId = params.payment_id

  // Support both ?order_number=TL-XXXXX (new) and ?payment_id=pay_XXXX (legacy)
  const lookupKey = orderNumber || paymentId

  if (!lookupKey) {
    return notFound()
  }

  const supabase = await createClient()

  // Query order by order_number first, fallback to payment_id for legacy orders
  const { data: dbOrder } = await supabase
    .from('orders')
    .select('*')
    .eq('number', lookupKey)
    .single()

  if (!dbOrder) {
    return notFound()
  }

  // Fetch the profile of the customer to display shipping address
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, address')
    .eq('id', dbOrder.user_id)
    .single()

  // Map Supabase columns to order schema structure
  const order = {
    number: dbOrder.number,
    date: dbOrder.date,
    status: dbOrder.status,
    invoiceHref: dbOrder.invoice_href,
    totalQuantity: dbOrder.total_quantity,
    cost: {
      subtotal: Number(dbOrder.subtotal),
      shipping: Number(dbOrder.shipping),
      tax: Number(dbOrder.tax),
      total: Number(dbOrder.total),
      discount: Number(dbOrder.discount),
    },
    products: (dbOrder.items || []).map((item: any) => ({
      id: item.id,
      title: item.name,
      handle: item.productHandle,
      price: item.price,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
      featuredImage: item.image,
    }))
  }

  const products = order.products

  return (
    <>
      <ClearCart />
      <main className="container">
        <div className="mx-auto max-w-2xl py-16 sm:py-24 lg:max-w-3xl">
          <div>
            <p className="text-xs font-medium uppercase">Thanks for ordering</p>
            <Heading className="mt-4">Payment successful!</Heading>

            <p className="mt-2.5 max-w-2xl text-neutral-500">
              We appreciate your order, we’re currently processing it. So hang tight and we’ll send you confirmation
              very soon!
            </p>

            {/* ORDER NUMBER (clean tracking ref) */}
            <dl className="mt-10 text-sm">
              <dt className="text-neutral-500">Tracking number</dt>
              <dd>
                <Link className="mt-2 text-lg font-medium" href={'/orders/' + (orderNumber || dbOrder.number)}>
                  #{orderNumber || dbOrder.number}
                  <span aria-hidden="true"> &rarr;</span>
                </Link>
              </dd>
            </dl>

            {/* RAZORPAY PAYMENT ID (reference only) */}
            {paymentId && (
              <div className="mt-4 rounded-xl bg-neutral-50 border border-neutral-200 px-5 py-3 dark:bg-neutral-800/50 dark:border-neutral-700">
                <p className="text-xs font-medium uppercase text-neutral-400 dark:text-neutral-500">Razorpay Reference</p>
                <p className="mt-1 font-mono text-xs text-neutral-500 dark:text-neutral-400 break-all">{paymentId}</p>
              </div>
            )}

            <ul
              role="list"
              className="mt-6 divide-y divide-neutral-200 border-t border-neutral-200 text-sm text-neutral-500 dark:divide-neutral-700 dark:border-neutral-700 dark:text-neutral-300"
            >
              {products.map((product: any) => (
                <li key={product.id} className="flex gap-x-2.5 py-6 sm:gap-x-6">
                  <div className="relative aspect-3/4 w-24 flex-none">
                    {product.featuredImage && (
                      <Image
                        alt={product.featuredImage.alt || product.title}
                        src={product.featuredImage.src || product.featuredImage}
                        fill
                        sizes="200px"
                        className="rounded-md bg-neutral-100 object-cover"
                      />
                    )}
                  </div>
                  <div className="flex flex-auto flex-col gap-y-1.5">
                    <h3 className="text-base font-medium text-neutral-900 dark:text-neutral-100">
                      <Link href={'/products/' + product.handle}>{product.title}</Link>
                    </h3>
                    <div className="flex items-center gap-x-2 text-neutral-500 dark:text-neutral-300">
                      <p className="text-sm text-neutral-500 dark:text-neutral-300">{product.color}</p>
                      {product.size ? <p className="text-sm text-neutral-300">/</p> : null}
                      {product.size ? (
                        <p className="text-sm text-neutral-500 dark:text-neutral-300">{product.size}</p>
                      ) : null}
                    </div>
                    <Prices price={product.price} className="flex justify-start sm:hidden" />

                    <p className="mt-auto text-sm text-neutral-500 dark:text-neutral-300">Qty {product.quantity}</p>
                  </div>

                  <Prices price={product.price} className="hidden sm:block" />
                </li>
              ))}
            </ul>

            <dl className="space-y-6 border-t border-neutral-200 pt-6 text-sm font-medium text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
              <div className="flex justify-between">
                <dt className="uppercase">Subtotal</dt>
                <dd className="text-neutral-900 dark:text-neutral-100">
                  <Prices price={order.cost.subtotal} plainText />
                </dd>
              </div>

              <div className="flex justify-between">
                <dt className="uppercase">Shipping</dt>
                <dd className="text-neutral-900 dark:text-neutral-100">
                  <Prices price={order.cost.shipping} plainText />
                </dd>
              </div>

              <div className="flex justify-between">
                <dt className="uppercase">Taxes</dt>
                <dd className="text-neutral-900 dark:text-neutral-100">
                  <Prices price={order.cost.tax} plainText />
                </dd>
              </div>

              <div className="flex items-center justify-between border-t border-neutral-200 pt-6 text-neutral-900 dark:border-neutral-700 dark:text-neutral-100">
                <dt className="text-base uppercase">Total</dt>
                <dd className="text-base">
                  <Prices price={order.cost.total} plainText />
                </dd>
              </div>
            </dl>

            <dl className="mt-12 grid grid-cols-2 gap-x-4 text-sm text-neutral-600 sm:mt-16 dark:text-neutral-300">
              <div>
                <dt className="font-medium text-neutral-900 uppercase">Shipping Address</dt>
                <dd className="mt-2">
                  <address className="uppercase not-italic text-neutral-500">
                    <span className="block">{profile?.full_name || 'Customer'}</span>
                    <span className="block">{profile?.address || 'No address provided'}</span>
                  </address>
                </dd>
              </div>
              <div>
                <dt className="font-medium uppercase">Payment Information</dt>
                <dd className="mt-2 space-y-1 text-neutral-500 uppercase">
                  <p>Method: Razorpay Secure Payment</p>
                  <p>Status: Verified Paid</p>
                </dd>
              </div>
            </dl>

            <div className="mt-16 border-t border-neutral-200 py-6 text-right dark:border-neutral-700">
              <Link href="/collections/all" className="text-sm font-medium uppercase">
                Continue Shopping
                <span aria-hidden="true"> &rarr;</span>
              </Link>
            </div>
          </div>
        </div>

        <Divider />
      </main>
    </>
  )
}

