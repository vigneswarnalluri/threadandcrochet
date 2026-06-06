import { Divider } from '@/components/Divider'
import Prices from '@/components/Prices'
import ButtonSecondary from '@/shared/Button/ButtonSecondary'
import clsx from 'clsx'
import { Metadata } from 'next'
import Image from 'next/image'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import EditShippingUpdates from './EditShippingUpdates'

export async function generateMetadata({ params }: { params: Promise<{ number: string }> }): Promise<Metadata> {
  const { number } = await params
  const supabase = await createClient()

  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('number', number)
    .single()

  if (!order) {
    return {
      title: 'Order not found',
      description: 'The order you are looking for does not exist.',
    }
  }
  return { title: 'Order #' + order.number, description: order.status }
}

const Page = async ({ params }: { params: Promise<{ number: string }> }) => {
  const { number } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch the order for this number and check owner user_id
  const { data: dbOrder } = await supabase
    .from('orders')
    .select('*')
    .eq('number', number)
    .eq('user_id', user.id)
    .single()

  if (!dbOrder) {
    return notFound()
  }

  // Fetch customer profile to get addresses & contact details
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, address, email, phone_number')
    .eq('id', user.id)
    .single()

  // Status → tracking step mapping (0=placed, 1=processing, 2=shipped, 3=delivered)
  const STATUS_STEP_MAP: Record<string, number> = {
    Paid: 0,
    Processing: 1,
    Shipped: 2,
    Delivered: 3,
    Cancelled: 0,
    Refunded: 0,
  }
  const orderStep = STATUS_STEP_MAP[dbOrder.status] ?? 0

  // Map database details to page structure
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
      href: `/products/${item.productHandle}`,
      status: dbOrder.status === 'Paid' ? 'Paid & Processing' : dbOrder.status,
      date: dbOrder.date,
      datetime: dbOrder.created_at,
      step: orderStep,
      address: [
        profile?.full_name || 'Customer',
        profile?.address || 'No address provided',
        ''
      ],
      email: profile?.email || user.email || '',
      phone: profile?.phone_number || ''
    }))
  }

  const products = order.products

  return (
    <div>
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <p className="mb-1 text-sm">
            <span className="text-neutral-500 dark:text-neutral-400">Order placed</span>
            <time dateTime={dbOrder.created_at}> {order.date}</time>
          </p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Order #{order.number}</h1>
        </div>

        <div className="ml-auto">
          <ButtonSecondary size="smaller" href={`/orders/${order.number}/invoice`}>
            View invoice
            <span className="ms-2" aria-hidden="true">
              &rarr;
            </span>
          </ButtonSecondary>
        </div>
      </div>

      {/* Products */}
      <div className="mt-6">
        <h2 className="sr-only">Products purchased</h2>
        <div className="flex flex-col gap-y-10">
          {products.map((product: any) => (
            <div key={product.id} className="border-t border-b bg-white sm:rounded-lg sm:border dark:bg-neutral-800">
              <div className="py-6 sm:px-6 lg:grid lg:grid-cols-12 lg:gap-x-8 lg:p-8">
                <div className="sm:flex lg:col-span-7">
                  <div className="relative aspect-square w-full shrink-0 rounded-lg object-cover sm:size-40">
                    {product.featuredImage && (
                      <Image
                        alt={product.featuredImage.alt || product.title}
                        src={product.featuredImage.src || product.featuredImage}
                        fill
                        className="rounded-lg object-cover"
                        sizes="(min-width: 640px) 10rem, 100vw"
                      />
                    )}
                  </div>

                  <div className="mt-6 flex flex-col sm:mt-0 sm:ml-6">
                    <h3 className="text-base font-medium">
                      <a href={product.href}>{product.title}</a>
                    </h3>
                    <p className="my-2 text-sm text-neutral-500 dark:text-neutral-400">Qty {product.quantity}</p>
                    <Prices price={product.price} className="mt-auto flex justify-start" />
                  </div>
                </div>

                <div className="mt-6 lg:col-span-5 lg:mt-0">
                  <dl className="grid grid-cols-2 gap-x-6 text-sm">
                    <div>
                      <dt className="font-medium">Delivery address</dt>
                      <dd className="mt-3 text-neutral-500 dark:text-neutral-400">
                        <span className="block">{product.address[0]}</span>
                        <span className="block">{product.address[1]}</span>
                        <span className="block">{product.address[2]}</span>
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium">Shipping updates</dt>
                      <EditShippingUpdates initialEmail={product.email} initialPhone={product.phone} />
                    </div>
                  </dl>
                </div>
              </div>

              <div className="border-t px-4 py-6 sm:px-6 lg:p-8">
                <h4 className="sr-only">Status</h4>
                <p className="text-sm font-medium">
                  {product.status} on <time dateTime={product.datetime}>{product.date}</time>
                </p>
                <div aria-hidden="true" className="mt-6">
                  <div className="overflow-hidden rounded-full bg-neutral-200">
                    <div
                      style={{ width: `calc((${product.step} * 2 + 1) / 8 * 100%)` }}
                      className="h-2 rounded-full bg-neutral-950 sm:h-1.5"
                    />
                  </div>
                  <div className="mt-6 hidden grid-cols-4 text-sm font-medium text-neutral-500 sm:grid">
                    <div className="text-neutral-950 data-selected:text-neutral-950 dark:text-white">Order placed</div>
                    <div className={clsx(product.step > 0 ? 'text-neutral-950 dark:text-white' : '', 'text-center')}>
                      Processing
                    </div>
                    <div className={clsx(product.step > 1 ? 'text-neutral-950 dark:text-white' : '', 'text-center')}>
                      Shipped
                    </div>
                    <div className={clsx(product.step > 2 ? 'text-neutral-950 dark:text-white' : '', 'text-right')}>
                      Delivered
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Billing */}
      <div className="mt-16">
        <h2 className="sr-only">Billing Summary</h2>

        <div className="bg-neutral-50 px-4 py-6 sm:rounded-lg sm:px-6 lg:grid lg:grid-cols-12 lg:gap-x-8 lg:px-8 lg:py-8 dark:bg-neutral-800">
          <dl className="grid grid-cols-2 gap-6 text-sm sm:grid-cols-2 md:gap-x-8 lg:col-span-7">
            <div>
              <dt className="font-medium">Billing address</dt>
              <dd className="mt-3 text-neutral-500 dark:text-neutral-400 uppercase">
                <span className="block">{profile?.full_name || 'Customer'}</span>
                <span className="block">{profile?.address || 'No address provided'}</span>
              </dd>
            </div>
            <div>
              <dt className="font-medium">Payment information</dt>
              <dd className="mt-3 text-neutral-500 dark:text-neutral-400 uppercase">
                <span className="block">Razorpay Secure Online Payment</span>
                <span className="block">Status: Paid</span>
              </dd>
            </div>
          </dl>

          <dl className="mt-8 flex flex-col gap-y-5 text-sm lg:col-span-5 lg:mt-0">
            <div className="flex items-center justify-between">
              <dt className="text-neutral-600 dark:text-neutral-300">Subtotal</dt>
              <dd className="font-medium">
                <Prices price={order.cost.subtotal} plainText />
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-neutral-600 dark:text-neutral-300">Shipping</dt>
              <dd className="font-medium">
                <Prices price={order.cost.shipping} plainText />
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-neutral-600 dark:text-neutral-300">Tax</dt>
              <dd className="font-medium">
                <Prices price={order.cost.tax} plainText />
              </dd>
            </div>
            <Divider />
            <div className="flex items-center justify-between">
              <dt className="font-medium">Order total</dt>
              <dd className="font-medium">
                <Prices price={order.cost.total} plainText />
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}

export default Page

