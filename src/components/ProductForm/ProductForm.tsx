'use client'

import { NotifyAddToCart } from '@/components/AddToCardButton'
import { TProductDetail } from '@/data/data'
import React from 'react'
import toast from 'react-hot-toast'
import { useStore } from '@/context/StoreContext'
import { useProductColor } from './ProductColorContext'
import clsx from 'clsx'

const ProductForm = ({
  children,
  className,
  product,
}: {
  children?: React.ReactNode
  className?: string
  product: TProductDetail
}) => {
  const { featuredImage, title, price } = product
  const { addToCart } = useStore()

  // Try to use shared context.
  let contextValue: { selectedSize: string } | null = null
  try {
    contextValue = useProductColor()
  } catch {
    contextValue = null
  }
  const selectedSize = contextValue?.selectedSize || ''

  // Determine if selected size is out of stock
  const sizeOptionValues = product.options?.find((o) => o.name === 'Size')?.optionValues || []
  const currentSizeOption = sizeOptionValues.find((v) => v.name === selectedSize)
  const isOutOfStock = currentSizeOption && currentSizeOption.stock === 0

  const notifyAddTocart = (quantity: number, size: string, color: string) => {
    toast.custom(
      (t) => (
        <NotifyAddToCart
          show={t.visible}
          imageUrl={featuredImage?.src || ''}
          quantity={quantity}
          size={size}
          color={color}
          title={title!}
          price={price!}
        />
      ),
      { position: 'top-right', id: 'nc-product-notify', duration: 4000 }
    )
  }

  const onFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isOutOfStock) {
      toast.error('This size is currently out of stock')
      return
    }

    const formData = new FormData(e.currentTarget)
    const formObjectEntries = Object.fromEntries(formData.entries())
    const quantity = formData.get('quantity') ? Number(formData.get('quantity')) : 1
    const size = formData.get('size') ? String(formData.get('size')) : ''
    const color = formData.get('color') ? String(formData.get('color')) : ''

    await addToCart(product, quantity, size, color)
    notifyAddTocart(quantity, size, color)

    console.log('Form submitted with data:', {
      productId: product.id,
      quantity,
      size,
      color,
      formObjectEntries,
    })
  }

  return (
    <form onSubmit={onFormSubmit} className={clsx(className, isOutOfStock && 'product-form-outofstock')}>
      <style>{`
        .product-form-outofstock button[type="submit"] {
          opacity: 0.55 !important;
          pointer-events: none !important;
          cursor: not-allowed !important;
        }
      `}</style>
      {children}
    </form>
  )
}

export default ProductForm
