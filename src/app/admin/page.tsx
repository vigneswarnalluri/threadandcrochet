import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'
import AdminDashboardClient from '@/app/admin/AdminDashboardClient'
import { Metadata } from 'next'


export const metadata: Metadata = {
  title: 'Admin Orders Dashboard',
  description: 'Manage, search, and update customer order statuses.',
}

export default async function AdminDashboardPage(props: {
  searchParams: Promise<{ search?: string; status?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirectedFrom=/admin')
  }

  // Fetch the role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect('/login?error=Access+Denied:+Admin+privileges+required.&redirectedFrom=/admin')
  }

  const { search, status } = await props.searchParams
  const searchQuery = search || ''
  const statusFilter = status || ''

  const adminClient = createAdminClient()

  // 1. Fetch metrics and all orders
  const { data: allOrders } = await adminClient
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  const ordersList = allOrders || []

  const metrics = {
    totalCount: ordersList.length,
    totalRevenue: ordersList.reduce((acc, o) => acc + Number(o.total || 0), 0),
    paidCount: ordersList.filter(o => o.status === 'Paid').length,
    processingCount: ordersList.filter(o => o.status === 'Processing').length,
    shippedCount: ordersList.filter(o => o.status === 'Shipped').length,
    deliveredCount: ordersList.filter(o => o.status === 'Delivered').length,
    cancelledCount: ordersList.filter(o => ['Cancelled', 'Refunded'].includes(o.status)).length,
  }

  // 2. Filter orders for the Orders tab
  let filteredOrders = [...ordersList]
  if (statusFilter) {
    filteredOrders = filteredOrders.filter(o => o.status === statusFilter)
  }

  // 3. Fetch customer profiles
  const { data: profiles } = await adminClient
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  
  const profilesList = profiles || []
  const profilesMap: Record<string, any> = {}
  profilesList.forEach(p => {
    profilesMap[p.id] = {
      name: p.full_name || 'Customer',
      email: p.email || 'No email',
    }
  })

  // Apply search query on orders (by order number or customer name/email)
  if (searchQuery) {
    const q = searchQuery.toLowerCase()
    filteredOrders = filteredOrders.filter(o => {
      const customer = profilesMap[o.user_id] || {}
      return (
        o.number.toLowerCase().includes(q) ||
        (customer.name || '').toLowerCase().includes(q) ||
        (customer.email || '').toLowerCase().includes(q)
      )
    })
  }

  // 4. Fetch custom database products
  const { data: dbProducts } = await adminClient
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  const productsList = (dbProducts || []).map((p: any) => ({
    id: p.id,
    title: p.title,
    handle: p.handle,
    price: Number(p.price || 0),
    imageUrl: p.featured_image?.src || '',
    collectionHandle: p.collection_handles?.[0] || 'accessories',
    status: p.status || 'New in',
    careInstruction: p.care_instruction || '',
    shippingAndReturn: p.shipping_and_return || '',
    features: p.features || [],
    description: p.description || '',
    stock: p.stock !== undefined ? Number(p.stock) : 10,
    created_at: p.created_at
  }))

  // 5. Fetch reviews
  const { data: dbReviews } = await adminClient
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false })

  const reviewsList = (dbReviews || []).map((r: any) => ({
    id: r.id,
    userId: r.user_id,
    productId: r.product_id,
    rating: Number(r.rating || 5),
    title: r.title || '',
    content: r.content || '',
    authorName: r.author_name || 'Customer',
    createdAt: r.created_at
  }))

  // 6. Fetch discount codes (handling missing table error gracefully)
  let couponsList: any[] = []
  try {
    const { data: dbDiscounts, error: discountError } = await adminClient
      .from('discount_codes')
      .select('*')
      .order('created_at', { ascending: false })

    if (!discountError && dbDiscounts) {
      couponsList = dbDiscounts.map((c: any) => ({
        id: c.id,
        code: c.code,
        discount: Number(c.discount),
        type: c.type,
        description: c.description || '',
        active: !!c.active,
        createdAt: c.created_at
      }))
    }
  } catch (err) {
    console.warn('discount_codes table could not be fetched:', err)
  }

  // 7. Map orders for Orders tab
  const mappedOrders = filteredOrders.map((order: any) => ({
    id: order.id,
    number: order.number,
    date: order.date || new Date(order.created_at).toLocaleDateString(),
    status: order.status,
    total: Number(order.total || 0),
    created_at: order.created_at,
    carrier: order.carrier || '',
    tracking_number: order.tracking_number || '',
    items: (order.items || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      quantity: Number(item.quantity || 1),
      price: Number(item.price || 0),
    })),
    customer: profilesMap[order.user_id] || { name: 'Customer', email: 'No email' },
  }))

  const mappedCustomers = profilesList.map((p: any) => {
    const customerOrders = ordersList.filter(o => o.user_id === p.id)
    return {
      id: p.id,
      name: p.full_name || 'Customer',
      email: p.email || 'No email',
      role: p.role || 'user',
      blocked: !!p.blocked,
      avatarUrl: p.avatar_url || '',
      phone: p.phone_number || '',
      joinedAt: new Date(p.created_at).toLocaleDateString(),
      orderCount: customerOrders.length,
      totalSpent: customerOrders.reduce((sum, o) => sum + Number(o.total || 0), 0),
      storeCredit: Number(p.store_credit || 0)
    }
  })

  // 9. Prepare daily sales chart data for the past 7 orders / days
  const ordersReversed = [...ordersList].reverse()
  const chartData = ordersReversed.slice(-10).map((o: any) => ({
    label: o.number,
    revenue: Number(o.total || 0) * 84, // convert to INR
    itemsCount: o.total_quantity || 1,
  }))

  // 10. Fetch store settings (gracefully handle missing table/keys)
  let settingsList: any[] = []
  try {
    const { data: dbSettings, error: settingsError } = await adminClient
      .from('store_settings')
      .select('*')
 
    if (!settingsError && dbSettings) {
      settingsList = dbSettings
    }
  } catch (err) {
    console.warn('store_settings table could not be fetched:', err)
  }

  // 11. Fetch notifications
  let notificationsList: any[] = []
  try {
    const { data: dbNotifications } = await adminClient
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
    if (dbNotifications) {
      notificationsList = dbNotifications
    }
  } catch (err) {
    console.warn('notifications table could not be fetched:', err)
  }

  // 12. Fetch support tickets
  let supportTicketsList: any[] = []
  try {
    const { data: dbTickets } = await adminClient
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false })
    if (dbTickets) {
      supportTicketsList = dbTickets
    }
  } catch (err) {
    console.warn('support_tickets table could not be fetched:', err)
  }

  // 13. Fetch active carts list
  let activeCartsList: any[] = []
  try {
    const { data: cartItems } = await adminClient
      .from('cart_items')
      .select('*')
      .order('created_at', { ascending: false })

    if (cartItems && cartItems.length > 0) {
      const userIds = Array.from(new Set(cartItems.map(item => item.user_id)))
      const productIds = Array.from(new Set(cartItems.map(item => item.product_id)))

      const [profilesResult, productsResult] = await Promise.all([
        adminClient.from('profiles').select('id, full_name, email, avatar_url').in('id', userIds),
        adminClient.from('products').select('id, title, price, featured_image').in('id', productIds)
      ])

      const localProfilesMap = new Map(profilesResult.data?.map(p => [p.id, p]) || [])
      const localProductsMap = new Map(productsResult.data?.map(p => [p.id, p]) || [])

      const userCartsMap = new Map<string, { user: any; items: any[]; totalValue: number; totalItems: number }>()

      cartItems.forEach(item => {
        const prof = localProfilesMap.get(item.user_id) || {
          id: item.user_id,
          full_name: 'Anonymous Customer',
          email: 'Unknown Email',
          avatar_url: null
        }
        const prod = localProductsMap.get(item.product_id)

        const itemPrice = prod ? Number(prod.price) : 0
        const itemValue = itemPrice * item.quantity

        if (!userCartsMap.has(item.user_id)) {
          userCartsMap.set(item.user_id, {
            user: prof,
            items: [],
            totalValue: 0,
            totalItems: 0
          })
        }

        const userCart = userCartsMap.get(item.user_id)!
        userCart.items.push({
          id: item.id,
          productId: item.product_id,
          title: prod ? prod.title : 'Deleted Product',
          price: itemPrice,
          image: prod?.featured_image?.src || '',
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          createdAt: item.created_at
        })
        userCart.totalValue += itemValue
        userCart.totalItems += item.quantity
      })

      activeCartsList = Array.from(userCartsMap.values())
    }
  } catch (err) {
    console.warn('cart_items query failed:', err)
  }

  // 14. Fetch audit logs
  let auditLogsList: any[] = []
  try {
    const { data: dbAuditLogs } = await adminClient
      .from('admin_audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
    if (dbAuditLogs) {
      auditLogsList = dbAuditLogs
    }
  } catch (err) {
    console.warn('admin_audit_logs table could not be fetched:', err)
  }

  return (
    <div className="container py-12">
      <AdminDashboardClient
        orders={mappedOrders}
        metrics={metrics}
        initialSearch={searchQuery}
        initialStatus={statusFilter}
        customers={mappedCustomers}
        products={productsList}
        reviews={reviewsList}
        coupons={couponsList}
        chartData={chartData}
        settings={settingsList}
        initialNotifications={notificationsList}
        initialSupportTickets={supportTicketsList}
        initialActiveCarts={activeCartsList}
        initialAuditLogs={auditLogsList}
      />
    </div>
  )
}
export const revalidate = 0 // Disable cache for admin data accuracy
