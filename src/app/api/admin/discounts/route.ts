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

// POST: Create a new discount code (admin only)
export async function POST(request: NextRequest) {
  try {
    await authorizeAdmin()
    const body = await request.json()
    const { code, discount, type, description } = body

    if (!code || discount === undefined || !type) {
      return NextResponse.json({ error: 'Missing required coupon fields (code, discount, type)' }, { status: 400 })
    }

    if (type !== 'percent' && type !== 'fixed') {
      return NextResponse.json({ error: 'Invalid coupon type. Must be percent or fixed.' }, { status: 400 })
    }

    const normalizedCode = code.trim().toUpperCase()
    const adminClient = createAdminClient()

    const { data, error } = await adminClient
      .from('discount_codes')
      .insert({
        code: normalizedCode,
        discount: Number(discount),
        type,
        description: description || `${discount}${type === 'percent' ? '%' : '₹'} off your order`,
        active: true
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Log admin action
    await logAdminAction({
      action: 'create_discount_code',
      targetType: 'coupon',
      targetId: normalizedCode,
      details: `Created coupon "${normalizedCode}" (${discount}${type === 'percent' ? '%' : '₹'} off)`
    })

    return NextResponse.json({ success: true, discount: data })
  } catch (err: any) {
    if (err.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (err.message === 'Forbidden') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}

// DELETE: Remove a discount code (admin only)
export async function DELETE(request: NextRequest) {
  try {
    await authorizeAdmin()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing coupon ID' }, { status: 400 })
    }

    const adminClient = createAdminClient()
    const { error } = await adminClient
      .from('discount_codes')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Log admin action
    await logAdminAction({
      action: 'delete_discount_code',
      targetType: 'coupon',
      targetId: id,
      details: `Deleted coupon ID: ${id}`
    })

    return NextResponse.json({ success: true, message: 'Coupon deleted successfully' })
  } catch (err: any) {
    if (err.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (err.message === 'Forbidden') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
