import { Resend } from 'resend'
import { buildOrderConfirmationEmail } from './emailTemplates'

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendOrderEmailParams {
  customerName: string
  customerEmail: string
  orderNumber: string
  orderDate: string
  items: any[]
  costs: {
    subtotal: number
    shipping: number
    tax: number
    discount: number
    total: number
  }
  shippingAddress?: string
}

export async function sendOrderConfirmationEmail(params: SendOrderEmailParams) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://threadandlove.netlify.app'

  const html = buildOrderConfirmationEmail({ ...params, siteUrl })

  // Sandbox: onboarding@resend.dev only delivers to the Resend account owner's email.
  // Production: switch to your verified domain email (e.g. orders@threadandlove.in).
  const from = 'Thread & Love <onboarding@resend.dev>'
  // const from = 'Thread & Love <orders@threadandlove.in>'  // ← uncomment after domain verification

  const isSandbox = from.includes('resend.dev')
  const testEmail = process.env.RESEND_TEST_EMAIL || 'r.crochet18@gmail.com'
  const recipient = isSandbox ? testEmail : params.customerEmail
  const subject = isSandbox
    ? `[TEST] ✅ Order Confirmed — #${params.orderNumber} (→ ${params.customerEmail})`
    : `✅ Order Confirmed — #${params.orderNumber}`

  const { data, error } = await resend.emails.send({ from, to: [recipient], subject, html })

  if (error) {
    console.error('Failed to send order confirmation email:', error)
    return { success: false, error }
  }

  console.log('Order confirmation email sent:', data?.id)
  return { success: true, id: data?.id }
}
