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

export async function POST(request: NextRequest) {
  try {
    await authorizeAdmin()

    const body = await request.json()
    const { userId, amount, reason } = body

    if (!userId || amount === undefined || isNaN(Number(amount))) {
      return NextResponse.json({ error: 'User ID and numeric amount are required' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // Get current customer details
    const { data: profile, error: fetchErr } = await adminClient
      .from('profiles')
      .select('email, full_name, store_credit')
      .eq('id', userId)
      .single()

    if (fetchErr || !profile) {
      return NextResponse.json({ error: 'Customer profile not found' }, { status: 404 })
    }

    const currentCredit = Number(profile.store_credit || 0)
    const changeAmount = Number(amount)
    const newCredit = Math.max(0, currentCredit + changeAmount)

    const { error: updateErr } = await adminClient
      .from('profiles')
      .update({ store_credit: newCredit })
      .eq('id', userId)

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 400 })
    }

    // Log admin action
    const displayAction = changeAmount >= 0 ? 'issue_store_credit' : 'deduct_store_credit'
    await logAdminAction({
      action: displayAction,
      targetType: 'customers',
      targetId: userId,
      details: `${changeAmount >= 0 ? 'Added' : 'Deducted'} ₹${Math.abs(changeAmount * 84).toLocaleString('en-IN')} store credit. Reason: ${reason || 'No reason specified'}. Email: ${profile.email}`
    })

    return NextResponse.json({
      success: true,
      newCredit,
      message: `Adjusted store credit for ${profile.full_name || profile.email} successfully.`
    })
  } catch (err: any) {
    if (err.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (err.message === 'Forbidden') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
