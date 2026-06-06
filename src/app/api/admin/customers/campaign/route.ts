import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { Resend } from 'resend'
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
    const { emails, subject, body: emailBody } = body

    if (!emails || !Array.isArray(emails) || emails.length === 0 || !subject || !emailBody) {
      return NextResponse.json({ error: 'Missing emails, subject, or email body' }, { status: 400 })
    }

    const resend = new Resend(process.env.RESEND_API_KEY)
    const from = 'Thread & Love <onboarding@resend.dev>'
    const isSandbox = from.includes('resend.dev')
    const testEmail = process.env.RESEND_TEST_EMAIL || 'r.crochet18@gmail.com'

    console.log(`[Campaign] Triggering bulk campaign for ${emails.length} recipients...`)

    // Send emails
    const sendPromises = emails.map(async (email) => {
      const recipient = isSandbox ? testEmail : email
      const finalSubject = isSandbox 
        ? `[TEST CAMPAIGN] ${subject} (→ ${email})` 
        : subject

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; rounded: 8px;">
          <div style="text-align: center; border-bottom: 2px solid #b5836e; padding-bottom: 20px; margin-bottom: 20px;">
            <h1 style="color: #b5836e; margin: 0;">Thread & Love</h1>
            <p style="font-size: 14px; color: #777; margin: 5px 0 0 0;">Handmade Crochet Boutique</p>
          </div>
          <div style="line-height: 1.6; color: #333;">
            ${emailBody.replace(/\n/g, '<br />')}
          </div>
          <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; text-align: center; font-size: 12px; color: #999;">
            <p>You are receiving this email because you registered on Thread & Love.</p>
            <p>&copy; ${new Date().getFullYear()} Thread & Love. All rights reserved.</p>
          </div>
        </div>
      `

      return resend.emails.send({
        from,
        to: [recipient],
        subject: finalSubject,
        html
      })
    })

    const results = await Promise.allSettled(sendPromises)
    const sentCount = results.filter(r => r.status === 'fulfilled').length

    // Log admin action
    await logAdminAction({
      action: 'send_email_campaign',
      targetType: 'customers',
      targetId: 'campaign',
      details: `Dispatched campaign "${subject}" to ${sentCount}/${emails.length} emails.`
    })

    return NextResponse.json({
      success: true,
      message: `Successfully sent campaign to ${sentCount} recipients.`
    })
  } catch (err: any) {
    if (err.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (err.message === 'Forbidden') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
