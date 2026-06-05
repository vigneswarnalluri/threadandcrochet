import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body

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

    // Payment is verified — safe to mark as paid in DB
    // TODO: Update order status in Supabase orders table here if needed

    return NextResponse.json({
      verified: true,
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
      message: 'Payment verified successfully',
    })
  } catch (error: unknown) {
    console.error('Razorpay verify-payment error:', error)
    const message = error instanceof Error ? error.message : 'Verification failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
