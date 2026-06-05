import facebookSvg from '@/images/socials/facebook-2.svg'
import googleSvg from '@/images/socials/google.svg'
import twitterSvg from '@/images/socials/twitter.svg'
import { createClient } from '@/utils/supabase/server'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { Field, FieldGroup, Fieldset, Label } from '@/shared/fieldset'
import { Input } from '@/shared/input'
import { Metadata } from 'next'
import Form from 'next/form'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Sign Up — Thread & Love',
  description: 'Create your Thread & Love account',
}

const loginSocials = [
  {
    name: 'Continue with Facebook',
    href: '#',
    icon: facebookSvg,
  },
  {
    name: 'Continue with Twitter',
    href: '#',
    icon: twitterSvg,
  },
  {
    name: 'Continue with Google',
    href: '#',
    icon: googleSvg,
  },
]

interface PageProps {
  searchParams: Promise<{ error?: string; message?: string }>
}

const PageSignUp = async ({ searchParams }: PageProps) => {
  const params = await searchParams
  const error = params.error
  const message = params.message

  const handleSubmit = async (formData: FormData) => {
    'use server'
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('full-name') as string

    const supabase = await createClient()

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
      redirect(`/signup?error=${encodeURIComponent(error.message)}`)
    }

    // Show confirmation message (email verification may be enabled)
    redirect('/signup?message=Check your email to confirm your account, then log in.')
  }

  return (
    <div className="container mb-24 lg:mb-32">
      <h1 className="my-20 flex items-center justify-center text-3xl leading-[115%] font-semibold text-neutral-900 md:text-5xl md:leading-[115%] dark:text-neutral-100">
        Sign up
      </h1>
      <div className="mx-auto max-w-md space-y-6">
        <div className="grid gap-3">
          {loginSocials.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className="flex w-full transform rounded-lg bg-primary-50 px-4 py-3 transition-transform hover:translate-y-[-2px] sm:px-6 dark:bg-neutral-800"
            >
              <Image sizes="40px" className="size-5 shrink-0 object-cover" src={item.icon} alt={item.name} />
              <h3 className="grow text-center text-sm font-medium text-neutral-700 sm:text-sm dark:text-neutral-300">
                {item.name}
              </h3>
            </a>
          ))}
        </div>

        {/* OR */}
        <div className="relative text-center">
          <span className="relative z-10 inline-block bg-white px-4 text-sm font-medium dark:bg-neutral-900 dark:text-neutral-400">
            OR
          </span>
          <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 transform border border-neutral-100 dark:border-neutral-800"></div>
        </div>

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
        <Form action={handleSubmit}>
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

              <ButtonPrimary className="mt-2 w-full" type="submit">
                Create account
              </ButtonPrimary>
            </FieldGroup>
          </Fieldset>
        </Form>

        {/* ==== */}
        <span className="block text-center text-sm text-neutral-700 dark:text-neutral-300">
          Already have an account? {` `}
          <Link className="text-primary-600 underline" href="/login">
            Sign in
          </Link>
        </span>
      </div>
    </div>
  )
}

export default PageSignUp
