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

// GET: List all gift cards
export async function GET(request: NextRequest) {
  try {
    await authorizeAdmin()

    const adminClient = createAdminClient()
    const { data: giftCards, error } = await adminClient
      .from('gift_cards')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('Failed to query gift_cards (table might not exist):', error.message)
      return NextResponse.json({ success: true, giftCards: [] })
    }

    return NextResponse.json({ success: true, giftCards: giftCards || [] })
  } catch (err: any) {
    if (err.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (err.message === 'Forbidden') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}

// POST: Generate a new gift card
export async function POST(request: NextRequest) {
  try {
    await authorizeAdmin()

    const body = await request.json()
    let { code, balance, expiresAt } = body

    if (!balance || isNaN(Number(balance)) || Number(balance) <= 0) {
      return NextResponse.json({ error: 'Valid initial balance is required' }, { status: 400 })
    }

    // Auto-generate code if not provided
    if (!code || typeof code !== 'string' || !code.trim()) {
      const rand = () => Math.random().toString(36).substring(2, 6).toUpperCase()
      code = `GC-${rand()}-${rand()}`
    } else {
      code = code.trim().toUpperCase()
    }

    const adminClient = createAdminClient()
    const { data: giftCard, error } = await adminClient
      .from('gift_cards')
      .insert({
        code,
        balance: Number(balance),
        initial_balance: Number(balance),
        active: true,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Log admin action
    await logAdminAction({
      action: 'generate_gift_card',
      targetType: 'coupons',
      targetId: giftCard.id,
      details: `Generated gift card code "${code}" with balance ₹${balance}`
    })

    return NextResponse.json({ success: true, giftCard })
  } catch (err: any) {
    if (err.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (err.message === 'Forbidden') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}

// DELETE: Deactivate a gift card
export async function DELETE(request: NextRequest) {
  try {
    await authorizeAdmin()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing gift card ID' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // Retrieve code first for logging
    const { data: gc } = await adminClient.from('gift_cards').select('code').eq('id', id).single()

    const { error } = await adminClient
      .from('gift_cards')
      .update({ active: false })
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Log admin action
    await logAdminAction({
      action: 'deactivate_gift_card',
      targetType: 'coupons',
      targetId: id,
      details: `Deactivated gift card code "${gc?.code || id}"`
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    if (err.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (err.message === 'Forbidden') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
