import { createClient } from '@/utils/supabase/server'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { Field, FieldGroup, Fieldset, Label } from '@/shared/fieldset'
import { Input } from '@/shared/input'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Forgot Password — Thread & Love',
  description: 'Reset your Thread & Love account password',
}

interface PageProps {
  searchParams: Promise<{ message?: string; error?: string }>
}

const PageForgotPass = async ({ searchParams }: PageProps) => {
  const params = await searchParams
  const message = params.message
  const error = params.error

  const handleSubmit = async (formData: FormData) => {
    'use server'
    const email = formData.get('email') as string
    const supabase = await createClient()

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://relaxed-marigold-18353f.netlify.app'
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/account/update-password`,
    })

    if (error) {
      redirect(`/forgot-password?error=${encodeURIComponent(error.message)}`)
    }

    redirect('/forgot-password?message=Check your email for a password reset link.')
  }

  return (
    <div className="container mb-24 lg:mb-32">
      <header className="mx-auto mb-14 max-w-2xl text-center sm:mb-16 lg:mb-20">
        <h1 className="mt-20 flex items-center justify-center text-3xl leading-[1.15] font-semibold text-neutral-900 md:text-5xl md:leading-[1.15] dark:text-neutral-100">
          Forgot password
        </h1>
        <span className="mt-4 block text-sm text-neutral-700 sm:text-base dark:text-neutral-200">
          Enter your email address to reset your password
        </span>
      </header>

      <div className="mx-auto max-w-md space-y-6">

        {/* Error message */}
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Success message */}
        {message && (
          <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
            {message}
          </div>
        )}

        {/* FORM */}
        <form action={handleSubmit}>
          <Fieldset>
            <FieldGroup>
              <Field>
                <Label>Email address</Label>
                <Input type="email" name="email" placeholder="example@example.com" required />
              </Field>
              <ButtonPrimary className="w-full" type="submit">
                Send reset link
              </ButtonPrimary>
            </FieldGroup>
          </Fieldset>
        </form>

        {/* ==== */}
        <span className="block text-center text-sm text-neutral-700 dark:text-neutral-300">
          Go back for {` `}
          <Link href="/login" className="text-primary-600 underline">
            Sign in
          </Link>
          <span className="mx-1.5 text-neutral-300 dark:text-neutral-700">/</span>
          <Link href="/signup" className="text-primary-600 underline">
            Sign up
          </Link>
        </span>
      </div>
    </div>
  )
}

export default PageForgotPass
