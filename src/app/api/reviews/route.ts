import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getProductReviews } from '@/data/data'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('product_id')

    if (!productId) {
      return NextResponse.json({ error: 'Missing product_id parameter' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: dbReviews, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Fetch avatars from profiles for these users
    const userIds = Array.from(new Set((dbReviews || []).map((r: any) => r.user_id)))
    const profileMap: Record<string, string> = {}
    const verifiedPurchasers = new Set<string>()

    if (userIds.length > 0) {
      // 1. Fetch profile photos
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, avatar_url')
        .in('id', userIds)
      
      if (profiles) {
        profiles.forEach((p: any) => {
          if (p.avatar_url) {
            profileMap[p.id] = p.avatar_url
          }
        })
      }

      // 2. Query user purchase verification from orders
      const { data: orders } = await supabase
        .from('orders')
        .select('user_id, items')
        .in('user_id', userIds)
        .in('status', ['Paid', 'Processing', 'Shipped', 'Delivered'])

      if (orders) {
        orders.forEach((order: any) => {
          const items = order.items || []
          const hasPurchasedProduct = items.some((item: any) => item.productHandle === productId)
          if (hasPurchasedProduct) {
            verifiedPurchasers.add(order.user_id)
          }
        })
      }
    }

    // Map database reviews to UI structure
    const reviews = (dbReviews || []).map((rev: any) => ({
      id: rev.id,
      title: rev.title || '',
      rating: rev.rating,
      content: rev.content,
      author: rev.author_name,
      authorAvatar: profileMap[rev.user_id] ? { src: profileMap[rev.user_id] } : undefined,
      isVerifiedBuyer: verifiedPurchasers.has(rev.user_id),
      date: new Date(rev.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      datetime: rev.created_at,
    }))

    const mockReviews = await getProductReviews(productId)
    const mergedReviews = [...reviews, ...mockReviews]

    return NextResponse.json({ reviews: mergedReviews })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { productId, rating, title, content } = body

    if (!productId || !rating || !content) {
      return NextResponse.json({ error: 'Missing required review fields' }, { status: 400 })
    }

    // Get author name from profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    const authorName = profile?.full_name || user.email?.split('@')[0] || 'Customer'

    const reviewData = {
      user_id: user.id,
      product_id: productId,
      rating,
      title: title || '',
      content,
      author_name: authorName,
    }

    const { data, error } = await supabase
      .from('reviews')
      .insert(reviewData)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      message: 'Review submitted successfully',
      review: data,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
