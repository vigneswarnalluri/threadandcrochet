import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import PasswordForm from './PasswordForm'

export const metadata = {
  title: 'Account - Password',
  description: 'Account - Password page',
}

const Page = async () => {
  const supabase = await createClient()

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const providers = user.app_metadata.providers || []
  const hasPassword = providers.includes('email')

  return (
    <div className="flex flex-col gap-y-10 sm:gap-y-12">
      {/* HEADING */}
      <div>
        <h1 className="text-2xl font-semibold">Update your password</h1>
        <p className="mt-4 text-neutral-500 dark:text-neutral-400">Update your password to keep your account secure.</p>
      </div>

      <PasswordForm hasPassword={hasPassword} />
    </div>
  )
}

export default Page
