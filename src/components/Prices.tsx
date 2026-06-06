'use client'

import clsx from 'clsx'
import { FC } from 'react'
import { useStore } from '@/context/StoreContext'

export interface PricesProps {
  className?: string
  price: number
  contentClass?: string
  plainText?: boolean
}

const Prices: FC<PricesProps> = ({
  className,
  price,
  contentClass = 'py-1 px-2 md:py-1.5 md:px-2.5 text-sm font-medium',
  plainText = false,
}) => {
  const { currency } = useStore()

  const formatPrice = (val: number) => {
    if (currency === 'INR') {
      return `₹${Math.round(val * 84).toLocaleString('en-IN')}`
    }
    return `$${val.toFixed(2)}`
  }

  if (plainText) {
    return <span className={className}>{formatPrice(price)}</span>
  }

  return (
    <div className={clsx(className)}>
      <div className={`flex items-center rounded-lg border-2 border-green-500 ${contentClass}`}>
        <span className="leading-none! text-green-500">{formatPrice(price)}</span>
      </div>
    </div>
  )
}

export default Prices
