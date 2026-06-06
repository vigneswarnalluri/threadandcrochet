import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, userEmail, currentPage, cartItemsCount } = body

    if (!sessionId || !currentPage) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // Upsert visitor session details
    const { error: upsertError } = await adminClient
      .from('storefront_visitors')
      .upsert({
        session_id: sessionId,
        user_email: userEmail || null,
        current_page: currentPage,
        cart_items_count: Number(cartItemsCount || 0),
        last_active_at: new Date().toISOString()
      })

    if (upsertError) {
      console.warn('Failed to upsert visitor details:', upsertError.message)
    }

    // Prune visitor sessions older than 5 minutes to keep DB clean
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    const { error: pruneError } = await adminClient
      .from('storefront_visitors')
      .delete()
      .lt('last_active_at', fiveMinutesAgo)

    if (pruneError) {
      console.warn('Failed to prune old visitor sessions:', pruneError.message)
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Visitor ping error:', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
