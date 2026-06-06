'use client'

import { useStore } from '@/context/StoreContext'
import { useEffect } from 'react'

export default function ClearCart() {
  const { clearCart } = useStore()

  useEffect(() => {
    clearCart()
  }, [])

  return null
}
