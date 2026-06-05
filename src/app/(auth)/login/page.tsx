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
  title: 'Login — Thread & Love',
  description: 'Login to your Thread & Love account',
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
  searchParams: Promise<{ error?: string; redirectedFrom?: string }>
}

const PageLogin = async ({ searchParams }: PageProps) => {
  const params = await searchParams
  const error = params.error
  const redirectedFrom = params.redirectedFrom

  const handleSubmit = async (formData: FormData) => {
    'use server'
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      redirect(`/login?error=${encodeURIComponent(error.message)}`)
    }

    redirect(redirectedFrom || '/account')
  }

  return (
    <div>
      <div className="container mb-24 lg:mb-32">
        <h1 className="my-20 flex items-center justify-center text-3xl leading-[115%] font-semibold text-neutral-900 md:text-5xl md:leading-[115%] dark:text-neutral-100">
          Login
        </h1>
        <div className="mx-auto flex max-w-md flex-col gap-y-6">
          <div className="grid gap-3">
            {loginSocials.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="flex w-full rounded-lg bg-primary-50 px-4 py-3 transition-transform hover:-translate-y-0.5 sm:px-6 dark:bg-neutral-800"
              >
                <Image className="size-5 shrink-0 object-cover" src={item.icon} alt={item.name} sizes="40px" />
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

          {/* FORM */}
          <Form action={handleSubmit}>
            <Fieldset>
              <FieldGroup className="sm:space-y-6">
                <Field>
                  <Label>Email</Label>
                  <Input type="email" name="email" placeholder="example@example.com" required />
                </Field>
                <Field>
                  <Label className="flex items-center justify-between gap-2">
                    <span>Password</span>
                    <Link className="text-sm font-normal text-primary-600" href="/forgot-password">
                      Forgot password?
                    </Link>
                  </Label>
                  <Input type="password" name="password" required />
                </Field>
                <ButtonPrimary className="mt-2 w-full" type="submit">
                  Continue
                </ButtonPrimary>
              </FieldGroup>
            </Fieldset>
          </Form>

          {/* ==== */}
          <span className="block text-center text-sm text-neutral-700 dark:text-neutral-300">
            New user? {` `}
            <Link className="text-primary-600 underline" href="/signup">
              Create an account
            </Link>
          </span>
        </div>
      </div>
    </div>
  )
}

export default PageLogin
