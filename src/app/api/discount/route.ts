import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// Fallback hardcoded discount codes (used if no DB table yet)
const FALLBACK_CODES: Record<string, { discount: number; type: 'percent' | 'fixed'; description: string }> = {
  WELCOME10: { discount: 10, type: 'percent', description: '10% off your order' },
  LOVE20: { discount: 20, type: 'percent', description: '20% off your order' },
  FLAT500: { discount: 500, type: 'fixed', description: '₹500 off your order' },
  FIRST15: { discount: 15, type: 'percent', description: '15% off for first-time buyers' },
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, subtotal } = body

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Invalid discount code' }, { status: 400 })
    }

    const normalizedCode = code.trim().toUpperCase()

    // Try fetching from Supabase DB first
    const supabase = await createClient()
    const { data: dbCode, error } = await supabase
      .from('discount_codes')
      .select('*')
      .eq('code', normalizedCode)
      .eq('active', true)
      .single()

    let discountInfo: { discount: number; type: 'percent' | 'fixed'; description: string } | null = null

    if (!error && dbCode) {
      discountInfo = {
        discount: dbCode.discount,
        type: dbCode.type,
        description: dbCode.description || `${dbCode.discount}${dbCode.type === 'percent' ? '%' : '₹'} off`,
      }
    } else {
      // Try fetching from gift_cards table
      const { data: dbGiftCard, error: gcError } = await supabase
        .from('gift_cards')
        .select('*')
        .eq('code', normalizedCode)
        .eq('active', true)
        .single()

      if (!gcError && dbGiftCard) {
        const expired = dbGiftCard.expires_at && new Date(dbGiftCard.expires_at).getTime() < Date.now()
        if (!expired && Number(dbGiftCard.balance) > 0) {
          discountInfo = {
            discount: Number(dbGiftCard.balance),
            type: 'fixed',
            description: `Gift Card Balance: ₹${Math.round(Number(dbGiftCard.balance) * 84).toLocaleString('en-IN')}`,
          }
        }
      }

      if (!discountInfo) {
        // Fall back to hardcoded codes
        discountInfo = FALLBACK_CODES[normalizedCode] || null
      }
    }

    if (!discountInfo) {
      return NextResponse.json({ valid: false, error: 'Invalid or expired discount code' }, { status: 404 })
    }

    // Calculate the actual discount amount
    const sub = Number(subtotal) || 0
    let discountAmount = 0
    if (discountInfo.type === 'percent') {
      discountAmount = (sub * discountInfo.discount) / 100
    } else {
      discountAmount = Math.min(discountInfo.discount, sub) // can't discount more than subtotal
    }

    return NextResponse.json({
      valid: true,
      code: normalizedCode,
      discountType: discountInfo.type,
      discountValue: discountInfo.discount,
      discountAmount: parseFloat(discountAmount.toFixed(2)),
      description: discountInfo.description,
    })
  } catch (err: unknown) {
    console.error('Discount validation error:', err)
    const message = err instanceof Error ? err.message : 'Failed to validate discount'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
