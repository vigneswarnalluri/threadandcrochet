import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { logAdminAction } from '@/utils/audit'

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

function getHexForColor(c: string): string {
  const map: Record<string, string> = {
    red: '#ef4444',
    blue: '#3b82f6',
    green: '#22c55e',
    yellow: '#eab308',
    pink: '#ec4899',
    purple: '#a855f7',
    orange: '#f97316',
    white: '#ffffff',
    black: '#000000',
    gray: '#6b7280',
    grey: '#6b7280',
    beige: '#ebd9be',
    brown: '#78350f',
  }
  return map[c.toLowerCase().trim()] || '#ebd9be'
}

export async function POST(request: NextRequest) {
  try {
    await authorizeAdmin()
    const body = await request.json()
    const { products } = body

    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: 'Invalid or empty products list' }, { status: 400 })
    }

    const adminClient = createAdminClient()
    const batchProducts = []
    const now = Date.now()

    for (let i = 0; i < products.length; i++) {
      const p = products[i]
      const title = p.title?.trim()
      const price = Number(p.price)

      if (!title || isNaN(price)) {
        return NextResponse.json({ error: `Product at row ${i + 1} is missing a valid title or price.` }, { status: 400 })
      }

      const id = `custom-${now}-${i}`
      const handle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || id

      // Featured Image
      const imageUrl = p.imageUrl?.trim() || 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=736'
      const featured_image = {
        src: imageUrl,
        width: 1000,
        height: 1000,
        alt: title
      }

      // Gallery Images
      const imageList = [featured_image]
      if (p.galleryUrls) {
        let urls: string[] = []
        if (Array.isArray(p.galleryUrls)) {
          urls = p.galleryUrls
        } else if (typeof p.galleryUrls === 'string') {
          urls = p.galleryUrls.split(',').map((u: string) => u.trim())
        }
        urls.forEach(url => {
          if (url) {
            imageList.push({
              src: url,
              width: 1000,
              height: 1000,
              alt: title
            })
          }
        })
      }

      // Options (Colors & Sizes)
      let colors: string[] = []
      if (p.colors) {
        if (Array.isArray(p.colors)) colors = p.colors
        else if (typeof p.colors === 'string') colors = p.colors.split(',').map((c: string) => c.trim())
      }
      const colorValues = colors.length > 0
        ? colors.map(c => ({ name: c.trim(), swatch: { color: getHexForColor(c), image: null } }))
        : [{ name: 'Original', swatch: { color: '#ebd9be', image: null } }]

      let sizes: string[] = []
      if (p.sizes) {
        if (Array.isArray(p.sizes)) sizes = p.sizes
        else if (typeof p.sizes === 'string') sizes = p.sizes.split(',').map((s: string) => s.trim())
      }
      const sizeValues = sizes.length > 0
        ? sizes.map(s => ({ name: s.trim(), swatch: null }))
        : [{ name: 'Standard', swatch: null }]

      const options = [
        { name: 'Color', optionValues: colorValues },
        { name: 'Size', optionValues: sizeValues }
      ]

      const selected_options = [
        { name: 'Color', value: colorValues[0].name },
        { name: 'Size', value: sizeValues[0].name }
      ]

      let collection_handles = ['accessories']
      if (p.collectionHandle) {
        collection_handles = [p.collectionHandle.trim()]
      } else if (p.collection_handles) {
        if (Array.isArray(p.collection_handles)) collection_handles = p.collection_handles
        else if (typeof p.collection_handles === 'string') collection_handles = p.collection_handles.split(',').map((c: string) => c.trim())
      }

      let features: string[] = []
      if (p.features) {
        if (Array.isArray(p.features)) features = p.features
        else if (typeof p.features === 'string') features = p.features.split(',').map((f: string) => f.trim())
      }

      batchProducts.push({
        id,
        title,
        handle,
        price,
        description: p.description || '',
        featured_image,
        images: imageList,
        collection_handles,
        status: p.status || 'New in',
        features,
        care_instruction: p.careInstruction || p.care_instruction || '',
        shipping_and_return: p.shippingAndReturn || p.shipping_and_return || 'Standard shipping rates apply.',
        rating: 5.0,
        review_number: 0,
        stock: p.stock !== undefined ? Number(p.stock) : 10,
        options,
        selected_options
      })
    }

    const { data, error } = await adminClient
      .from('products')
      .insert(batchProducts)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Insert stock logs for batch products
    if (data && data.length > 0) {
      try {
        const stockLogs = data.map((prod: any) => ({
          product_id: prod.id,
          change: prod.stock || 0,
          reason: 'CSV Bulk upload'
        }))
        await adminClient.from('stock_logs').insert(stockLogs)
      } catch (logErr) {
        console.error('Failed to write stock logs for batch upload:', logErr)
      }

      // Log admin action
      await logAdminAction({
        action: 'batch_upload_products',
        targetType: 'product',
        details: `Imported ${data.length} products via CSV upload.`
      })
    }

    return NextResponse.json({ success: true, count: data?.length || 0, products: data })
  } catch (err: any) {
    if (err.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (err.message === 'Forbidden') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
