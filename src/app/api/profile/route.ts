import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, address, email')
      .eq('id', user.id)
      .single()

    return NextResponse.json({
      fullName: profile?.full_name || user.email?.split('@')[0] || 'Guest',
      address: profile?.address || '',
      email: profile?.email || user.email || '',
    })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
