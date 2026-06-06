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
