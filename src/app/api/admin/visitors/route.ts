import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

async function authorizeAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    throw new Error('Forbidden')
  }
}

export async function GET(request: NextRequest) {
  try {
    await authorizeAdmin()

    const adminClient = createAdminClient()
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString()

    const { data: visitors, error } = await adminClient
      .from('storefront_visitors')
      .select('*')
      .gte('last_active_at', oneMinuteAgo)
      .order('last_active_at', { ascending: false })

    if (error) {
      // Return empty list if table not migrated yet
      console.warn('Failed to query storefront_visitors (table might not exist):', error.message)
      return NextResponse.json({ success: true, visitors: [] })
    }

    return NextResponse.json({ success: true, visitors: visitors || [] })
  } catch (err: any) {
    if (err.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (err.message === 'Forbidden') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
