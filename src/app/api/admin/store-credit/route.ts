import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'
import { logAdminAction } from '@/utils/audit'

async function authorizeAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (!profile || profile.role !== 'admin') throw new Error('Forbidden')
}

// POST: Adjust a customer's store credit
export async function POST(request: NextRequest) {
  try {
    await authorizeAdmin()
    const body = await request.json()
    const { userId, amount, reason } = body

    if (!userId || amount === undefined) {
      return NextResponse.json({ error: 'userId and amount are required' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // Fetch current store_credit
    const { data: profile, error: fetchError } = await adminClient
      .from('profiles')
      .select('store_credit, email')
      .eq('id', userId)
      .single()

    if (fetchError || !profile) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    const currentCredit = Number(profile.store_credit || 0)
    const newCredit = Math.max(0, currentCredit + Number(amount))

    const { data: updated, error: updateError } = await adminClient
      .from('profiles')
      .update({ store_credit: newCredit, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select('store_credit')
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 })
    }

    await logAdminAction({
      action: 'adjust_store_credit',
      targetType: 'customer',
      targetId: userId,
      details: `Adjusted store credit by ${amount > 0 ? '+' : ''}${amount} (New total: ₹${newCredit}). Reason: ${reason || 'Admin adjustment'}. Email: ${profile.email}`,
    })

    return NextResponse.json({ success: true, newCredit: updated?.store_credit ?? newCredit })
  } catch (err: any) {
    if (err.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (err.message === 'Forbidden') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}

// GET: Get store credit for a customer
export async function GET(request: NextRequest) {
  try {
    await authorizeAdmin()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

    const adminClient = createAdminClient()
    const { data, error } = await adminClient
      .from('profiles')
      .select('store_credit')
      .eq('id', userId)
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ success: true, storeCredit: data?.store_credit || 0 })
  } catch (err: any) {
    if (err.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (err.message === 'Forbidden') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
