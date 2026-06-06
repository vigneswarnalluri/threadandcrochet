import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { sendOrderStatusUpdateEmail } from '@/lib/sendEmail'
import { logAdminAction } from '@/utils/audit'

// Valid order status transitions
const VALID_STATUSES = ['Paid', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded']

export async function POST(request: NextRequest) {
  try {
    // 1. Verify session & admin role using the user-scoped client
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    }

    // 2. Validate inputs
    const body = await request.json()
    const { orderNumber, status, carrier, trackingNumber } = body

    if (!orderNumber || !status) {
      return NextResponse.json({ error: 'Missing orderNumber or status' }, { status: 400 })
    }

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      )
    }

    // 3. Perform the update using the admin client (bypasses RLS so it can update any user's order)
    const adminClient = createAdminClient()

    // Build update payload
    const updatePayload: Record<string, any> = { status }
    if (carrier !== undefined) updatePayload.carrier = carrier
    if (trackingNumber !== undefined) updatePayload.tracking_number = trackingNumber

    const { data: updatedOrder, error } = await adminClient
      .from('orders')
      .update(updatePayload)
      .eq('number', orderNumber)
      .select()
      .maybeSingle()

    if (error) {
      if (!error.message?.includes('updated_at')) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    }

    if (!updatedOrder) {
      return NextResponse.json(
        { error: `Order ${orderNumber} not found` },
        { status: 404 }
      )
    }

    await logAdminAction({
      action: 'update_order_status',
      targetType: 'order',
      targetId: orderNumber,
      details: `Updated status to ${status}${carrier ? ` via ${carrier}` : ''}${trackingNumber ? ` (Tracking: ${trackingNumber})` : ''}`
    })

    // 4. Send order status email notifications asynchronously (Resend)
    const { data: customerProfile } = await adminClient
      .from('profiles')
      .select('full_name, email, address')
      .eq('id', updatedOrder.user_id)
      .single()

    if (customerProfile) {
      try {
        await sendOrderStatusUpdateEmail({
          customerName: customerProfile.full_name || 'Customer',
          customerEmail: customerProfile.email || '',
          orderNumber: updatedOrder.number,
          orderDate: updatedOrder.date || new Date(updatedOrder.created_at).toLocaleDateString(),
          status: updatedOrder.status,
          items: updatedOrder.items || [],
          costs: {
            subtotal: Number(updatedOrder.subtotal),
            shipping: Number(updatedOrder.shipping),
            tax: Number(updatedOrder.tax),
            discount: Number(updatedOrder.discount),
            total: Number(updatedOrder.total),
          },
          carrier: updatedOrder.carrier || undefined,
          trackingNumber: updatedOrder.tracking_number || undefined,
          shippingAddress: customerProfile.address || undefined,
        })
      } catch (emailErr) {
        console.error('Failed to send status update email:', emailErr)
      }
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: `Order ${orderNumber} status updated to ${status}`,
    })
  } catch (err: unknown) {
    console.error('Admin update-order-status error:', err)
    const message = err instanceof Error ? err.message : 'Failed to update order'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// GET: list all orders (admin only)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    }

    const adminClient = createAdminClient()
    const { searchParams } = new URL(request.url)
    const statusFilter = searchParams.get('status')
    const limit = Number(searchParams.get('limit') || 50)

    let query = adminClient
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (statusFilter) {
      query = query.eq('status', statusFilter)
    }

    const { data: orders, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ orders, total: orders?.length || 0 })
  } catch (err: unknown) {
    console.error('Admin list-orders error:', err)
    const message = err instanceof Error ? err.message : 'Failed to list orders'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
