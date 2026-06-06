'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

interface InvoiceButtonsProps {
  orderNumber: string
}

export default function InvoiceButtons({ orderNumber }: InvoiceButtonsProps) {
  const router = useRouter()

  const handlePrint = () => {
    window.print()
  }

  const handleBack = () => {
    // Navigate back to the order detail page
    router.push(`/orders/${orderNumber}`)
  }

  return (
    <div className="flex gap-4 print:hidden">
      <button
        onClick={handleBack}
        className="flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm transition-all hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-4 w-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
          />
        </svg>
        Back to Order
      </button>

      <button
        onClick={handlePrint}
        className="flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-4 w-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.08.493a3 3 0 01-2.924 3.486H9.28a3 3 0 01-2.924-3.486l.08-.493m11.24 0a1.5 1.5 0 00-1.285-1.156 48.74 48.74 0 00-11.86 0 1.5 1.5 0 00-1.285 1.156m11.86 0v-2.25a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75M9 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 01.75.75v3.75M9 13.5h.008v.008H9V13.5zm3 0h.008v.008H12V13.5zm3 0h.008v.008H15V13.5z"
          />
        </svg>
        Print Invoice
      </button>
    </div>
  )
}
