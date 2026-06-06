import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

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

export async function GET() {
  try {
    await authorizeAdmin()
    const adminClient = createAdminClient()

    // 1. Fetch all cart items
    const { data: cartItems, error: cartError } = await adminClient
      .from('cart_items')
      .select('*')
      .order('created_at', { ascending: false })

    if (cartError) {
      console.warn('Failed to query cart_items (table might not exist):', cartError.message)
      return NextResponse.json({ success: true, carts: [] })
    }

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ success: true, carts: [] })
    }

    // 2. Extract unique user IDs and product IDs
    const userIds = Array.from(new Set(cartItems.map(item => item.user_id)))
    const productIds = Array.from(new Set(cartItems.map(item => item.product_id)))

    // 3. Fetch profiles and products in parallel
    const [profilesResult, productsResult] = await Promise.all([
      adminClient.from('profiles').select('id, full_name, email, avatar_url').in('id', userIds),
      adminClient.from('products').select('id, title, price, featured_image').in('id', productIds)
    ])

    const profilesMap = new Map(profilesResult.data?.map(p => [p.id, p]) || [])
    const productsMap = new Map(productsResult.data?.map(p => [p.id, p]) || [])

    // 4. Group cart items by user
    const userCartsMap = new Map<string, { user: any; items: any[]; totalValue: number; totalItems: number }>()

    cartItems.forEach(item => {
      const profile = profilesMap.get(item.user_id) || {
        id: item.user_id,
        full_name: 'Anonymous Customer',
        email: 'Unknown Email',
        avatar_url: null
      }
      const product = productsMap.get(item.product_id)

      const itemPrice = product ? Number(product.price) : 0
      const itemValue = itemPrice * item.quantity

      if (!userCartsMap.has(item.user_id)) {
        userCartsMap.set(item.user_id, {
          user: profile,
          items: [],
          totalValue: 0,
          totalItems: 0
        })
      }

      const userCart = userCartsMap.get(item.user_id)!
      userCart.items.push({
        id: item.id,
        productId: item.product_id,
        title: product ? product.title : 'Deleted Product',
        price: itemPrice,
        image: product?.featured_image?.src || '',
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        createdAt: item.created_at
      })
      userCart.totalValue += itemValue
      userCart.totalItems += item.quantity
    })

    const responseCarts = Array.from(userCartsMap.values())

    return NextResponse.json({ success: true, carts: responseCarts })
  } catch (err: any) {
    if (err.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (err.message === 'Forbidden') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
