import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { sendSupportReplyEmail } from '@/lib/sendEmail'
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

// GET: Fetch all support tickets
export async function GET() {
  try {
    await authorizeAdmin()
    const adminClient = createAdminClient()

    const { data, error } = await adminClient
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, tickets: data || [] })
  } catch (err: any) {
    if (err.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (err.message === 'Forbidden') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}

// PUT: Update support ticket status / submit email reply
export async function PUT(request: NextRequest) {
  try {
    await authorizeAdmin()
    const body = await request.json()
    const { id, status, replyText } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing support ticket ID' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // 1. Fetch current ticket details
    const { data: ticket, error: fetchError } = await adminClient
      .from('support_tickets')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !ticket) {
      return NextResponse.json({ error: fetchError?.message || 'Ticket not found' }, { status: 404 })
    }

    // 2. If reply text is provided, dispatch the email
    let emailSent = false
    if (replyText && replyText.trim()) {
      const emailResult = await sendSupportReplyEmail({
        customerName: ticket.name,
        customerEmail: ticket.email,
        originalMessage: ticket.message,
        replyText: replyText.trim()
      })
      if (!emailResult.success) {
        console.error('Email sending failed in support API:', emailResult.error)
      } else {
        emailSent = true
      }
    }

    // 3. Update the database record
    const updateData: any = {}
    if (status) updateData.status = status
    if (replyText) updateData.reply_body = replyText

    const { data: updatedTicket, error: updateError } = await adminClient
      .from('support_tickets')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 })
    }

    // Log admin action
    await logAdminAction({
      action: 'update_support_ticket',
      targetType: 'support_ticket',
      targetId: id,
      details: `Updated ticket status to "${status || 'Unchanged'}"${replyText ? ' and sent email response' : ''}. Customer: ${ticket.email}`
    })

    return NextResponse.json({ success: true, ticket: updatedTicket, emailSent })
  } catch (err: any) {
    if (err.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (err.message === 'Forbidden') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
