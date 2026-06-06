'use client'

import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import ButtonThird from '@/shared/Button/ButtonThird'
import { Checkbox, CheckboxField } from '@/shared/checkbox'
import { DescriptionDetails, DescriptionList, DescriptionTerm } from '@/shared/description-list'
import { Field, FieldGroup, Fieldset, Label, Legend } from '@/shared/fieldset'
import { Subheading } from '@/shared/heading'
import { Input } from '@/shared/input'
import { Radio, RadioField, RadioGroup } from '@/shared/radio'
import { Select } from '@/shared/select'
import { QrCodeIcon } from '@heroicons/react/24/outline'
import {
  CreditCardIcon,
  CreditCardPosIcon,
  InternetIcon,
  Route02Icon,
  Tick02Icon,
  UserCircle02Icon,
  Wallet03Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon, IconSvgElement } from '@hugeicons/react'
import clsx from 'clsx'
import Link from 'next/link'
import { useState, useEffect } from 'react'

type Tab = 'ContactInfo' | 'ShippingAddress' | 'PaymentMethod' | null

interface InformationProps {
  methodActive: 'Credit-Card' | 'UPI' | 'Internet-banking' | 'Wallet'
  setMethodActive: (method: 'Credit-Card' | 'UPI' | 'Internet-banking' | 'Wallet') => void
}

const Information = ({ methodActive, setMethodActive }: InformationProps) => {
  const [tabActive, setTabActive] = useState<Tab>('ShippingAddress')
  const [profile, setProfile] = useState<any>(null)

  const handleScrollToEl = (id: string) => {
    const element = document.getElementById(id)
    setTimeout(() => {
      element?.scrollIntoView({ behavior: 'smooth' })
    }, 80)
  }

  const refreshProfile = () => {
    fetch('/api/profile')
      .then((res) => {
        if (!res.ok) return null
        return res.json()
      })
      .then((data) => {
        if (data) {
          setProfile(data)
        }
      })
      .catch(() => {})
  }

  useEffect(() => {
    refreshProfile()
  }, [])

  return (
    <div className="space-y-6 sm:space-y-8">
      <div id="ContactInfo" className="scroll-mt-5 rounded-xl border">
        <TabHeader
          title="Contact information"
          icon={UserCircle02Icon}
          value={profile ? `${profile.fullName} / ${profile.phoneNumber || 'No phone number'}` : 'Loading...'}
          onClickChange={() => {
            setTabActive('ContactInfo')
            handleScrollToEl('ContactInfo')
          }}
        />
        <div className={clsx('border-t px-4 py-7 sm:px-6', tabActive !== 'ContactInfo' && 'invisible hidden')}>
          <ContactInfo
            profile={profile}
            refreshProfile={refreshProfile}
            onClose={() => {
              setTabActive('ShippingAddress')
              handleScrollToEl('ShippingAddress')
            }}
          />
        </div>
      </div>

      <div id="ShippingAddress" className="scroll-mt-5 rounded-xl border">
        <TabHeader
          title="Shipping address"
          icon={Route02Icon}
          value={profile ? (profile.address || 'No address provided') : 'Loading...'}
          onClickChange={() => {
            setTabActive('ShippingAddress')
            handleScrollToEl('ShippingAddress')
          }}
        />
        <div className={clsx('border-t px-4 py-7 sm:px-6', tabActive !== 'ShippingAddress' && 'invisible hidden')}>
          <ShippingAddress
            profile={profile}
            refreshProfile={refreshProfile}
            onClose={() => {
              setTabActive('PaymentMethod')
              handleScrollToEl('PaymentMethod')
            }}
          />
        </div>
      </div>

      <div id="PaymentMethod" className="scroll-mt-5 rounded-xl border">
        <TabHeader
          title="Payment method"
          icon={CreditCardPosIcon}
          value={
            methodActive === 'Credit-Card'
              ? 'Debit / Credit Card'
              : methodActive === 'UPI'
              ? 'UPI / QR Code (Google Pay, PhonePe, Paytm)'
              : methodActive === 'Internet-banking'
              ? 'Internet banking'
              : 'Wallets (PhonePe, Paytm, etc.)'
          }
          onClickChange={() => {
            setTabActive('PaymentMethod')
            handleScrollToEl('PaymentMethod')
          }}
        />
        <div className={clsx('border-t px-4 py-7 sm:px-6', tabActive !== 'PaymentMethod' && 'invisible hidden')}>
          <PaymentMethod
            methodActive={methodActive}
            setMethodActive={setMethodActive}
            onConfirm={() => {
              setTabActive(null)
            }}
            onClose={() => {
              setTabActive('ShippingAddress')
              handleScrollToEl('ShippingAddress')
            }}
          />
        </div>
      </div>
    </div>
  )
}

const TabHeader = ({
  title,
  icon,
  value,
  onClickChange,
}: {
  title: string
  icon: IconSvgElement
  value: string
  onClickChange: () => void
}) => {
  return (
    <div className="flex flex-col items-start gap-5 p-5 sm:flex-row sm:p-6">
      <HugeiconsIcon icon={icon} size={24} className="sm:mt-1.5" />
      <div className="sm:pl-3">
        <h3 className="flex items-center gap-3 text-neutral-700 dark:text-neutral-400">
          <span className="tracking-tight uppercase">{title}</span>
          <HugeiconsIcon icon={Tick02Icon} size={24} className="mb-1 text-primary-500" />
        </h3>
        <div className="mt-1 text-sm font-semibold">{value}</div>
      </div>
      <button
        className="rounded-lg bg-neutral-50 px-4 py-2 text-sm font-medium hover:bg-neutral-100 sm:ml-auto dark:bg-neutral-800 dark:hover:bg-neutral-700"
        onClick={onClickChange}
        type="button"
      >
        Change
      </button>
    </div>
  )
}

const ContactInfo = ({
  profile,
  refreshProfile,
  onClose,
}: {
  profile: any
  refreshProfile: () => void
  onClose: () => void
}) => {
  return (
    <form
      action="#"
      method="POST"
      onSubmit={async (e) => {
        e.preventDefault()
        const formData = new FormData(e.target as HTMLFormElement)
        const email = formData.get('email') as string
        const phoneNumber = formData.get('phone') as string

        try {
          const res = await fetch('/api/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, phoneNumber }),
          })
          if (res.ok) {
            refreshProfile()
          } else {
            console.error('Failed to update contact info in Supabase')
          }
        } catch (err) {
          console.error('Error updating contact info:', err)
        }
        onClose()
      }}
    >
      <Fieldset>
        <FieldGroup className="mt-0!">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-lg font-semibold">Contact infomation</h3>
          </div>
          <Field className="max-w-lg">
            <Label>Your phone number *</Label>
            <Input defaultValue={profile?.phoneNumber || ''} type="tel" name="phone" placeholder="+91" required />
          </Field>
          <Field className="max-w-lg">
            <Label>Email address *</Label>
            <Input defaultValue={profile?.email || ''} type="email" name="email" placeholder="example@example.com" required />
          </Field>
          <Field>
            <CheckboxField>
              <Checkbox name="newsletter" defaultChecked />
              <Label>Email me news and offers</Label>
            </CheckboxField>
          </Field>

          {/* ============ */}
          <div className="flex flex-wrap gap-2.5 pt-4">
            <ButtonPrimary type="submit">Next to shipping address</ButtonPrimary>
            <ButtonThird type="button" onClick={onClose}>
              Cancel
            </ButtonThird>
          </div>
        </FieldGroup>
      </Fieldset>
    </form>
  )
}

const ShippingAddress = ({
  profile,
  refreshProfile,
  onClose,
}: {
  profile: any
  refreshProfile: () => void
  onClose: () => void
}) => {
  const firstName = profile?.fullName?.split(' ')[0] || ''
  const lastName = profile?.fullName?.split(' ').slice(1).join(' ') || ''

  return (
    <form
      action="#"
      method="POST"
      onSubmit={async (e) => {
        e.preventDefault()
        const formData = new FormData(e.target as HTMLFormElement)
        const fName = formData.get('first-name') as string
        const lName = formData.get('last-name') as string
        const fullName = `${fName} ${lName}`.trim()

        const street = formData.get('address') as string
        const aptSuite = formData.get('apt-suite') as string
        const city = formData.get('city') as string
        const country = formData.get('country') as string
        const state = formData.get('state-province') as string
        const zip = formData.get('postal-code') as string

        const fullAddress = `${street}${aptSuite ? ', ' + aptSuite : ''}, ${city}, ${state} ${zip}, ${country}`

        try {
          const res = await fetch('/api/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullName, address: fullAddress }),
          })
          if (res.ok) {
            refreshProfile()
          } else {
            console.error('Failed to update shipping address in Supabase')
          }
        } catch (err) {
          console.error('Error updating shipping address:', err)
        }
        onClose()
      }}
    >
      <Fieldset>
        <FieldGroup className="mt-0!">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-4">
            <Field>
              <Label>First name *</Label>
              <Input defaultValue={firstName} name="first-name" placeholder="First Name" required />
            </Field>
            <Field>
              <Label>Last name *</Label>
              <Input defaultValue={lastName} name="last-name" placeholder="Last Name" required />
            </Field>
          </div>

          {/* ============ */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-4">
            <Field className="sm:col-span-2">
              <Label>Address *</Label>
              <Input placeholder="Enter your full street address" defaultValue={profile?.address || ''} type={'text'} name="address" required />
            </Field>
            <Field>
              <Label>Apt, Suite</Label>
              <Input defaultValue="" placeholder="Apt, Suite" name="apt-suite" />
            </Field>
          </div>

          {/* ============ */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-4">
            <Field>
              <Label>City *</Label>
              <Input defaultValue="" placeholder="City" name="city" required />
            </Field>
            <Field>
              <Label>Country *</Label>
              <Select defaultValue="India" name="country" required>
                <option value="India">India</option>
                <option value="United States">United States</option>
                <option value="Canada">Canada</option>
                <option value="Mexico">Mexico</option>
                <option value="Israel">Israel</option>
                <option value="France">France</option>
                <option value="England">England</option>
                <option value="Laos">Laos</option>
                <option value="China">China</option>
              </Select>
            </Field>
            <Field>
              <Label>State/Province *</Label>
              <Input defaultValue="" placeholder="State/Province" name="state-province" required />
            </Field>
            <Field>
              <Label>Postal code *</Label>
              <Input defaultValue="" placeholder="Postal Code" name="postal-code" required />
            </Field>
          </div>

          <Field className="max-w-lg">
            <Legend>Address type</Legend>
            <RadioGroup
              className="mt-1.5 grid grid-cols-1 gap-2 space-y-0! sm:grid-cols-2 sm:gap-3"
              name="address-type"
              defaultValue="at-home"
              aria-label="Address type"
            >
              <RadioField>
                <Label>
                  <span className="text-sm font-medium">
                    Home <span className="font-light">(All Day Delivery)</span>
                  </span>
                </Label>
                <Radio value="at-home" defaultChecked />
              </RadioField>

              <RadioField>
                <Label>
                  <span className="text-sm font-medium">
                    Office{' '}
                    <span className="font-light">
                      (Delivery <span className="font-medium">9 AM - 5 PM</span>)
                    </span>
                  </span>
                </Label>
                <Radio value="at-office" />
              </RadioField>
            </RadioGroup>
          </Field>

          {/* ============ */}
          <div className="flex flex-wrap gap-2.5 pt-6">
            <ButtonPrimary type="submit">Next to payment method</ButtonPrimary>
            <ButtonThird type="button" onClick={onClose}>
              Cancel
            </ButtonThird>
          </div>
        </FieldGroup>
      </Fieldset>
    </form>
  )
}

const PaymentMethod = ({
  methodActive,
  setMethodActive,
  onConfirm,
  onClose,
}: {
  methodActive: 'Credit-Card' | 'UPI' | 'Internet-banking' | 'Wallet'
  setMethodActive: (method: 'Credit-Card' | 'UPI' | 'Internet-banking' | 'Wallet') => void
  onConfirm: () => void
  onClose: () => void
}) => {
  const renderDebitCredit = () => {
    const active = methodActive === 'Credit-Card'
    return (
      <div>
        <RadioGroup
          name="payment-method"
          aria-label="Payment method"
          onChange={(e) => setMethodActive(e as any)}
          value={methodActive}
        >
          <RadioField className="sm:gap-x-6">
            <Radio className="pt-3" value="Credit-Card" defaultChecked={active} />
            <Label className="flex items-center gap-x-4 sm:gap-x-6">
              <div
                className={clsx(
                  'rounded-xl border-2 border-neutral-600 p-2.5 dark:border-neutral-300',
                  active ? 'opacity-100' : 'opacity-25'
                )}
              >
                <HugeiconsIcon icon={CreditCardIcon} size={24} />
              </div>
              <p className="font-medium sm:text-base">Debit / Credit Card</p>
            </Label>
          </RadioField>
        </RadioGroup>

        <div className={clsx('py-6 sm:pl-10', active ? 'block' : 'hidden')}>
          <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
            Pay securely using Visa, Mastercard, RuPay, Maestro, or American Express cards via Razorpay.
          </p>
        </div>
      </div>
    )
  }

  const renderUPI = () => {
    const active = methodActive === 'UPI'
    return (
      <div>
        <RadioGroup
          name="payment-method"
          aria-label="Payment method"
          value={methodActive}
          onChange={(e) => setMethodActive(e as any)}
        >
          <RadioField className="sm:gap-x-6">
            <Radio className="pt-3" value="UPI" defaultChecked={active} />
            <Label className="flex items-center gap-x-4 sm:gap-x-6">
              <div
                className={clsx(
                  'rounded-xl border-2 border-neutral-600 p-2.5 dark:border-neutral-300',
                  active ? 'opacity-100' : 'opacity-25'
                )}
              >
                <QrCodeIcon className="h-6 w-6 text-neutral-800 dark:text-neutral-200" strokeWidth={1.5} />
              </div>
              <p className="font-medium sm:text-base">UPI (Google Pay, PhonePe, Paytm, BHIM)</p>
            </Label>
          </RadioField>
        </RadioGroup>

        <div className={clsx('py-6 sm:pl-10', active ? 'block' : 'hidden')}>
          <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
            Pay instantly using your preferred UPI app (Google Pay, PhonePe, Paytm, BHIM) or by scanning a QR code.
          </p>
        </div>
      </div>
    )
  }

  const renderInterNetBanking = () => {
    const active = methodActive === 'Internet-banking'
    return (
      <div>
        <RadioGroup
          name="payment-method"
          aria-label="Payment method"
          onChange={(e) => setMethodActive(e as any)}
          value={methodActive}
        >
          <RadioField className="sm:gap-x-6">
            <Radio className="pt-3" value="Internet-banking" defaultChecked={active} />
            <Label className="flex items-center gap-x-4 sm:gap-x-6">
              <div
                className={clsx(
                  'rounded-xl border-2 border-neutral-600 p-2.5 dark:border-neutral-300',
                  active ? 'opacity-100' : 'opacity-25'
                )}
              >
                <HugeiconsIcon icon={InternetIcon} size={24} />
              </div>
              <p className="font-medium sm:text-base">Internet banking</p>
            </Label>
          </RadioField>
        </RadioGroup>

        <div className={clsx('py-6 sm:pl-10', active ? 'block' : 'hidden')}>
          <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
            Pay securely using Netbanking from HDFC, SBI, ICICI, Axis, or any other major bank.
          </p>
        </div>
      </div>
    )
  }

  const renderWallet = () => {
    const active = methodActive === 'Wallet'
    return (
      <div>
        <RadioGroup
          name="payment-method"
          aria-label="Payment method"
          value={methodActive}
          onChange={(e) => setMethodActive(e as any)}
        >
          <RadioField className="sm:gap-x-6">
            <Radio className="pt-3" value="Wallet" defaultChecked={active} />
            <Label className="flex items-center gap-x-4 sm:gap-x-6">
              <div
                className={clsx(
                  'rounded-xl border-2 border-neutral-600 p-2.5 dark:border-neutral-300',
                  active ? 'opacity-100' : 'opacity-25'
                )}
              >
                <HugeiconsIcon icon={Wallet03Icon} size={24} />
              </div>
              <p className="font-medium sm:text-base">Wallets (PhonePe, Paytm, Amazon Pay, Mobikwik, etc.)</p>
            </Label>
          </RadioField>
        </RadioGroup>

        <div className={clsx('py-6 sm:pl-10', active ? 'block' : 'hidden')}>
          <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
            Pay using major digital wallets like Paytm, PhonePe, Amazon Pay, Mobikwik, Airtel Money, or JioMoney.
          </p>
        </div>
      </div>
    )
  }

  return (
    <form
      action="#"
      method="POST"
      onSubmit={(e) => {
        e.preventDefault()
        const formValues = Object.fromEntries(new FormData(e.target as HTMLFormElement))
        console.log(formValues)
        onConfirm()
      }}
    >
      <Fieldset>
        <FieldGroup className="mt-0!">
          {renderDebitCredit()}
          {renderUPI()}
          {renderInterNetBanking()}
          {renderWallet()}

          <div className="flex flex-wrap gap-2.5 pt-4">
            <ButtonPrimary className="min-w-56" type="submit">
              Confirm order
            </ButtonPrimary>
            <ButtonThird type="button" onClick={onClose}>
              Back to shipping address
            </ButtonThird>
          </div>
        </FieldGroup>
      </Fieldset>
    </form>
  )
}

export default Information
