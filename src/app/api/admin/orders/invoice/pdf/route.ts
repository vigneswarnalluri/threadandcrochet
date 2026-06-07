import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { jsPDF } from 'jspdf'

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

export async function GET(request: NextRequest) {
  try {
    await authorizeAdmin()
    const { searchParams } = new URL(request.url)
    const orderNumber = searchParams.get('orderNumber')

    if (!orderNumber) {
      return NextResponse.json({ error: 'Missing orderNumber' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // 1. Fetch order details
    const { data: order, error: orderError } = await adminClient
      .from('orders')
      .select('*')
      .eq('number', orderNumber)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // 2. Fetch customer profile
    const { data: customerProfile } = await adminClient
      .from('profiles')
      .select('full_name, email, address, phone_number')
      .eq('id', order.user_id)
      .single()

    const customerName = customerProfile?.full_name || 'Customer'
    const customerEmail = customerProfile?.email || 'No email'
    const customerAddress = customerProfile?.address || 'No address'

    // 3. Fetch tax and shipping settings to display in calculation rows (from store_settings rates key)
    let taxRatePercent = 5
    let shippingFlatINR = 99
    try {
      const { data: dbSettings } = await adminClient
        .from('store_settings')
        .select('*')
        .eq('key', 'rates')
        .single()
      if (dbSettings && dbSettings.value) {
        const rates = dbSettings.value as any
        if (rates.tax !== undefined) taxRatePercent = Number(rates.tax)
        if (rates.shipping !== undefined) shippingFlatINR = Number(rates.shipping)
      }
    } catch (_) {}

    // 4. Generate PDF invoice using jsPDF
    const doc = new jsPDF()

    // Header Title
    doc.setFont("helvetica", "bold")
    doc.setFontSize(22)
    doc.text("THREAD & CROCHET", 20, 25)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.setTextColor(120, 110, 100)
    doc.text("Artisanal Crochet & Knitting Boutique", 20, 31)

    // Document Title
    doc.setFont("helvetica", "bold")
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text("OFFICIAL TAX INVOICE", 130, 25)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.setTextColor(80, 80, 80)
    doc.text(`Invoice Number: #${order.number}`, 130, 32)
    doc.text(`Order Date: ${order.date || new Date(order.created_at).toLocaleDateString()}`, 130, 37)
    doc.text(`Payment Status: ${order.status || 'Paid'}`, 130, 42)

    // Divider Line
    doc.setDrawColor(220, 215, 210)
    doc.setLineWidth(0.5)
    doc.line(20, 48, 190, 48)

    // Store & Billing details
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    doc.text("Seller Details:", 20, 56)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.setTextColor(60, 60, 60)
    doc.text("Thread & Crochet Customer Support", 20, 62)
    doc.text("Email: support@threadandcrochet.com", 20, 67)
    doc.text("Phone: +91 98765 43210", 20, 72)

    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    doc.text("Bill To / Deliver To:", 120, 56)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.setTextColor(60, 60, 60)
    doc.text(customerName, 120, 62)
    doc.text(`Email: ${customerEmail}`, 120, 67)
    doc.text(`Address: ${customerAddress}`, 120, 72, { maxWidth: 70 })

    // Divider Line
    doc.line(20, 85, 190, 85)

    // Table Headers
    doc.setFont("helvetica", "bold")
    doc.setFontSize(9)
    doc.setTextColor(0, 0, 0)
    doc.text("Item Description", 20, 93)
    doc.text("Qty", 120, 93, { align: "center" })
    doc.text("Unit Price (INR)", 155, 93, { align: "right" })
    doc.text("Subtotal (INR)", 190, 93, { align: "right" })

    doc.line(20, 96, 190, 96)

    // Table Body
    doc.setFont("helvetica", "normal")
    doc.setTextColor(60, 60, 60)
    let y = 104
    const items = order.items || []
    
    items.forEach((item: any) => {
      if (y > 240) {
        doc.addPage()
        y = 25
      }

      const itemQty = Number(item.quantity || 1)
      const itemPrice = Number(item.price || 0)
      const itemTotal = itemPrice * itemQty

      doc.text(item.name || 'Artisanal Wearable', 20, y, { maxWidth: 90 })
      doc.text(String(itemQty), 120, y, { align: "center" })
      doc.text(itemPrice.toLocaleString('en-IN'), 155, y, { align: "right" })
      doc.text(itemTotal.toLocaleString('en-IN'), 190, y, { align: "right" })

      y += 10
    })

    doc.line(20, y - 5, 190, y - 5)

    // Subtotal and calculations
    y += 5
    doc.setFont("helvetica", "normal")
    doc.setTextColor(80, 80, 80)
    doc.text("Items Subtotal:", 135, y)
    doc.text(Number(order.total || 0).toLocaleString('en-IN'), 190, y, { align: "right" })

    y += 7
    const calculatedTax = Math.round(Number(order.total || 0) * taxRatePercent / 100)
    doc.text(`Estimated GST (${taxRatePercent}%):`, 135, y)
    doc.text(calculatedTax.toLocaleString('en-IN'), 190, y, { align: "right" })

    y += 7
    doc.text("Shipping & Delivery Fee:", 135, y)
    doc.text(shippingFlatINR.toLocaleString('en-IN'), 190, y, { align: "right" })

    y += 8
    doc.setFont("helvetica", "bold")
    doc.setTextColor(0, 0, 0)
    doc.text("Grand Total (Paid):", 135, y)
    
    const grandTotal = Number(order.total || 0) + calculatedTax + shippingFlatINR
    doc.text(`INR ${grandTotal.toLocaleString('en-IN')}`, 190, y, { align: "right" })

    // Footer note
    y += 25
    doc.setFont("helvetica", "italic")
    doc.setFontSize(8)
    doc.setTextColor(150, 140, 130)
    doc.text("This receipt serves as an official proof of payment. For inquiries, reach support@threadandcrochet.com.", 105, y, { align: "center" })
    doc.text("Thank you for choosing handmade boutique products from Thread & Crochet!", 105, y + 5, { align: "center" })

    // Export PDF as ArrayBuffer
    const pdfArrayBuffer = doc.output('arraybuffer')

    return new NextResponse(pdfArrayBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=Invoice_${orderNumber}.pdf`,
        'Cache-Control': 'no-store'
      }
    })
  } catch (err: any) {
    if (err.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (err.message === 'Forbidden') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
