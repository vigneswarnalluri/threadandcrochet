'use client'

import { NotifyAddToCart } from '@/components/AddToCardButton'
import { TProductDetail } from '@/data/data'
import React from 'react'
import toast from 'react-hot-toast'
import { useStore } from '@/context/StoreContext'

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
    <form onSubmit={onFormSubmit} className={className}>
      {children}
    </form>
  )
}

export default ProductForm
