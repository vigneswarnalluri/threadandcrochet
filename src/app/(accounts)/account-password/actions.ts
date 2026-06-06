'use server'

import { createClient } from '@/utils/supabase/server'

export async function changeUserPassword(currentPassword: string | null, newPassword: string) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const providers = user.app_metadata.providers || []
    const hasPassword = providers.includes('email')

    // If they have a password, we must verify the current password first
    if (hasPassword) {
      if (!currentPassword) {
        return { success: false, error: 'Current password is required.' }
      }

      // Verify the current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: currentPassword,
      })

      if (signInError) {
        return { success: false, error: 'Incorrect current password. Please try again.' }
      }
    }

    // Now update the password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    return { success: true }
  } catch (err: any) {
    console.error('Password change server error:', err)
    return { success: false, error: err.message || 'Server error' }
  }
}
