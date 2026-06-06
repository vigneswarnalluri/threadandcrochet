'use client'

import facebookSvg from '@/images/socials/facebook-2.svg'
import googleSvg from '@/images/socials/google.svg'
import twitterSvg from '@/images/socials/twitter.svg'
import { createClient } from '@/utils/supabase/client'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { Field, FieldGroup, Fieldset, Label } from '@/shared/fieldset'
import { Input } from '@/shared/input'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import React, { useState, Suspense } from 'react'
import toast from 'react-hot-toast'

const loginSocials = [
  {
    name: 'Continue with Facebook',
    icon: facebookSvg,
  },
  {
    name: 'Continue with Twitter',
    icon: twitterSvg,
  },
  {
    name: 'Continue with Google',
    icon: googleSvg,
  },
]

function SignupFormClient() {
  const searchParams = useSearchParams()
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'facebook' | 'twitter' | 'email' | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(searchParams.get('error'))
  const [successMsg, setSuccessMsg] = useState<string | null>(searchParams.get('message'))

  const supabase = createClient()

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'twitter') => {
    setLoadingProvider(provider)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/`,
        },
      })

      if (error) {
        setErrorMsg(error.message)
        toast.error(error.message)
        setLoadingProvider(null)
      }
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message || 'Social login failed')
      setLoadingProvider(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoadingProvider('email')
    setErrorMsg(null)
    setSuccessMsg(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('full-name') as string

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || email.split('@')[0],
          },
        },
      })

      if (error) {
        setErrorMsg(error.message)
        toast.error(error.message)
        setLoadingProvider(null)
        return
      }

      setSuccessMsg('Check your email to confirm your account, then log in.')
      toast.success('Please check your email to confirm your account.')
      setLoadingProvider(null)
    } catch (err: any) {
      setErrorMsg(err.message || 'Sign up failed')
      setLoadingProvider(null)
    }
  }

  const isAnyLoading = loadingProvider !== null

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="grid gap-3">
        {loginSocials.map((item, index) => {
          let provider: 'google' | 'facebook' | 'twitter' = 'google'
          if (item.name.toLowerCase().includes('facebook')) provider = 'facebook'
          if (item.name.toLowerCase().includes('twitter')) provider = 'twitter'

          const isThisLoading = loadingProvider === provider

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleSocialLogin(provider)}
              disabled={isAnyLoading}
              className="flex w-full cursor-pointer items-center rounded-lg bg-primary-50 px-4 py-3 transition-transform hover:-translate-y-0.5 sm:px-6 dark:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Image className="size-5 shrink-0 object-cover" src={item.icon} alt={item.name} sizes="40px" />
              <h3 className="grow text-center text-sm font-medium text-neutral-700 sm:text-sm dark:text-neutral-300">
                {isThisLoading ? 'Connecting...' : item.name}
              </h3>
            </button>
          )
        })}
      </div>

      {/* OR */}
      <div className="relative text-center">
        <span className="relative z-10 inline-block bg-white px-4 text-sm font-medium dark:bg-neutral-900 dark:text-neutral-400">
          OR
        </span>
        <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 transform border border-neutral-100 dark:border-neutral-800"></div>
      </div>

      {/* Error message */}
      {errorMsg && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
          {errorMsg}
        </div>
      )}

      {/* Success message */}
      {successMsg && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
          {successMsg}
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSubmit}>
        <Fieldset>
          <FieldGroup className="sm:space-y-6">
            <Field>
              <Label>Full name</Label>
              <Input type="text" name="full-name" placeholder="Your name" />
            </Field>
            <Field>
              <Label>Email</Label>
              <Input type="email" name="email" placeholder="example@example.com" required />
            </Field>
            <Field>
              <Label>Password</Label>
              <Input type="password" name="password" minLength={6} required />
            </Field>

            <ButtonPrimary className="mt-2 w-full" type="submit" disabled={isAnyLoading}>
              {loadingProvider === 'email' ? 'Please wait...' : 'Create account'}
            </ButtonPrimary>
          </FieldGroup>
        </Fieldset>
      </form>

      {/* ==== */}
      <span className="block text-center text-sm text-neutral-700 dark:text-neutral-300">
        Already have an account? {` `}
        <Link className="text-primary-600 underline" href="/login">
          Sign in
        </Link>
      </span>
    </div>
  )
}

const PageSignUp = () => {
  return (
    <div className="container mb-24 lg:mb-32">
      <h1 className="my-20 flex items-center justify-center text-3xl leading-[115%] font-semibold text-neutral-900 md:text-5xl md:leading-[115%] dark:text-neutral-100">
        Sign up
      </h1>
      <Suspense fallback={
        <div className="flex items-center justify-center py-20">
          <svg className="h-8 w-8 animate-spin text-neutral-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      }>
        <SignupFormClient />
      </Suspense>
    </div>
  )
}

export default PageSignUp
