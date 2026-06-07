'use client'

import React, { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { createClient } from '@/utils/supabase/client'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { Field, FieldGroup, Fieldset, Label } from '@/shared/fieldset'
import { Input } from '@/shared/input'
import { ShieldCheckIcon } from '@heroicons/react/24/outline'

function AdminLoginFormClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const errorParam = searchParams.get('error')

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(
    errorParam === 'Access Denied' ? 'Access Denied: You do not have administrator privileges.' : null
  )

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      // 1. Authenticate user
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        setErrorMsg(error.message)
        toast.error(error.message)
        setLoading(false)
        return
      }

      const user = data.user
      if (!user) {
        setErrorMsg('Authentication failed')
        setLoading(false)
        return
      }

      // 2. Fetch profile to check role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profileError || !profile || profile.role !== 'admin') {
        // Sign out immediately
        await supabase.auth.signOut()
        setErrorMsg('Access Denied: You do not have administrator privileges.')
        toast.error('Access Denied: Admin role required.')
        setLoading(false)
        return
      }

      toast.success('Welcome to the Admin Portal!')
      sessionStorage.removeItem('__tl_profile')
      window.location.href = '/admin'
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed')
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-y-6">
      {/* Error message */}
      {errorMsg && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {errorMsg}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Fieldset>
          <FieldGroup className="space-y-4 sm:space-y-5">
            <Field>
              <Label className="text-neutral-700 dark:text-neutral-300">Admin Email</Label>
              <Input
                type="email"
                name="email"
                placeholder="admin@threadandcrochet.com"
                required
                className="w-full bg-white dark:bg-neutral-800"
              />
            </Field>
            <Field>
              <Label className="text-neutral-700 dark:text-neutral-300">Password</Label>
              <Input
                type="password"
                name="password"
                required
                className="w-full bg-white dark:bg-neutral-800"
              />
            </Field>
            <ButtonPrimary
              className="mt-6 w-full py-3 bg-neutral-900 hover:bg-neutral-850 dark:bg-primary-600 dark:hover:bg-primary-500"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Secure Login'}
            </ButtonPrimary>
          </FieldGroup>
        </Fieldset>
      </form>

      <div className="text-center">
        <Link
          href="/"
          className="text-sm text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors"
        >
          &larr; Back to home store
        </Link>
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4 sm:px-6 lg:px-8 dark:bg-neutral-950">
      <div className="w-full max-w-md space-y-8 p-8 sm:p-10 bg-white rounded-3xl border border-neutral-200 dark:border-neutral-850 dark:bg-neutral-900/40 shadow-xl dark:shadow-2xl/10 backdrop-blur-md">
        <div className="flex flex-col items-center text-center">
          <div className="rounded-2xl bg-neutral-950 p-3 text-primary-500 dark:bg-neutral-800/60 dark:text-primary-400 mb-4 ring-4 ring-neutral-100 dark:ring-neutral-900">
            <ShieldCheckIcon className="h-8 w-8 text-neutral-200 dark:text-white" aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-3xl">
            Admin Portal
          </h2>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            Secure administrative control console
          </p>
        </div>

        <Suspense fallback={
          <div className="flex items-center justify-center py-20">
            <svg className="h-8 w-8 animate-spin text-neutral-500" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        }>
          <AdminLoginFormClient />
        </Suspense>
      </div>
    </div>
  )
}
