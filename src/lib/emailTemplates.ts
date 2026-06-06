interface OrderItem {
  name: string
  quantity: number
  price: number
  size?: string
  color?: string
  image?: { src?: string; alt?: string } | string
}

interface OrderEmailData {
  customerName: string
  customerEmail: string
  orderNumber: string
  orderDate: string
  items: OrderItem[]
  costs: {
    subtotal: number
    shipping: number
    tax: number
    discount: number
    total: number
  }
  shippingAddress?: string
  siteUrl: string
}

const formatINR = (amount: number) =>
  `₹${Math.round(amount * 84).toLocaleString('en-IN')}`

export function buildOrderConfirmationEmail(data: OrderEmailData): string {
  const {
    customerName,
    orderNumber,
    orderDate,
    items,
    costs,
    shippingAddress,
    siteUrl,
  } = data

  const itemRows = items
    .map((item) => {
      const rawSrc = typeof item.image === 'string' ? item.image : item.image?.src || ''
      // Email clients need absolute URLs — prepend siteUrl for relative paths
      const imgSrc = rawSrc.startsWith('http') ? rawSrc : rawSrc ? `${data.siteUrl}${rawSrc}` : ''
      const imgAlt = typeof item.image === 'object' ? item.image?.alt || item.name : item.name
      return `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="64" style="vertical-align:top; padding-right:14px;">
                  ${imgSrc ? `<img src="${imgSrc}" alt="${imgAlt}" width="60" height="60" style="border-radius:8px; object-fit:cover; display:block;" />` : `<div style="width:60px;height:60px;border-radius:8px;background:#f5f0eb;display:block;"></div>`}
                </td>
                <td style="vertical-align:top;">
                  <p style="margin:0 0 4px 0; font-size:14px; font-weight:600; color:#1a1a1a;">${item.name}</p>
                  <p style="margin:0; font-size:12px; color:#888;">
                    ${item.color ? `Color: ${item.color}` : ''}${item.color && item.size ? ' · ' : ''}${item.size ? `Size: ${item.size}` : ''}
                    · Qty: ${item.quantity}
                  </p>
                </td>
                <td style="vertical-align:top; text-align:right; white-space:nowrap;">
                  <p style="margin:0; font-size:14px; font-weight:600; color:#1a1a1a;">${formatINR(item.price * item.quantity)}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>`
    })
    .join('')

  const discountRow =
    costs.discount > 0
      ? `<tr>
          <td style="padding: 6px 0; font-size:14px; color:#16a34a;">Discount</td>
          <td style="padding: 6px 0; font-size:14px; color:#16a34a; text-align:right;">−${formatINR(costs.discount)}</td>
         </tr>`
      : ''

  const shippingRow =
    costs.shipping > 0
      ? `<tr>
          <td style="padding: 6px 0; font-size:14px; color:#555;">Shipping</td>
          <td style="padding: 6px 0; font-size:14px; color:#555; text-align:right;">${formatINR(costs.shipping)}</td>
         </tr>`
      : `<tr>
          <td style="padding: 6px 0; font-size:14px; color:#16a34a;">Shipping</td>
          <td style="padding: 6px 0; font-size:14px; color:#16a34a; text-align:right;">Free</td>
         </tr>`

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Order Confirmation — Thread &amp; Love</title>
</head>
<body style="margin:0; padding:0; background-color:#faf7f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf7f4; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%;">

          <!-- HEADER -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <a href="${siteUrl}" style="text-decoration:none;">
                <p style="margin:0; font-size:26px; font-weight:700; color:#1a1a1a; letter-spacing:-0.5px;">Thread &amp; Love</p>
                <p style="margin:4px 0 0 0; font-size:12px; color:#888; letter-spacing:2px; text-transform:uppercase;">Handcrafted with ❤️</p>
              </a>
            </td>
          </tr>

          <!-- HERO CARD -->
          <tr>
            <td style="background:#1a1a1a; border-radius:20px 20px 0 0; padding: 36px 40px; text-align:center;">
              <p style="margin:0 0 12px 0; font-size:40px;">✅</p>
              <h1 style="margin:0 0 8px 0; font-size:24px; font-weight:700; color:#ffffff;">Order Confirmed!</h1>
              <p style="margin:0; font-size:15px; color:#bbbbbb;">Hi ${customerName}, your order is on its way to being packed.</p>
            </td>
          </tr>

          <!-- ORDER META -->
          <tr>
            <td style="background:#ffffff; padding: 24px 40px; border-left: 1px solid #f0ece8; border-right: 1px solid #f0ece8;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:12px; color:#888; text-transform:uppercase; letter-spacing:1px;">Order Number</td>
                  <td style="font-size:12px; color:#888; text-transform:uppercase; letter-spacing:1px; text-align:right;">Date</td>
                </tr>
                <tr>
                  <td style="font-size:15px; font-weight:700; color:#1a1a1a; padding-top:4px;">${orderNumber.length > 20 ? orderNumber.slice(0, 20) + '…' : orderNumber}</td>
                  <td style="font-size:15px; font-weight:700; color:#1a1a1a; padding-top:4px; text-align:right;">${orderDate}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- DIVIDER -->
          <tr>
            <td style="background:#ffffff; padding: 0 40px;">
              <div style="height:1px; background:#f0ece8;"></div>
            </td>
          </tr>

          <!-- ITEMS -->
          <tr>
            <td style="background:#ffffff; padding: 24px 40px;">
              <p style="margin:0 0 16px 0; font-size:13px; font-weight:600; color:#888; text-transform:uppercase; letter-spacing:1px;">Items Ordered</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${itemRows}
              </table>
            </td>
          </tr>

          <!-- TOTALS -->
          <tr>
            <td style="background:#ffffff; padding: 0 40px 28px 40px;">
              <div style="height:1px; background:#f0ece8; margin-bottom:16px;"></div>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 6px 0; font-size:14px; color:#555;">Subtotal</td>
                  <td style="padding: 6px 0; font-size:14px; color:#555; text-align:right;">${formatINR(costs.subtotal)}</td>
                </tr>
                ${shippingRow}
                <tr>
                  <td style="padding: 6px 0; font-size:14px; color:#555;">Tax (GST)</td>
                  <td style="padding: 6px 0; font-size:14px; color:#555; text-align:right;">${formatINR(costs.tax)}</td>
                </tr>
                ${discountRow}
                <tr>
                  <td colspan="2" style="padding: 8px 0 0 0;">
                    <div style="height:1px; background:#f0ece8;"></div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0 0 0; font-size:16px; font-weight:700; color:#1a1a1a;">Total Paid</td>
                  <td style="padding: 12px 0 0 0; font-size:16px; font-weight:700; color:#1a1a1a; text-align:right;">${formatINR(costs.total)}</td>
                </tr>
              </table>
            </td>
          </tr>

          ${shippingAddress ? `
          <!-- SHIPPING ADDRESS -->
          <tr>
            <td style="background:#ffffff; padding: 0 40px 28px 40px;">
              <div style="height:1px; background:#f0ece8; margin-bottom:20px;"></div>
              <p style="margin:0 0 8px 0; font-size:13px; font-weight:600; color:#888; text-transform:uppercase; letter-spacing:1px;">Shipping To</p>
              <p style="margin:0; font-size:14px; color:#333; line-height:1.6;">${shippingAddress}</p>
            </td>
          </tr>` : ''}

          <!-- CTA BUTTONS -->
          <tr>
            <td style="background:#ffffff; border-radius: 0 0 20px 20px; padding: 0 40px 36px 40px; text-align:center;">
              <a href="${siteUrl}/orders/${orderNumber}"
                 style="display:inline-block; background:#1a1a1a; color:#ffffff; text-decoration:none; font-size:14px; font-weight:600; padding:14px 32px; border-radius:100px; margin: 0 6px 10px 6px;">
                View My Order →
              </a>
              <a href="${siteUrl}/orders/${orderNumber}/invoice"
                 style="display:inline-block; background:#ffffff; color:#1a1a1a; text-decoration:none; font-size:14px; font-weight:600; padding:13px 32px; border-radius:100px; margin: 0 6px 10px 6px; border: 1.5px solid #1a1a1a;">
                📄 Download Invoice
              </a>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding: 28px 40px; text-align:center;">
              <p style="margin:0 0 6px 0; font-size:12px; color:#aaa;">Questions? Reply to this email or visit our store.</p>
              <p style="margin:0; font-size:12px; color:#ccc;">© 2025 Thread &amp; Love. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

interface StatusUpdateEmailData extends OrderEmailData {
  status: string;
  carrier?: string;
  trackingNumber?: string;
}

export function buildOrderStatusUpdateEmail(data: StatusUpdateEmailData): string {
  const {
    customerName,
    orderNumber,
    orderDate,
    status,
    items,
    costs,
    carrier,
    trackingNumber,
    shippingAddress,
    siteUrl,
  } = data

  const getTrackingUrl = (cName?: string, tNo?: string) => {
    if (!cName || !tNo) return ''
    const c = cName.toLowerCase()
    if (c.includes('delhivery')) return `https://www.delhivery.com/track/package/${tNo}`
    if (c.includes('fedex')) return `https://www.fedex.com/apps/fedextrack/?tracknumbers=${tNo}`
    if (c.includes('dhl')) return `https://www.dhl.com/en/express/tracking.html?AWB=${tNo}`
    if (c.includes('blue dart') || c.includes('bluedart')) return `https://www.bluedart.com/`
    if (c.includes('dtdc')) return `https://www.dtdc.in/`
    return ''
  }

  const trackingLink = getTrackingUrl(carrier, trackingNumber)

  const itemRows = items
    .map((item) => {
      const rawSrc = typeof item.image === 'string' ? item.image : item.image?.src || ''
      const imgSrc = rawSrc.startsWith('http') ? rawSrc : rawSrc ? `${data.siteUrl}${rawSrc}` : ''
      const imgAlt = typeof item.image === 'object' ? item.image?.alt || item.name : item.name
      return `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="64" style="vertical-align:top; padding-right:14px;">
                  ${imgSrc ? `<img src="${imgSrc}" alt="${imgAlt}" width="60" height="60" style="border-radius:8px; object-fit:cover; display:block;" />` : `<div style="width:60px;height:60px;border-radius:8px;background:#f5f0eb;display:block;"></div>`}
                </td>
                <td style="vertical-align:top;">
                  <p style="margin:0 0 4px 0; font-size:14px; font-weight:600; color:#1a1a1a;">${item.name}</p>
                  <p style="margin:0; font-size:12px; color:#888;">
                    ${item.color ? `Color: ${item.color}` : ''}${item.color && item.size ? ' · ' : ''}${item.size ? `Size: ${item.size}` : ''}
                    · Qty: ${item.quantity}
                  </p>
                </td>
                <td style="vertical-align:top; text-align:right; white-space:nowrap;">
                  <p style="margin:0; font-size:14px; font-weight:600; color:#1a1a1a;">${formatINR(item.price * item.quantity)}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>`
    })
    .join('')

  const discountRow =
    costs.discount > 0
      ? `<tr>
          <td style="padding: 6px 0; font-size:14px; color:#16a34a;">Discount</td>
          <td style="padding: 6px 0; font-size:14px; color:#16a34a; text-align:right;">−${formatINR(costs.discount)}</td>
         </tr>`
      : ''

  const shippingRow =
    costs.shipping > 0
      ? `<tr>
          <td style="padding: 6px 0; font-size:14px; color:#555;">Shipping</td>
          <td style="padding: 6px 0; font-size:14px; color:#555; text-align:right;">${formatINR(costs.shipping)}</td>
         </tr>`
      : `<tr>
          <td style="padding: 6px 0; font-size:14px; color:#16a34a;">Shipping</td>
          <td style="padding: 6px 0; font-size:14px; color:#16a34a; text-align:right;">Free</td>
         </tr>`

  let emoji = '📦'
  let headerText = 'Order Update'
  let messageText = `Hi ${customerName}, your order status has been updated to: <b>${status}</b>.`

  if (status === 'Shipped') {
    emoji = '🚚'
    headerText = 'Order Shipped!'
    messageText = `Great news! Hi ${customerName}, your order has been handed over to our shipping partner and is on its way to you.`
  } else if (status === 'Delivered') {
    emoji = '🎉'
    headerText = 'Order Delivered!'
    messageText = `Hi ${customerName}, your order has been successfully delivered! We hope you love your new handcrafted crochet items.`
  } else if (status === 'Processing') {
    emoji = '🧶'
    headerText = 'Processing Order'
    messageText = `Hi ${customerName}, our artisans have started preparing your hand-knitted order.`
  }

  const trackingBox = carrier && trackingNumber
    ? `<div style="background:#faf7f4; border: 1.5px dashed #ebd9be; border-radius:12px; padding:20px; margin-bottom:24px; text-align:left;">
        <p style="margin:0 0 8px 0; font-size:12px; font-weight:700; color:#888; text-transform:uppercase; letter-spacing:1px;">Delivery tracking</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px; color:#333;">
          <tr>
            <td style="padding:4px 0; font-weight:600; color:#555;">Courier Partner:</td>
            <td style="padding:4px 0; font-weight:700; text-align:right; color:#1a1a1a;">${carrier}</td>
          </tr>
          <tr>
            <td style="padding:4px 0; font-weight:600; color:#555;">Tracking ID:</td>
            <td style="padding:4px 0; font-weight:700; text-align:right; color:#1a1a1a; font-family:monospace;">${trackingNumber}</td>
          </tr>
        </table>
        ${trackingLink ? `
        <div style="text-align:center; margin-top:16px;">
          <a href="${trackingLink}" style="display:inline-block; background:#1b1b1b; color:#ffffff; font-size:12px; font-weight:700; text-decoration:none; padding:8px 20px; border-radius:100px;">
            Track Shipment Status →
          </a>
        </div>` : ''}
       </div>`
    : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Order Status Update — Thread &amp; Love</title>
</head>
<body style="margin:0; padding:0; background-color:#faf7f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf7f4; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%;">

          <!-- HEADER -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <a href="${siteUrl}" style="text-decoration:none;">
                <p style="margin:0; font-size:26px; font-weight:700; color:#1a1a1a; letter-spacing:-0.5px;">Thread &amp; Love</p>
                <p style="margin:4px 0 0 0; font-size:12px; color:#888; letter-spacing:2px; text-transform:uppercase;">Handcrafted with ❤️</p>
              </a>
            </td>
          </tr>

          <!-- HERO CARD -->
          <tr>
            <td style="background:#1a1a1a; border-radius:20px 20px 0 0; padding: 36px 40px; text-align:center;">
              <p style="margin:0 0 12px 0; font-size:40px;">${emoji}</p>
              <h1 style="margin:0 0 8px 0; font-size:24px; font-weight:700; color:#ffffff;">${headerText}</h1>
              <p style="margin:0; font-size:15px; color:#bbbbbb;">${messageText}</p>
            </td>
          </tr>

          <!-- ORDER META -->
          <tr>
            <td style="background:#ffffff; padding: 24px 40px; border-left: 1px solid #f0ece8; border-right: 1px solid #f0ece8;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:12px; color:#888; text-transform:uppercase; letter-spacing:1px;">Order Number</td>
                  <td style="font-size:12px; color:#888; text-transform:uppercase; letter-spacing:1px; text-align:right;">Order Date</td>
                </tr>
                <tr>
                  <td style="font-size:15px; font-weight:700; color:#1a1a1a; padding-top:4px;">${orderNumber}</td>
                  <td style="font-size:15px; font-weight:700; color:#1a1a1a; padding-top:4px; text-align:right;">${orderDate}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- DIVIDER -->
          <tr>
            <td style="background:#ffffff; padding: 0 40px;">
              <div style="height:1px; background:#f0ece8;"></div>
            </td>
          </tr>

          <!-- TRACKING & SUMMARY -->
          <tr>
            <td style="background:#ffffff; padding: 28px 40px 0 40px; border-left: 1px solid #f0ece8; border-right: 1px solid #f0ece8;">
              ${trackingBox}
            </td>
          </tr>

          <!-- ITEMS -->
          <tr>
            <td style="background:#ffffff; padding: 12px 40px 24px 40px; border-left: 1px solid #f0ece8; border-right: 1px solid #f0ece8;">
              <p style="margin:0 0 16px 0; font-size:13px; font-weight:600; color:#888; text-transform:uppercase; letter-spacing:1px;">Items in this order</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${itemRows}
              </table>
            </td>
          </tr>

          <!-- TOTALS -->
          <tr>
            <td style="background:#ffffff; padding: 0 40px 28px 40px; border-left: 1px solid #f0ece8; border-right: 1px solid #f0ece8;">
              <div style="height:1px; background:#f0ece8; margin-bottom:16px;"></div>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 6px 0; font-size:14px; color:#555;">Subtotal</td>
                  <td style="padding: 6px 0; font-size:14px; color:#555; text-align:right;">${formatINR(costs.subtotal)}</td>
                </tr>
                ${shippingRow}
                <tr>
                  <td style="padding: 6px 0; font-size:14px; color:#555;">Tax (GST)</td>
                  <td style="padding: 6px 0; font-size:14px; color:#555; text-align:right;">${formatINR(costs.tax)}</td>
                </tr>
                ${discountRow}
                <tr>
                  <td colspan="2" style="padding: 8px 0 0 0;">
                    <div style="height:1px; background:#f0ece8;"></div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0 0 0; font-size:16px; font-weight:700; color:#1a1a1a;">Total Paid</td>
                  <td style="padding: 12px 0 0 0; font-size:16px; font-weight:700; color:#1a1a1a; text-align:right;">${formatINR(costs.total)}</td>
                </tr>
              </table>
            </td>
          </tr>

          ${shippingAddress ? `
          <!-- SHIPPING ADDRESS -->
          <tr>
            <td style="background:#ffffff; padding: 0 40px 28px 40px; border-left: 1px solid #f0ece8; border-right: 1px solid #f0ece8;">
              <div style="height:1px; background:#f0ece8; margin-bottom:20px;"></div>
              <p style="margin:0 0 8px 0; font-size:13px; font-weight:600; color:#888; text-transform:uppercase; letter-spacing:1px;">Shipping To</p>
              <p style="margin:0; font-size:14px; color:#333; line-height:1.6;">${shippingAddress}</p>
            </td>
          </tr>` : ''}

          <!-- CTA BUTTONS -->
          <tr>
            <td style="background:#ffffff; border-radius: 0 0 20px 20px; padding: 0 40px 36px 40px; text-align:center; border-left: 1px solid #f0ece8; border-right: 1px solid #f0ece8; border-bottom: 1px solid #f0ece8;">
              <a href="${siteUrl}/orders/${orderNumber}"
                 style="display:inline-block; background:#1a1a1a; color:#ffffff; text-decoration:none; font-size:14px; font-weight:600; padding:14px 32px; border-radius:100px; margin: 0 6px 10px 6px;">
                Track My Order →
              </a>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding: 28px 40px; text-align:center;">
              <p style="margin:0 0 6px 0; font-size:12px; color:#aaa;">Questions? Reply to this email or visit our store support.</p>
              <p style="margin:0; font-size:12px; color:#ccc;">© 2026 Thread &amp; Love. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function buildSupportReplyEmail(data: {
  customerName: string
  originalMessage: string
  replyText: string
  siteUrl: string
}): string {
  const { customerName, originalMessage, replyText, siteUrl } = data
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Support Ticket Reply — Thread &amp; Love</title>
</head>
<body style="margin:0; padding:0; background-color:#faf7f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf7f4; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%;">

          <!-- HEADER -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <a href="${siteUrl}" style="text-decoration:none;">
                <p style="margin:0; font-size:26px; font-weight:700; color:#1a1a1a; letter-spacing:-0.5px;">Thread &amp; Love</p>
                <p style="margin:4px 0 0 0; font-size:12px; color:#888; letter-spacing:2px; text-transform:uppercase;">Handcrafted with ❤️</p>
              </a>
            </td>
          </tr>

          <!-- HERO CARD -->
          <tr>
            <td style="background:#1a1a1a; border-radius:20px 20px 0 0; padding: 36px 40px; text-align:center;">
              <p style="margin:0 0 12px 0; font-size:40px;">✉️</p>
              <h1 style="margin:0 0 8px 0; font-size:24px; font-weight:700; color:#ffffff;">Response to Your Inquiry</h1>
              <p style="margin:0; font-size:15px; color:#bbbbbb;">Hi ${customerName}, here is the response to the inquiry you submitted to Thread &amp; Love.</p>
            </td>
          </tr>

          <!-- MESSAGE CONTENT -->
          <tr>
            <td style="background:#ffffff; padding: 32px 40px; border-left: 1px solid #f0ece8; border-right: 1px solid #f0ece8; border-bottom: 1px solid #f0ece8; border-radius: 0 0 20px 20px;">
              
              <!-- REPLY -->
              <p style="margin:0 0 8px 0; font-size:13px; font-weight:600; color:#888; text-transform:uppercase; letter-spacing:1px;">Our Response</p>
              <div style="font-size:15px; color:#1a1a1a; line-height:1.6; white-space: pre-wrap; margin-bottom: 28px;">${replyText}</div>
              
              <div style="height:1px; background:#f0ece8; margin-bottom:24px;"></div>

              <!-- ORIGINAL INQUIRY -->
              <p style="margin:0 0 8px 0; font-size:12px; font-weight:600; color:#aaa; text-transform:uppercase; letter-spacing:1px;">Your Original Message</p>
              <div style="font-size:14px; color:#666; line-height:1.6; font-style:italic; padding-left:14px; border-left:3px solid #ebd9be; white-space: pre-wrap;">${originalMessage}</div>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding: 28px 40px; text-align:center;">
              <p style="margin:0 0 6px 0; font-size:12px; color:#aaa;">Questions? Reply to this email or visit our store support.</p>
              <p style="margin:0; font-size:12px; color:#ccc;">© 2026 Thread &amp; Love. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function buildOrderRefundEmail(data: OrderEmailData): string {
  const {
    customerName,
    orderNumber,
    orderDate,
    items,
    costs,
    siteUrl,
  } = data

  const itemRows = items
    .map((item) => {
      const rawSrc = typeof item.image === 'string' ? item.image : item.image?.src || ''
      const imgSrc = rawSrc.startsWith('http') ? rawSrc : rawSrc ? `${data.siteUrl}${rawSrc}` : ''
      return `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                ${imgSrc ? `<td width="60" style="padding-right: 12px;"><img src="${imgSrc}" width="48" height="48" style="border-radius: 8px; object-fit: cover; display: block;" /></td>` : ''}
                <td>
                  <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1a1a1a;">${item.name}</p>
                  <p style="margin: 4px 0 0 0; font-size: 12px; color: #888;">Qty: ${item.quantity} ${item.size ? `• Size: ${item.size}` : ''} ${item.color ? `• Color: ${item.color}` : ''}</p>
                </td>
                <td align="right" style="font-size: 14px; font-weight: 600; color: #1a1a1a;">${formatINR(item.price * item.quantity)}</td>
              </tr>
            </table>
          </td>
        </tr>`
    })
    .join('')

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Refund Confirmation — Thread &amp; Love</title>
</head>
<body style="margin:0; padding:0; background-color:#faf7f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf7f4; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%;">
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <a href="${siteUrl}" style="text-decoration:none;">
                <p style="margin:0; font-size:26px; font-weight:700; color:#1a1a1a; letter-spacing:-0.5px;">Thread &amp; Love</p>
                <p style="margin:4px 0 0 0; font-size:12px; color:#888; letter-spacing:2px; text-transform:uppercase;">Handcrafted with ❤️</p>
              </a>
            </td>
          </tr>
          <tr>
            <td style="background:#ef4444; border-radius:20px 20px 0 0; padding: 36px 40px; text-align:center;">
              <p style="margin:0 0 12px 0; font-size:40px;">💸</p>
              <h1 style="margin:0 0 8px 0; font-size:24px; font-weight:700; color:#ffffff;">Refund Processed</h1>
              <p style="margin:0; font-size:15px; color:#fbcfe8;">Hi ${customerName}, your refund for order #${orderNumber} has been successfully processed.</p>
            </td>
          </tr>
          <tr>
            <td style="background:#ffffff; padding: 24px 40px; border-left: 1px solid #f0ece8; border-right: 1px solid #f0ece8;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:12px; color:#888; text-transform:uppercase; letter-spacing:1px;">Order Number</td>
                  <td style="font-size:12px; color:#888; text-transform:uppercase; letter-spacing:1px; text-align:right;">Order Date</td>
                </tr>
                <tr>
                  <td style="font-size:15px; font-weight:700; color:#1a1a1a; padding-top:4px;">${orderNumber}</td>
                  <td style="font-size:15px; font-weight:700; color:#1a1a1a; padding-top:4px; text-align:right;">${orderDate}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:#ffffff; padding: 0 40px;"><div style="height:1px; background:#f0ece8;"></div></td>
          </tr>
          <tr>
            <td style="background:#ffffff; padding: 32px 40px; border-left: 1px solid #f0ece8; border-right: 1px solid #f0ece8;">
              <p style="margin:0 0 16px 0; font-size:14px; font-weight:700; color:#1a1a1a; text-transform:uppercase; letter-spacing:1px;">Refunded Items</p>
              <table width="100%" cellpadding="0" cellspacing="0">${itemRows}</table>
            </td>
          </tr>
          <tr>
            <td style="background:#ffffff; padding: 0 40px;"><div style="height:1px; background:#f0ece8;"></div></td>
          </tr>
          <tr>
            <td style="background:#ffffff; padding: 32px 40px; border-left: 1px solid #f0ece8; border-right: 1px solid #f0ece8; border-bottom: 1px solid #f0ece8; border-radius:0 0 20px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px; color:#666;">
                <tr>
                  <td style="padding-bottom:8px;">Subtotal</td>
                  <td align="right" style="padding-bottom:8px;">${formatINR(costs.subtotal)}</td>
                </tr>
                ${costs.discount > 0 ? `<tr><td style="padding-bottom:8px; color:#ef4444;">Discount</td><td align="right" style="padding-bottom:8px; color:#ef4444;">-${formatINR(costs.discount)}</td></tr>` : ''}
                <tr>
                  <td style="padding-bottom:8px;">Shipping</td>
                  <td align="right" style="padding-bottom:8px;">${formatINR(costs.shipping)}</td>
                </tr>
                <tr>
                  <td style="padding-bottom:12px; border-bottom: 1px dashed #f0ece8;">Tax</td>
                  <td align="right" style="padding-bottom:12px; border-bottom: 1px dashed #f0ece8;">${formatINR(costs.tax)}</td>
                </tr>
                <tr>
                  <td style="padding-top:16px; font-size:16px; font-weight:700; color:#1a1a1a;">Total Refunded</td>
                  <td align="right" style="padding-top:16px; font-size:16px; font-weight:700; color:#ef4444;">${formatINR(costs.total)}</td>
                </tr>
              </table>
              <div style="margin-top: 24px; padding: 12px 16px; background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; font-size: 12px; color: #991b1b; text-align: center; line-height: 1.5;">
                The refunded amount has been processed to your original payment method. It usually takes 5-7 business days to reflect in your bank account.
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 28px 40px; text-align:center;">
              <p style="margin:0 0 6px 0; font-size:12px; color:#aaa;">Questions? Reply to this email or visit our store support.</p>
              <p style="margin:0; font-size:12px; color:#ccc;">© 2026 Thread &amp; Love. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export interface CartRecoveryEmailItem {
  title: string
  quantity: number
  price: number
  size?: string
  color?: string
  image?: string
}

export interface CartRecoveryEmailData {
  customerName: string
  items: CartRecoveryEmailItem[]
  couponCode?: string
  customMessage?: string
  siteUrl: string
}

export function buildCartRecoveryEmail(data: CartRecoveryEmailData): string {
  const { customerName, items, couponCode, customMessage, siteUrl } = data

  const itemRows = items
    .map((item) => {
      const imgSrc = item.image ? (item.image.startsWith('http') ? item.image : `${siteUrl}${item.image}`) : ''
      return `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="64" style="vertical-align:top; padding-right:14px;">
                  ${imgSrc ? `<img src="${imgSrc}" alt="${item.title}" width="60" height="60" style="border-radius:8px; object-fit:cover; display:block;" />` : `<div style="width:60px;height:60px;border-radius:8px;background:#f5f0eb;display:block;"></div>`}
                </td>
                <td style="vertical-align:top;">
                  <p style="margin:0 0 4px 0; font-size:14px; font-weight:600; color:#1a1a1a;">${item.title}</p>
                  <p style="margin:0; font-size:12px; color:#888;">
                    ${item.color ? `Color: ${item.color}` : ''}${item.color && item.size ? ' · ' : ''}${item.size ? `Size: ${item.size}` : ''}
                    · Qty: ${item.quantity}
                  </p>
                </td>
                <td style="vertical-align:top; text-align:right; white-space:nowrap;">
                  <p style="margin:0; font-size:14px; font-weight:600; color:#1a1a1a;">${formatINR(item.price * item.quantity)}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>`
    })
    .join('')

  const couponSection = couponCode
    ? `<div style="margin-top: 24px; padding: 18px; background-color: #f0fdf4; border: 1px dashed #4ade80; border-radius: 12px; font-size: 13px; color: #166534; text-align: center; line-height: 1.5;">
        <p style="margin: 0 0 6px 0; font-weight: 700;">🎁 Special Incentive for You!</p>
        <p style="margin: 0 0 10px 0;">Use code <strong style="font-size: 15px; color: #15803d; background: #dcfce7; padding: 2px 6px; border-radius: 4px;">${couponCode}</strong> at checkout to claim an extra discount on your purchase.</p>
      </div>`
    : ''

  const messageSection = customMessage
    ? `<p style="margin: 0 0 20px 0; font-size: 14px; color: #444; font-style: italic; line-height: 1.6; border-left: 3px solid #e5e7eb; padding-left: 12px;">
        "${customMessage}"
      </p>`
    : `<p style="margin: 0 0 20px 0; font-size: 14px; color: #444; line-height: 1.6;">
        We noticed you left some items in your shopping cart! We've saved them for you so you can easily pick up where you left off.
      </p>`

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Complete Your Order — Thread &amp; Love</title>
</head>
<body style="margin:0; padding:0; background-color:#faf7f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf7f4; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" style="max-width:600px; background:#ffffff; border-radius:20px; box-shadow:0 4px 12px rgba(0,0,0,0.03); border:1px solid #f0ece8;" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding: 32px 40px; text-align:center;">
              <a href="${siteUrl}" style="text-decoration:none;">
                <p style="margin:0; font-size:26px; font-weight:700; color:#1a1a1a; letter-spacing:-0.5px;">Thread &amp; Love</p>
                <p style="margin:4px 0 0 0; font-size:12px; color:#888; letter-spacing:2px; text-transform:uppercase;">Handcrafted with ❤️</p>
              </a>
            </td>
          </tr>
          <tr>
            <td style="background:#d97706; border-radius:0; padding: 36px 40px; text-align:center;">
              <p style="margin:0 0 12px 0; font-size:40px;">🛒</p>
              <h1 style="margin:0 0 8px 0; font-size:24px; font-weight:700; color:#ffffff;">Did you forget something?</h1>
              <p style="margin:0; font-size:15px; color:#fef3c7;">Hi ${customerName}, complete your order today while your selected items are still in stock.</p>
            </td>
          </tr>
          <tr>
            <td style="background:#ffffff; padding: 32px 40px; border-left: 1px solid #f0ece8; border-right: 1px solid #f0ece8; border-bottom: 1px solid #f0ece8; border-radius:0 0 20px 20px;">
              ${messageSection}
              
              <p style="margin:0 0 16px 0; font-size:13px; font-weight:700; color:#1a1a1a; text-transform:uppercase; letter-spacing:1px;">Items in your cart</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">${itemRows}</table>

              ${couponSection}

              <div style="text-align: center; margin-top: 32px;">
                <a href="${siteUrl}/cart" style="background-color: #1a1a1a; color: #ffffff; padding: 14px 28px; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 12px; display: inline-block; transition: background 0.2s;">
                  🛍️ Complete My Purchase
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 28px 40px; text-align:center;">
              <p style="margin:0 0 6px 0; font-size:12px; color:#aaa;">Questions? Reply to this email or visit our store support.</p>
              <p style="margin:0; font-size:12px; color:#ccc;">© 2026 Thread &amp; Love. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}


