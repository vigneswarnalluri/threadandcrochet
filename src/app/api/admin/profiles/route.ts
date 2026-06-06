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

// PUT: Update customer user role (admin only)
export async function PUT(request: NextRequest) {
  try {
    await authorizeAdmin()
    const body = await request.json()
    const { userId, role, blocked } = body

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    const updateData: any = { updated_at: new Date().toISOString() }

    if (role !== undefined) {
      if (role !== 'admin' && role !== 'user') {
        return NextResponse.json({ error: 'Invalid role. Must be admin or user.' }, { status: 400 })
      }
      updateData.role = role
    }

    if (blocked !== undefined) {
      updateData.blocked = !!blocked
    }

    const adminClient = createAdminClient()
    const { data, error } = await adminClient
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Log admin action
    await logAdminAction({
      action: 'update_customer_profile',
      targetType: 'customer',
      targetId: userId,
      details: `Updated customer profile. Role: ${role !== undefined ? role : 'Unchanged'}, Blocked: ${blocked !== undefined ? blocked : 'Unchanged'}. Email: ${data.email || 'N/A'}`
    })

    return NextResponse.json({ success: true, profile: data })
  } catch (err: any) {
    if (err.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (err.message === 'Forbidden') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
