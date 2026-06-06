import { Metadata } from 'next'
import Image from 'next/image'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import InvoiceButtons from '@/components/InvoiceButtons'

export async function generateMetadata({ params }: { params: Promise<{ number: string }> }): Promise<Metadata> {
  const { number } = await params
  return {
    title: `Invoice #${number} - Thread & Love`,
    description: `Invoice for order #${number}`,
  }
}

const formatPrice = (val: number) => {
  return `₹${Math.round(val * 84).toLocaleString('en-IN')}`
}

export default async function InvoicePage({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params
  const supabase = await createClient()

  // Verify authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch the order (ensure it belongs to this user)
  const { data: dbOrder } = await supabase
    .from('orders')
    .select('*')
    .eq('number', number)
    .eq('user_id', user.id)
    .single()

  if (!dbOrder) {
    return notFound()
  }

  // Fetch customer profile details
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, address, email, phone_number')
    .eq('id', user.id)
    .single()

  const costs = {
    subtotal: Number(dbOrder.subtotal),
    shipping: Number(dbOrder.shipping),
    tax: Number(dbOrder.tax),
    total: Number(dbOrder.total),
    discount: Number(dbOrder.discount),
  }

  const items = dbOrder.items || []

  return (
    <div className="min-h-screen bg-neutral-50 py-10 print:bg-white print:py-0 dark:bg-neutral-900">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        
        {/* Top Control Bar - Hidden on print */}
        <div className="mb-6 flex items-center justify-between border-b border-neutral-200 pb-4 print:hidden dark:border-neutral-800">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">Order Invoice</h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Download or print this receipt for your records.</p>
          </div>
          <InvoiceButtons orderNumber={number} />
        </div>

        {/* Invoice Page Container */}
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm print:rounded-none print:border-none print:bg-white print:shadow-none dark:border-neutral-800 dark:bg-neutral-950">
          <div className="p-8 sm:p-12">
            
            {/* Header / Brand */}
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between border-b border-neutral-100 pb-8 dark:border-neutral-800">
              <div>
                <span className="font-serif text-3xl font-bold tracking-wide text-neutral-900 dark:text-white">
                  Thread & Love
                </span>
                <p className="mt-1 text-xs tracking-widest text-neutral-500 uppercase dark:text-neutral-400">
                  Handcrafted with ❤️
                </p>
                <div className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">
                  <p>threadandlove.in</p>
                  <p>orders@threadandlove.in</p>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <h2 className="text-2xl font-semibold tracking-tight text-neutral-950 dark:text-white uppercase">INVOICE</h2>
                <div className="mt-3 text-sm text-neutral-600 dark:text-neutral-400 space-y-1">
                  <p><span className="font-medium text-neutral-900 dark:text-white">Invoice No:</span> {number}</p>
                  <p><span className="font-medium text-neutral-900 dark:text-white">Date:</span> {dbOrder.date || 'N/A'}</p>
                  <p><span className="font-medium text-neutral-900 dark:text-white">Payment Method:</span> Razorpay Secure</p>
                  {dbOrder.razorpay_payment_id && (
                    <p><span className="font-medium text-neutral-900 dark:text-white">Transaction Ref:</span> <code className="text-xs">{dbOrder.razorpay_payment_id}</code></p>
                  )}
                </div>
              </div>
            </div>

            {/* Billing / Info Split */}
            <div className="grid grid-cols-1 gap-8 py-8 sm:grid-cols-2 border-b border-neutral-100 dark:border-neutral-800">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">Billed To</h3>
                <div className="mt-3 text-sm text-neutral-800 dark:text-neutral-200">
                  <p className="font-semibold text-neutral-950 dark:text-white">{profile?.full_name || user.email?.split('@')[0] || 'Customer'}</p>
                  <p className="mt-1 leading-relaxed text-neutral-600 dark:text-neutral-400 uppercase">
                    {profile?.address || 'No address provided'}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">Contact Details</h3>
                <div className="mt-3 text-sm text-neutral-600 dark:text-neutral-400 space-y-1">
                  <p><span className="font-medium text-neutral-900 dark:text-white">Email:</span> {profile?.email || user.email}</p>
                  {profile?.phone_number && (
                    <p><span className="font-medium text-neutral-900 dark:text-white">Phone:</span> {profile.phone_number}</p>
                  )}
                  <p><span className="font-medium text-neutral-900 dark:text-white">Status:</span> <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-900/30 dark:text-green-400">{dbOrder.status || 'Paid'}</span></p>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="py-8">
              <h3 className="sr-only">Line Items</h3>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 text-neutral-400 dark:border-neutral-800 dark:text-neutral-500">
                    <th className="py-3 font-semibold uppercase tracking-wider">Item Details</th>
                    <th className="py-3 text-center font-semibold uppercase tracking-wider">Qty</th>
                    <th className="py-3 text-right font-semibold uppercase tracking-wider">Price</th>
                    <th className="py-3 text-right font-semibold uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {items.map((item: any, idx: number) => {
                    const itemPrice = Number(item.price || 0)
                    const itemQuantity = Number(item.quantity || 1)
                    const itemImage = typeof item.image === 'string' ? item.image : item.image?.src || ''
                    return (
                      <tr key={item.id || idx}>
                        <td className="py-4">
                          <div className="flex items-center gap-4">
                            {itemImage && (
                              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border border-neutral-100 dark:border-neutral-800">
                                <Image
                                  src={itemImage}
                                  alt={item.name || 'Product'}
                                  fill
                                  sizes="48px"
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-neutral-950 dark:text-white">{item.name}</p>
                              {(item.color || item.size) && (
                                <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                                  {item.color ? `Color: ${item.color}` : ''}
                                  {item.color && item.size ? ' · ' : ''}
                                  {item.size ? `Size: ${item.size}` : ''}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-center text-neutral-600 dark:text-neutral-400 font-medium">
                          {itemQuantity}
                        </td>
                        <td className="py-4 text-right text-neutral-600 dark:text-neutral-400 font-medium">
                          {formatPrice(itemPrice)}
                        </td>
                        <td className="py-4 text-right font-semibold text-neutral-950 dark:text-white">
                          {formatPrice(itemPrice * itemQuantity)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="flex flex-col items-end border-t border-neutral-100 pt-8 dark:border-neutral-800">
              <div className="w-full sm:w-80 space-y-3 text-sm">
                
                <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                  <span>Subtotal</span>
                  <span className="font-medium text-neutral-900 dark:text-white">{formatPrice(costs.subtotal)}</span>
                </div>

                {costs.discount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Discount</span>
                    <span className="font-medium">−{formatPrice(costs.discount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                  <span>Shipping</span>
                  <span className="font-medium text-neutral-900 dark:text-white">
                    {costs.shipping > 0 ? formatPrice(costs.shipping) : 'Free'}
                  </span>
                </div>

                <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                  <span>Tax (GST)</span>
                  <span className="font-medium text-neutral-900 dark:text-white">{formatPrice(costs.tax)}</span>
                </div>

                <div className="border-t border-neutral-200 pt-3 dark:border-neutral-800">
                  <div className="flex justify-between text-base font-bold text-neutral-950 dark:text-white">
                    <span>Total Paid</span>
                    <span>{formatPrice(costs.total)}</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Invoice Footer Note */}
            <div className="mt-16 text-center border-t border-neutral-100 pt-8 dark:border-neutral-800">
              <p className="font-serif text-sm italic text-neutral-500 dark:text-neutral-400">
                Thank you for supporting our handmade business! ❤️
              </p>
              <p className="mt-2 text-xs text-neutral-400 dark:text-neutral-500">
                For queries regarding this invoice, contact support at orders@threadandlove.in
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
