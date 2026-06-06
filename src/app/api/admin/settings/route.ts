import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { logAdminAction } from '@/utils/audit'

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

// GET: Fetch all store settings
export async function GET(request: NextRequest) {
  try {
    const adminClient = createAdminClient()
    const { data, error } = await adminClient
      .from('store_settings')
      .select('*')

    if (error) {
      return NextResponse.json({ success: true, settings: [] })
    }

    return NextResponse.json({ success: true, settings: data || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}

// POST: Upsert a store setting (admin only)
export async function POST(request: NextRequest) {
  try {
    await authorizeAdmin()
    const body = await request.json()
    const { key, value } = body

    if (!key) {
      return NextResponse.json({ error: 'Missing setting key' }, { status: 400 })
    }

    const adminClient = createAdminClient()
    const { data, error } = await adminClient
      .from('store_settings')
      .upsert({ key, value, updated_at: new Date().toISOString() })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Log admin action
    await logAdminAction({
      action: 'update_store_settings',
      targetType: 'settings',
      targetId: key,
      details: `Updated store setting key "${key}"`
    })

    return NextResponse.json({ success: true, setting: data })
  } catch (err: any) {
    if (err.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (err.message === 'Forbidden') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
