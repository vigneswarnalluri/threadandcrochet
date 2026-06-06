import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'
import { logAdminAction } from '@/utils/audit'

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

// PUT: Update product SEO metadata
export async function PUT(request: NextRequest) {
  try {
    await authorizeAdmin()
    const body = await request.json()
    const { productId, seoTitle, seoDescription } = body

    if (!productId) {
      return NextResponse.json({ error: 'Missing productId' }, { status: 400 })
    }

    const adminClient = createAdminClient()
    const { data, error } = await adminClient
      .from('products')
      .update({
        seo_title: seoTitle || null,
        seo_description: seoDescription || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId)
      .select('id, title, seo_title, seo_description')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    await logAdminAction({
      action: 'update_product_seo',
      targetType: 'product',
      targetId: productId,
      details: `Updated SEO metadata for product. Title: "${seoTitle || '(cleared)'}", Desc: "${(seoDescription || '(cleared)').slice(0, 80)}..."`,
    })

    return NextResponse.json({ success: true, product: data })
  } catch (err: any) {
    if (err.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (err.message === 'Forbidden') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
