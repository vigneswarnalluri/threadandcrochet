import { Resend } from 'resend'
import { buildOrderConfirmationEmail, buildOrderStatusUpdateEmail, buildSupportReplyEmail, buildOrderRefundEmail, buildCartRecoveryEmail, CartRecoveryEmailItem } from './emailTemplates'

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

interface SendOrderStatusUpdateEmailParams {
  customerName: string
  customerEmail: string
  orderNumber: string
  orderDate: string
  status: string
  items: any[]
  costs: {
    subtotal: number
    shipping: number
    tax: number
    discount: number
    total: number
  }
  carrier?: string;
  trackingNumber?: string;
  shippingAddress?: string;
}

export async function sendOrderStatusUpdateEmail(params: SendOrderStatusUpdateEmailParams) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://threadandlove.netlify.app'

  const html = buildOrderStatusUpdateEmail({ ...params, siteUrl })

  const from = 'Thread & Love <onboarding@resend.dev>'
  const isSandbox = from.includes('resend.dev')
  const testEmail = process.env.RESEND_TEST_EMAIL || 'r.crochet18@gmail.com'
  const recipient = isSandbox ? testEmail : params.customerEmail
  const subject = isSandbox
    ? `[TEST] 📦 Order Status Updated: ${params.status} — #${params.orderNumber} (→ ${params.customerEmail})`
    : `📦 Order Status Updated: ${params.status} — #${params.orderNumber}`

  const { data, error } = await resend.emails.send({ from, to: [recipient], subject, html })

  if (error) {
    console.error('Failed to send order status update email:', error)
    return { success: false, error }
  }

  console.log('Order status update email sent:', data?.id)
  return { success: true, id: data?.id }
}

interface SendSupportReplyEmailParams {
  customerName: string
  customerEmail: string
  originalMessage: string
  replyText: string
}

export async function sendSupportReplyEmail(params: SendSupportReplyEmailParams) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://threadandlove.netlify.app'
  const html = buildSupportReplyEmail({ ...params, siteUrl })

  const from = 'Thread & Love Support <onboarding@resend.dev>'
  const isSandbox = from.includes('resend.dev')
  const testEmail = process.env.RESEND_TEST_EMAIL || 'r.crochet18@gmail.com'
  const recipient = isSandbox ? testEmail : params.customerEmail
  const subject = isSandbox
    ? `[TEST] ✉️ Support Ticket Response (→ ${params.customerEmail})`
    : `✉️ Support Ticket Response — Thread & Love`

  const { data, error } = await resend.emails.send({ from, to: [recipient], subject, html })

  if (error) {
    console.error('Failed to send support reply email:', error)
    return { success: false, error }
  }

  console.log('Support reply email sent:', data?.id)
  return { success: true, id: data?.id }
}

export async function sendOrderRefundEmail(params: SendOrderEmailParams) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://threadandlove.netlify.app'
  const html = buildOrderRefundEmail({ ...params, siteUrl })
  const from = 'Thread & Love <onboarding@resend.dev>'
  
  const isSandbox = from.includes('resend.dev')
  const testEmail = process.env.RESEND_TEST_EMAIL || 'r.crochet18@gmail.com'
  const recipient = isSandbox ? testEmail : params.customerEmail
  const subject = isSandbox
    ? `[TEST] 💸 Refund Processed — #${params.orderNumber} (→ ${params.customerEmail})`
    : `💸 Refund Processed — #${params.orderNumber}`

  const { data, error } = await resend.emails.send({ from, to: [recipient], subject, html })

  if (error) {
    console.error('Failed to send order refund email:', error)
    return { success: false, error }
  }

  console.log('Order refund email sent:', data?.id)
  return { success: true, id: data?.id }
}

interface SendCartRecoveryEmailParams {
  customerName: string
  customerEmail: string
  items: CartRecoveryEmailItem[]
  couponCode?: string
  customMessage?: string
}

export async function sendCartRecoveryEmail(params: SendCartRecoveryEmailParams) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://threadandlove.netlify.app'
  const html = buildCartRecoveryEmail({ ...params, siteUrl })
  const from = 'Thread & Love <onboarding@resend.dev>'

  const isSandbox = from.includes('resend.dev')
  const testEmail = process.env.RESEND_TEST_EMAIL || 'r.crochet18@gmail.com'
  const recipient = isSandbox ? testEmail : params.customerEmail
  const subject = isSandbox
    ? `[TEST] 🛒 Complete your purchase at Thread & Love (→ ${params.customerEmail})`
    : `🛒 Complete your purchase at Thread & Love`

  const { data, error } = await resend.emails.send({ from, to: [recipient], subject, html })

  if (error) {
    console.error('Failed to send cart recovery email:', error)
    return { success: false, error }
  }

  console.log('Cart recovery email sent:', data?.id)
  return { success: true, id: data?.id }
}
