import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, message } = body

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields (name, email, or message)' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // 1. Insert the support ticket
    const { data: ticket, error: ticketError } = await adminClient
      .from('support_tickets')
      .insert({
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        status: 'New'
      })
      .select()
      .single()

    if (ticketError) {
      console.error('Database error saving support ticket:', ticketError)
      return NextResponse.json({ error: ticketError.message }, { status: 400 })
    }

    // 2. Create an admin notification
    const { error: notifError } = await adminClient
      .from('notifications')
      .insert({
        type: 'new_ticket',
        message: `New support ticket from ${name.trim()} (${email.trim()})`
      })

    if (notifError) {
      console.error('Error creating admin notification for support ticket:', notifError)
    }

    return NextResponse.json({ success: true, ticket })
  } catch (err: any) {
    console.error('Contact form submission API error:', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
