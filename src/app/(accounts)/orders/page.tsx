import { Link } from '@/components/Link'
import Prices from '@/components/Prices'
import { createClient } from '@/utils/supabase/server'
import { Button } from '@/shared/Button/Button'
import { Metadata } from 'next'
import Image from 'next/image'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Orders',
  description: 'Orders History page',
}

const Order = ({ order }: { order: any }) => {
  return (
    <div className="z-0 overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700">
      <div className="flex flex-col bg-neutral-50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-8 dark:bg-neutral-500/5">
        <div>
          <Link href={'/orders/' + order.number} className="text-lg font-semibold">
            #{order.number}
          </Link>
          <p className="mt-1.5 text-sm text-neutral-500 sm:mt-2 dark:text-neutral-400">{order.status}</p>
        </div>
        <div className="mt-3 flex gap-x-1.5 sm:mt-0">
          <Button color="light" size="smaller" href={'/collections/all'}>
            Buy again
          </Button>
          <Button color="light" size="smaller" href={'/orders/' + order.number}>
            View order
          </Button>
        </div>
      </div>
      <div className="divide-y-neutral-200 divide-y border-t border-neutral-200 p-2 sm:p-8 dark:divide-neutral-700 dark:border-neutral-700">
        {order?.products?.map(({ id, featuredImage, price, handle, title, color, size, status, quantity }: any) => (
          <div key={id} className="flex py-4 first:pt-0 last:pb-0 sm:py-7">
            <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-xl bg-neutral-100 sm:w-20">
              <Image
                fill
                sizes="100px"
                src={featuredImage?.src || featuredImage}
                alt={featuredImage?.alt || title}
                className="h-full w-full object-cover object-center"
              />
            </div>

            <div className="ml-4 flex flex-1 flex-col">
              <div>
                <div className="flex justify-between">
                  <div>
                    <h3 className="line-clamp-1 text-base font-medium">{title}</h3>
                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                      <span>{color}</span>
                      <span className="mx-2 h-4 border-l border-neutral-200 dark:border-neutral-700"></span>
                      <span>{size}</span>
                    </p>
                  </div>
                  <Prices className="mt-0.5 ml-2" price={price || 0} />
                </div>
              </div>
              <div className="flex flex-1 items-end justify-between text-sm">
                <p className="flex items-center text-neutral-500 dark:text-neutral-400">
                  <span className="hidden sm:inline-block">Qty</span>
                  <span className="inline-block sm:hidden">x</span>
                  <span className="ml-2">{quantity}</span>
                </p>

                <div className="flex">
                  <Link href={'/products/' + handle} className="font-medium text-primary-600 dark:text-primary-500">
                    Leave review
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const Page = async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch orders for the current user
  const { data: dbOrders } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Map user database orders to local components structure
  const orders = (dbOrders || []).map((dbOrder: any) => ({
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
  }))

  return (
    <div className="flex flex-col gap-y-10 sm:gap-y-12">
      {/* HEADING */}
      <div>
        <h1 className="text-2xl font-semibold">Order history</h1>
        <p className="mt-4 text-neutral-500 dark:text-neutral-400">
          Check the status of recent orders, manage returns, and discover similar products.
        </p>
      </div>
      {orders.length === 0 ? (
        <div className="text-center py-10 text-neutral-500 dark:text-neutral-400">
          You have not placed any orders yet.
        </div>
      ) : (
        orders.map((order: any) => (
          <Order key={order.number} order={order} />
        ))
      )}
    </div>
  )
}

export default Page

