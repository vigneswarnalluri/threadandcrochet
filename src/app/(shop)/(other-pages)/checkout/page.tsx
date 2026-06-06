'use client'

import NcInputNumber from '@/components/NcInputNumber'
import Prices from '@/components/Prices'
import RazorpayButton from '@/components/RazorpayButton'
import { CartItem, useStore } from '@/context/StoreContext'
import Breadcrumb from '@/shared/Breadcrumb'
import { Field, Label } from '@/shared/fieldset'
import { Input } from '@/shared/input'
import { Link } from '@/shared/link'
import { Coordinate01Icon, InformationCircleIcon, PaintBucketIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Image from 'next/image'
import Information from './Information'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

const CheckoutPage = () => {
  const { cart, updateCartQuantity, removeFromCart, user, loading, currency } = useStore()
  const router = useRouter()
  const [profileIncomplete, setProfileIncomplete] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [methodActive, setMethodActive] = useState<'Credit-Card' | 'UPI' | 'Internet-banking' | 'Wallet'>('Credit-Card')
  const [discountCode, setDiscountCode] = useState('')
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; amount: number; description: string } | null>(null)
  const [discountError, setDiscountError] = useState('')
  const [discountLoading, setDiscountLoading] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirectedFrom=/checkout')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetch('/api/profile')
        .then((res) => {
          if (!res.ok) return null
          return res.json()
        })
        .then((data) => {
          if (data) {
            setProfile(data)
            if (!data.address || !data.phoneNumber) {
              setProfileIncomplete(true)
            } else {
              setProfileIncomplete(false)
            }
          }
        })
        .catch(() => {})
    }
  }, [user])

  // Calculate order totals
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > 150 || subtotal === 0 ? 0 : 10
  const tax = subtotal * 0.08
  const discountAmount = appliedDiscount?.amount || 0
  const total = subtotal + shipping + tax - discountAmount

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <svg className="h-8 w-8 animate-spin text-neutral-500" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const onSubmitFormDiscountCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!discountCode.trim()) return
    setDiscountLoading(true)
    setDiscountError('')
    setAppliedDiscount(null)
    try {
      const res = await fetch('/api/discount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: discountCode.trim(), subtotal }),
      })
      const data = await res.json()
      if (res.ok && data.valid) {
        setAppliedDiscount({ code: data.code, amount: data.discountAmount, description: data.description })
        toast.success(`Discount applied: ${data.description}`)
      } else {
        setDiscountError(data.error || 'Invalid code')
      }
    } catch {
      setDiscountError('Failed to apply discount. Please try again.')
    } finally {
      setDiscountLoading(false)
    }
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
              className="object-contain object-center"
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

                <div className="relative mt-3 flex w-full justify-between sm:hidden">
                  <select
                    name="qty"
                    id={`qty-checkout-mobile-${id}`}
                    value={quantity}
                    onChange={(e) => updateCartQuantity(id, Number(e.target.value))}
                    className="form-select relative z-10 rounded-md bg-white px-2 py-1 text-xs outline-1 outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:bg-neutral-800"
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

              <div className="hidden flex-1 justify-end sm:flex">
                <Prices price={price || 0} className="mt-0.5" />
              </div>
            </div>
          </div>

          <div className="mt-auto flex items-end justify-between pt-4 text-sm">
            <div className="hidden sm:block">
              <NcInputNumber
                className="relative z-10"
                defaultValue={quantity}
                onChange={(qty) => updateCartQuantity(id, qty)}
              />
            </div>
            <button
              onClick={() => removeFromCart(id)}
              className="relative z-10 mt-3 flex items-center text-sm font-medium text-primary-600 hover:text-primary-500 cursor-pointer"
            >
              <span>Remove</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="container py-16 lg:pt-20 lg:pb-28">
      <div className="mb-16">
        <h1 className="mb-5 block text-3xl font-semibold lg:text-4xl">Checkout</h1>
        <Breadcrumb
          breadcrumbs={[
            { id: 1, name: 'Home', href: '/' },
            { id: 2, name: 'Cart', href: '/cart' },
          ]}
          currentPage="Checkout"
        />
      </div>

      {profileIncomplete && (
        <div className="mb-8 rounded-lg bg-orange-50 border border-orange-200 p-4 text-sm text-orange-800 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-400 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={InformationCircleIcon} size={20} className="text-orange-600 dark:text-orange-400" />
            <span>Please complete your account profile details (address and phone number) before checkout.</span>
          </div>
          <Link href="/account" className="font-semibold underline hover:text-orange-950 dark:hover:text-orange-300">
            Go to Account Details
          </Link>
        </div>
      )}

      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20">
          <h3 className="text-xl font-semibold">Your cart is empty</h3>
          <p className="mt-2 text-neutral-500 dark:text-neutral-400">
            Cannot checkout with an empty cart.
          </p>
          <ButtonPrimary href="/collections/all" className="mt-6">
            Go to Shop
          </ButtonPrimary>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row">
          <div className="flex-1">
            <Information methodActive={methodActive} setMethodActive={setMethodActive} />
          </div>

          <div className="my-10 shrink-0 border-t lg:mx-10 lg:my-0 lg:border-t-0 lg:border-l xl:lg:mx-14 2xl:mx-16" />

          <div className="w-full lg:w-[36%]">
            <h3 className="text-lg font-semibold">Order summary</h3>
            <div className="mt-8 divide-y divide-neutral-200/70 dark:divide-neutral-700">
              {cart.map(renderProduct)}
            </div>

            <div className="mt-10 border-t border-neutral-200/70 pt-6 text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
              <form onSubmit={onSubmitFormDiscountCode}>
                <Field>
                  <Label className="text-sm">Discount code</Label>
                  <div className="mt-1.5 flex gap-3">
                    <Input
                      className="flex-1"
                      name="discount-code"
                      value={discountCode}
                      onChange={(e) => {
                        setDiscountCode(e.target.value)
                        if (appliedDiscount) { setAppliedDiscount(null) }
                        if (discountError) { setDiscountError('') }
                      }}
                      placeholder="e.g. WELCOME10"
                    />
                    <button
                      type="submit"
                      disabled={discountLoading}
                      className="flex w-24 items-center justify-center rounded-full border bg-neutral-50 font-medium text-neutral-800 hover:bg-neutral-100 disabled:opacity-50 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
                    >
                      {discountLoading ? '...' : 'Apply'}
                    </button>
                  </div>
                  {discountError && (
                    <p className="mt-1.5 text-xs text-red-500">{discountError}</p>
                  )}
                  {appliedDiscount && (
                    <p className="mt-1.5 text-xs text-green-600 dark:text-green-400">
                      ✓ {appliedDiscount.description} — code <strong>{appliedDiscount.code}</strong>
                    </p>
                  )}
                </Field>
              </form>

              <div className="mt-4 flex justify-between py-2.5">
                <span>Subtotal</span>
                <span className="font-semibold text-neutral-900 dark:text-neutral-200">
                  <Prices price={subtotal} plainText />
                </span>
              </div>
              <div className="flex justify-between py-2.5">
                <span>Shipping estimate</span>
                <span className="font-semibold text-neutral-900 dark:text-neutral-200">
                  <Prices price={shipping} plainText />
                </span>
              </div>
              <div className="flex justify-between py-2.5">
                <span>Tax estimate</span>
                <span className="font-semibold text-neutral-900 dark:text-neutral-200">
                  <Prices price={tax} plainText />
                </span>
              </div>
              {appliedDiscount && (
                <div className="flex justify-between py-2.5 text-green-600 dark:text-green-400">
                  <span>Discount ({appliedDiscount.code})</span>
                  <span className="font-semibold">- <Prices price={discountAmount} plainText /></span>
                </div>
              )}
              <div className="flex justify-between pt-4 text-base font-semibold text-neutral-900 dark:text-neutral-200">
                <span>Order total</span>
                <span>
                  <Prices price={total} plainText />
                </span>
              </div>
            </div>

            {/* Razorpay Payment Button */}
            <div className="mt-8">
              {profileIncomplete ? (
                <ButtonPrimary
                  className="w-full font-medium"
                  onClick={() => {
                    toast.error('Please complete your profile details first.')
                    router.push('/account')
                  }}
                >
                  Complete Profile to Pay
                </ButtonPrimary>
              ) : (
                <RazorpayButton
                  amount={total}
                  name={profile?.fullName || ''}
                  email={profile?.email || user?.email || ''}
                  contact={profile?.phoneNumber || ''}
                  prefillMethod={
                    {
                      'Credit-Card': 'card',
                      'UPI': 'upi',
                      'Internet-banking': 'netbanking',
                      'Wallet': 'wallet',
                    }[methodActive]
                  }
                  cartItems={cart}
                  costs={{ subtotal, shipping, tax, total, discount: discountAmount }}
                >
                  Confirm order &amp; Pay {
                    currency === 'INR'
                      ? `₹${Math.round(total * 84).toLocaleString('en-IN')}`
                      : `$${total.toFixed(2)}`
                  }
                </RazorpayButton>
              )}
            </div>

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
                <Link
                  target="_blank"
                  rel="noopener noreferrer"
                  href="#"
                  className="font-medium text-neutral-900 underline dark:text-neutral-200"
                >
                  Taxes
                </Link>
                <span>
                  {` `}and{` `}
                </span>
                <Link
                  target="_blank"
                  rel="noopener noreferrer"
                  href="#"
                  className="font-medium text-neutral-900 underline dark:text-neutral-200"
                >
                  Shipping
                </Link>
                {` `} information
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default CheckoutPage
