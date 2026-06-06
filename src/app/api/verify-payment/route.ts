import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { sendOrderConfirmationEmail } from '@/lib/sendEmail'
import { createAdminClient } from '@/utils/supabase/admin'

// Generates a short unique order number like TL-A3F9K2 without needing a DB sequence
function generateOrderNumber(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no confusing O/0, I/1
  let suffix = ''
  for (let i = 0; i < 6; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)]
  }
  return `TL-${suffix}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, cartItems, costs, useStoreCredit, storeCreditAmount, discountCode } = body

    // Validate all required fields are present
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing required payment fields' },
        { status: 400 }
      )
    }

    // Generate expected signature: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const keySecret = process.env.RAZORPAY_KEY_SECRET!
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    // Compare signatures
    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: 'Payment signature verification failed', verified: false },
        { status: 400 }
      )
    }

    // Payment is verified — safe to write to DB
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'User session not found. Cannot save order.', verified: true },
        { status: 401 }
      )
    }

    // Fetch profile for email + address + blocked status
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email, phone_number, address, blocked')
      .eq('id', user.id)
      .single()

    if (profile?.blocked) {
      return NextResponse.json(
        { error: 'Your account has been blocked from placing orders. Please contact support.' },
        { status: 403 }
      )
    }

    const customerName = profile?.full_name || user.email?.split('@')[0] || 'Customer'
    const customerEmail = profile?.email || user.email || ''
    const orderDate = new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    // Generate a clean order number (no DB sequence needed)
    const orderNumber = generateOrderNumber()

    // Build the base order data — always works even without the razorpay_payment_id column
    const orderData: Record<string, any> = {
      user_id: user.id,
      number: orderNumber,
      date: orderDate,
      status: 'Paid',
      invoice_href: '#',
      total_quantity: cartItems ? cartItems.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0) : 0,
      subtotal: costs ? costs.subtotal : 0,
      shipping: costs ? costs.shipping : 0,
      tax: costs ? costs.tax : 0,
      total: costs ? costs.total : 0,
      discount: costs ? costs.discount : 0,
      items: cartItems || [],
    }

    // Try to add razorpay_payment_id if the column exists (added via migration)
    // If it doesn't exist yet, the insert still succeeds without it
    try {
      orderData.razorpay_payment_id = razorpay_payment_id
    } catch {
      // column not yet added — harmless
    }

    const { error: insertError } = await supabase
      .from('orders')
      .insert(orderData)

    if (insertError) {
      // If razorpay_payment_id column doesn't exist, retry without it
      if (insertError.message?.includes('razorpay_payment_id')) {
        console.warn('razorpay_payment_id column missing — retrying without it')
        delete orderData.razorpay_payment_id
        const { error: retryError } = await supabase.from('orders').insert(orderData)
        if (retryError) {
          console.error('Order insert retry failed:', retryError)
          return NextResponse.json({
            verified: true,
            payment_id: razorpay_payment_id,
            order_id: razorpay_order_id,
            message: 'Payment verified but order DB save failed.',
            error: retryError.message,
          }, { status: 500 })
        }
      } else {
        console.error('Error inserting order to Supabase:', insertError)
        return NextResponse.json({
          verified: true,
          payment_id: razorpay_payment_id,
          order_id: razorpay_order_id,
          message: 'Payment verified, but failed to save order to database.',
          error: insertError.message,
        }, { status: 500 })
      }
    }

    // Deduct applied store credit and devalue applied gift cards
    try {
      const adminClient = createAdminClient()
      if (useStoreCredit && storeCreditAmount > 0) {
        const { data: prof } = await adminClient
          .from('profiles')
          .select('store_credit')
          .eq('id', user.id)
          .single()
        if (prof) {
          const currentCredit = Number(prof.store_credit || 0)
          const newCredit = Math.max(0, currentCredit - Number(storeCreditAmount))
          await adminClient
            .from('profiles')
            .update({ store_credit: newCredit })
            .eq('id', user.id)
        }
      }

      if (discountCode) {
        const normalizedGC = discountCode.trim().toUpperCase()
        const { data: gc } = await adminClient
          .from('gift_cards')
          .select('balance')
          .eq('code', normalizedGC)
          .single()
        if (gc) {
          const currentBalance = Number(gc.balance || 0)
          const newBalance = Math.max(0, currentBalance - (costs?.discount || 0))
          await adminClient
            .from('gift_cards')
            .update({ balance: newBalance, active: newBalance > 0 })
            .eq('code', normalizedGC)
        }
      }
    } catch (deductionErr) {
      console.error('Failed to deduct store credit or gift card balance:', deductionErr)
    }

    // Decrement stock levels and log stock movements for purchased items
    try {
      const adminClient = createAdminClient()
      for (const item of (cartItems || [])) {
        const productId = item.productId || item.id
        if (productId) {
          const { data: prod } = await adminClient
            .from('products')
            .select('stock')
            .eq('id', productId)
            .single()
          
          if (prod) {
            const currentStock = prod.stock || 0
            const purchasedQty = Number(item.quantity || 1)
            const newStock = Math.max(0, currentStock - purchasedQty)
            
            await adminClient
              .from('products')
              .update({ stock: newStock })
              .eq('id', productId)
            
            // Insert stock log
            await adminClient
              .from('stock_logs')
              .insert({
                product_id: productId,
                change: -purchasedQty,
                reason: `Customer Purchase (Order #${orderNumber})`
              })
          }
        }
      }
    } catch (stockErr) {
      console.error('Failed to update stock levels on order placement:', stockErr)
    }

    // Insert admin notification for the new order
    try {
      const adminClient = createAdminClient()
      const formattedTotal = costs ? `₹${Math.round(costs.total * 84).toLocaleString('en-IN')}` : '₹0'
      await adminClient
        .from('notifications')
        .insert({
          type: 'new_order',
          message: `New Order ${orderNumber} placed by ${customerName} (${formattedTotal})`
        })
    } catch (e) {
      console.error('Failed to trigger notification for order:', e)
    }

    // Send order confirmation email — fully non-blocking, never kills the response
    console.log(`[Email] Sending confirmation to ${customerEmail} for order ${orderNumber}`)
    sendOrderConfirmationEmail({
      customerName,
      customerEmail,
      orderNumber,
      orderDate,
      items: cartItems || [],
      costs: {
        subtotal: costs?.subtotal || 0,
        shipping: costs?.shipping || 0,
        tax: costs?.tax || 0,
        discount: costs?.discount || 0,
        total: costs?.total || 0,
      },
      shippingAddress: profile?.address || undefined,
    }).then((result) => {
      if (result.success) {
        console.log(`[Email] ✅ Sent successfully, id: ${result.id}`)
      } else {
        console.error('[Email] ❌ Send failed:', result.error)
      }
    }).catch((err) => console.error('[Email] ❌ Exception:', err))

    return NextResponse.json({
      verified: true,
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
      order_number: orderNumber,
      message: 'Payment verified and order saved successfully',
    })
  } catch (error: unknown) {
    console.error('Razorpay verify-payment error:', error)
    const message = error instanceof Error ? error.message : 'Verification failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
