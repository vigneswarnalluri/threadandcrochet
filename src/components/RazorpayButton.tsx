'use client'

import { useRouter } from 'next/navigation'
import Script from 'next/script'
import { useState } from 'react'
import { CartItem } from '@/context/StoreContext'

interface RazorpayButtonProps {
  amount: number          // in USD dollars (will convert to paise for INR)
  currency?: string       // default 'INR'
  name?: string           // order description / customer name
  email?: string
  contact?: string
  prefillMethod?: string
  className?: string
  children?: React.ReactNode
  cartItems: CartItem[]
  costs: {
    subtotal: number
    shipping: number
    tax: number
    total: number
    discount: number
  }
  useStoreCredit?: boolean
  storeCreditAmount?: number
  discountCode?: string
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance
  }
}

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  prefill?: { name?: string; email?: string; contact?: string; method?: string }
  theme?: { color?: string }
  handler: (response: RazorpayResponse) => void
  modal?: {
    ondismiss?: () => void
  }
}

interface RazorpayResponse {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

interface RazorpayInstance {
  open(): void
  on(event: string, callback: (response: { error: { description: string } }) => void): void
}

export default function RazorpayButton({
  amount,
  currency = 'INR',
  name = '',
  email = '',
  contact = '',
  prefillMethod = '',
  className = '',
  children,
  cartItems,
  costs,
  useStoreCredit = false,
  storeCreditAmount = 0,
  discountCode = '',
}: RazorpayButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Convert USD to paise (1 USD ≈ 84 INR, 1 INR = 100 paise)
  // If already in INR paise pass amount directly; here we treat as USD and convert
  const amountInPaise = Math.max(100, Math.round(amount * 84 * 100))

  const handlePayment = async () => {
    setLoading(true)
    setError(null)

    try {
      // Step 1: Create order on backend
      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountInPaise,
          currency,
          receipt: `rcpt_${Date.now()}`,
        }),
      })

      if (!orderRes.ok) {
        const err = await orderRes.json()
        throw new Error(err.error || 'Failed to create order')
      }

      const { order_id, amount: orderAmount, currency: orderCurrency } = await orderRes.json()

      // Step 2: Open Razorpay checkout modal
      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: orderAmount,
        currency: orderCurrency,
        name: 'Thread & Love',
        description: 'Handcrafted Crochet Products',
        order_id,
        prefill: { name, email, contact, method: prefillMethod },
        theme: { color: '#b5836e' }, // brand warm terracotta colour
        handler: async (response: RazorpayResponse) => {
          // Step 3: Verify payment on backend
          const verifyRes = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              cartItems,
              costs,
              useStoreCredit,
              storeCreditAmount,
              discountCode,
            }),
          })

          const verifyData = await verifyRes.json()

          if (verifyData.verified) {
            // Payment successful — redirect with clean order number + payment ref separately
            const orderNum = verifyData.order_number || response.razorpay_payment_id
            router.push(`/order-successful?order_number=${orderNum}&payment_id=${response.razorpay_payment_id}`)
          } else {
            setError('Payment verification failed. Please contact support.')
            setLoading(false)
          }
        },
        modal: {
          ondismiss: () => {
            setError('Payment cancelled. You can try again.')
            setLoading(false)
          },
        },
      }

      const rzp = new window.Razorpay(options)

      // Handle payment failure event
      rzp.on('payment.failed', (response) => {
        setError(`Payment failed: ${response.error.description}`)
        setLoading(false)
      })

      rzp.open()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setError(message)
      setLoading(false)
    }
  }

  return (
    <>
      {/* Load Razorpay checkout script */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

      <div className="flex flex-col gap-2">
        <button
          id="razorpay-pay-button"
          onClick={handlePayment}
          disabled={loading}
          className={`flex w-full items-center justify-center rounded-full bg-neutral-900 px-6 py-4 text-sm font-medium tracking-wider text-white transition-colors duration-200 hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 ${className}`}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Processing…
            </span>
          ) : (
            children || 'Pay with Razorpay'
          )}
        </button>

        {error && (
          <p className="rounded-lg bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    </>
  )
}
