'use client'

import NcInputNumber from '@/components/NcInputNumber'
import Prices from '@/components/Prices'
import { CartItem, useStore } from '@/context/StoreContext'
import Breadcrumb from '@/shared/Breadcrumb'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { CheckIcon } from '@heroicons/react/24/outline'
import { Coordinate01Icon, InformationCircleIcon, PaintBucketIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const CartPage = () => {
  const { cart, updateCartQuantity, removeFromCart, currency } = useStore()

  // Calculate order totals
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > 150 || subtotal === 0 ? 0 : 10
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  const renderStatusInstock = () => {
    return (
      <div className="flex items-center justify-center rounded-full border border-neutral-200 px-2.5 py-1.5 text-xs text-neutral-700 dark:border-neutral-700 dark:text-neutral-300">
        <CheckIcon className="h-3.5 w-3.5" />
        <span className="ml-1 leading-none">In Stock</span>
      </div>
    )
  }

  const renderProduct = (product: CartItem) => {
    const { image, price, name, productHandle, id, size, color, quantity } = product

    return (
      <div key={id} className="relative flex py-8 first:pt-0 last:pb-0 sm:py-10 xl:py-12">
        <div className="relative h-36 w-24 shrink-0 overflow-hidden rounded-xl bg-neutral-100 sm:w-32">
          {image?.src && (
            <Image
              fill
              src={image.src}
              alt={image.alt || name}
              sizes="300px"
              className="rounded-xl object-contain object-center"
              priority
            />
          )}
          <Link href={'/products/' + productHandle} className="absolute inset-0"></Link>
        </div>

        <div className="ml-3 flex flex-1 flex-col sm:ml-6">
          <div>
            <div className="flex justify-between">
              <div className="flex-[1.5]">
                <h3 className="text-base font-semibold">
                  <Link href={'/products/' + productHandle}>{name}</Link>
                </h3>
                <div className="mt-1.5 flex text-sm text-neutral-600 sm:mt-2.5 dark:text-neutral-300">
                  <div className="flex items-center gap-x-2">
                    <HugeiconsIcon icon={PaintBucketIcon} size={16} color="currentColor" strokeWidth={1.5} />
                    <span>{color || 'Default'}</span>
                  </div>
                  <span className="mx-4 border-l border-neutral-200 dark:border-neutral-700"></span>
                  <div className="flex items-center gap-x-2">
                    <HugeiconsIcon icon={Coordinate01Icon} size={16} color="currentColor" strokeWidth={1.5} />
                    <span>{size || 'Default'}</span>
                  </div>
                </div>

                <div className="mt-3 flex w-full justify-between sm:hidden">
                  <select
                    name="qty"
                    id={`qty-mobile-${id}`}
                    value={quantity}
                    onChange={(e) => updateCartQuantity(id, Number(e.target.value))}
                    className="form-select rounded-md bg-white px-2 py-1 text-xs outline-1 outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:bg-neutral-800"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                  <Prices contentClass="py-1 px-2 md:py-1.5 md:px-2.5 text-sm font-medium h-full" price={price || 0} />
                </div>
              </div>

              <div className="hidden text-center sm:block">
                <NcInputNumber defaultValue={quantity} onChange={(qty) => updateCartQuantity(id, qty)} />
              </div>

              <div className="hidden flex-1 justify-end sm:flex">
                <Prices price={price || 0} className="mt-0.5" />
              </div>
            </div>
          </div>

          <div className="mt-auto flex items-end justify-between pt-4 text-sm">
            {renderStatusInstock()}

            <button
              onClick={() => removeFromCart(id)}
              className="mt-3 flex items-center text-sm font-medium text-primary-600 hover:text-primary-500 cursor-pointer"
            >
              <span>Remove</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="nc-CartPage">
      <main className="container py-16 lg:pt-20 lg:pb-28">
        <div className="mb-12 sm:mb-16">
          <h2 className="block text-2xl font-semibold sm:text-3xl lg:text-4xl">Shopping Cart</h2>
          <Breadcrumb breadcrumbs={[{ id: 1, name: 'Home', href: '/' }]} currentPage="Shopping Cart" className="mt-5" />
        </div>

        <hr className="my-10 border-neutral-200 xl:my-12 dark:border-neutral-700" />

        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20">
            <h3 className="text-xl font-semibold">Your cart is empty</h3>
            <p className="mt-2 text-neutral-500 dark:text-neutral-400">
              Add items to your cart to see them here.
            </p>
            <ButtonPrimary href="/collections/all" className="mt-6">
              Continue Shopping
            </ButtonPrimary>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row">
            <div className="w-full divide-y divide-neutral-200 lg:w-[60%] xl:w-[55%] dark:divide-neutral-700">
              {cart.map(renderProduct)}
            </div>
            <div className="my-10 shrink-0 border-t border-neutral-200 lg:mx-10 lg:my-0 lg:border-t-0 lg:border-l xl:mx-16 2xl:mx-20 dark:border-neutral-700"></div>
            <div className="flex-1">
              <div className="sticky top-10">
                <h3 className="text-lg font-semibold">Order Summary</h3>
                <div className="mt-7 divide-y divide-neutral-200/70 text-sm text-neutral-500 dark:divide-neutral-700/80 dark:text-neutral-400">
                  <div className="flex justify-between pb-4">
                    <span>Subtotal</span>
                    <span className="font-semibold text-neutral-900 dark:text-neutral-200">
                      <Prices price={subtotal} plainText />
                    </span>
                  </div>
                  <div className="flex justify-between py-4">
                    <span>Shipping estimate</span>
                    <span className="font-semibold text-neutral-900 dark:text-neutral-200">
                      <Prices price={shipping} plainText />
                    </span>
                  </div>
                  <div className="flex justify-between py-4">
                    <span>Tax estimate</span>
                    <span className="font-semibold text-neutral-900 dark:text-neutral-200">
                      <Prices price={tax} plainText />
                    </span>
                  </div>
                  <div className="flex justify-between pt-4 text-base font-semibold text-neutral-900 dark:text-neutral-200">
                    <span>Order total</span>
                    <span>
                      <Prices price={total} plainText />
                    </span>
                  </div>
                </div>
                <ButtonPrimary href="/checkout" className="mt-8 w-full">
                  Checkout
                </ButtonPrimary>
                <div className="mt-5 flex items-center justify-center text-sm text-neutral-500 dark:text-neutral-400">
                  <p className="relative block pl-5">
                    <HugeiconsIcon
                      icon={InformationCircleIcon}
                      size={16}
                      color="currentColor"
                      className="absolute top-0.5 -left-1"
                      strokeWidth={1.5}
                    />
                    Learn more{` `}
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href="##"
                      className="font-medium text-neutral-900 underline dark:text-neutral-200"
                    >
                      Taxes
                    </a>
                    <span>
                      {` `}and{` `}
                    </span>
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href="##"
                      className="font-medium text-neutral-900 underline dark:text-neutral-200"
                    >
                      Shipping
                    </a>
                    {` `} information
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default CartPage
