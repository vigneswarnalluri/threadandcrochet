import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { sendCartRecoveryEmail } from '@/lib/sendEmail'
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
    const { userId, couponCode, customMessage } = body

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // 1. Fetch user profile
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('full_name, email')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Customer profile not found' }, { status: 404 })
    }

    if (!profile.email) {
      return NextResponse.json({ error: 'Customer email is not registered' }, { status: 400 })
    }

    // 2. Fetch cart items
    const { data: cartItems, error: cartError } = await adminClient
      .from('cart_items')
      .select('*')
      .eq('user_id', userId)

    if (cartError || !cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'No items in customer cart' }, { status: 404 })
    }

    // 3. Resolve products in the cart to fetch images and prices
    const productIds = Array.from(new Set(cartItems.map(item => item.product_id)))
    const { data: products } = await adminClient
      .from('products')
      .select('id, title, price, featured_image')
      .in('id', productIds)

    const productsMap = new Map(products?.map(p => [p.id, p]) || [])

    const emailItems = cartItems.map(item => {
      const prod = productsMap.get(item.product_id)
      return {
        title: prod ? prod.title : 'Artisanal Product',
        quantity: Number(item.quantity || 1),
        price: prod ? Number(prod.price) : 0,
        size: item.size || undefined,
        color: item.color || undefined,
        image: prod?.featured_image?.src || undefined
      }
    })

    // 4. Send email via Resend helper
    const emailResult = await sendCartRecoveryEmail({
      customerName: profile.full_name || 'Valued Customer',
      customerEmail: profile.email,
      items: emailItems,
      couponCode: couponCode || undefined,
      customMessage: customMessage || undefined
    })

    if (!emailResult.success) {
      return NextResponse.json({ error: 'Failed to send recovery email via Resend' }, { status: 502 })
    }

    // 5. Log admin action
    await logAdminAction({
      action: 'send_recovery_email',
      targetType: 'customer',
      targetId: profile.email,
      details: `Sent cart recovery email with ${emailItems.length} items. Coupon: ${couponCode || 'None'}. Message: ${customMessage || 'Standard'}`
    })

    return NextResponse.json({ success: true, message: 'Recovery email sent successfully', emailId: emailResult.id })
  } catch (err: any) {
    if (err.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (err.message === 'Forbidden') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
