'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateContactInfo(email: string, phoneNumber: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      email: email.trim(),
      phone_number: phoneNumber.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) {
    console.error('Failed to update profile contact info:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/(accounts)/orders/[number]', 'page')
  return { success: true }
}
