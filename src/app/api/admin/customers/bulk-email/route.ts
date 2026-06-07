import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'
import { logAdminAction } from '@/utils/audit'
import { Resend } from 'resend'

async function authorizeAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (!profile || profile.role !== 'admin') throw new Error('Forbidden')
}

// POST: Send bulk email to a customer segment
export async function POST(request: NextRequest) {
  try {
    await authorizeAdmin()
    const body = await request.json()
    const { userIds, subject, message, segment } = body

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: 'No customers selected' }, { status: 400 })
    }
    if (!subject || !message) {
      return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 })
    }

    const adminClient = createAdminClient()
    const { data: profiles, error } = await adminClient
      .from('profiles')
      .select('id, email, full_name')
      .in('id', userIds)

    if (error || !profiles || profiles.length === 0) {
      return NextResponse.json({ error: 'Failed to fetch customer emails' }, { status: 400 })
    }

    const resend = new Resend(process.env.RESEND_API_KEY!)
    let sentCount = 0
    const errors: string[] = []

    for (const profile of profiles) {
      if (!profile.email) continue
      try {
        const htmlBody = `
          <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
            <div style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="color: white; font-size: 22px; margin: 0; font-weight: 800; letter-spacing: -0.5px;">Thread & Crochet</h1>
              <p style="color: rgba(255,255,255,0.8); margin: 6px 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px;">Artisanal Crochet Boutique</p>
            </div>
            <div style="background: #fff; padding: 32px; border: 1px solid #e5e7eb; border-top: none;">
              <p style="font-size: 15px; color: #374151; margin: 0 0 16px;">Hi ${profile.full_name || 'Valued Customer'},</p>
              <div style="font-size: 14px; color: #374151; line-height: 1.7; white-space: pre-line;">${message}</div>
              <div style="margin-top: 28px; text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://threadandcrochet.com'}" 
                   style="background: #7c3aed; color: white; text-decoration: none; padding: 12px 28px; border-radius: 50px; font-weight: 700; font-size: 13px; display: inline-block;">
                  Shop Now →
                </a>
              </div>
            </div>
            <div style="background: #f9fafb; padding: 16px 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 16px 16px; text-align: center;">
              <p style="font-size: 11px; color: #9ca3af; margin: 0;">© ${new Date().getFullYear()} Thread & Crochet · Artisanal Crochet</p>
            </div>
          </div>
        `
        await resend.emails.send({
          from: 'Thread & Crochet <onboarding@resend.dev>',
          to: profile.email,
          subject,
          html: htmlBody,
        })
        sentCount++
      } catch (e: any) {
        errors.push(`${profile.email}: ${e.message}`)
      }
    }

    await logAdminAction({
      action: 'bulk_email_campaign',
      targetType: 'customer_segment',
      targetId: segment || 'custom',
      details: `Sent bulk email to ${sentCount}/${profiles.length} customers. Segment: ${segment || 'manual selection'}. Subject: "${subject}"`,
    })

    return NextResponse.json({
      success: true,
      sentCount,
      totalTargeted: profiles.length,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (err: any) {
    if (err.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (err.message === 'Forbidden') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
