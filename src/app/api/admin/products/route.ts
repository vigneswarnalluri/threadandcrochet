import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { logAdminAction } from '@/utils/audit'

// Admin authorization wrapper
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

// POST: Add a new custom product
export async function POST(request: NextRequest) {
  try {
    await authorizeAdmin()
    const body = await request.json()
    const {
      title,
      price,
      description,
      imageUrl,
      galleryUrls,
      collectionHandle,
      status,
      features,
      careInstruction,
      shippingAndReturn,
      stock,
      colors,
      sizes,
      options,
      selected_options,
      metaTitle,
      metaDescription,
      metaKeywords,
      ogImage
    } = body

    if (!title || !price) {
      return NextResponse.json({ error: 'Missing required fields (title or price)' }, { status: 400 })
    }

    const adminClient = createAdminClient()
    const id = `custom-${Date.now()}`
    const handle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || id

    // Construct featured image
    const featured_image = {
      src: imageUrl || 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=736',
      width: 1000,
      height: 1000,
      alt: title
    }

    // Construct image gallery list
    const imageList = [featured_image]
    if (galleryUrls && Array.isArray(galleryUrls)) {
      galleryUrls.forEach((url: string) => {
        if (url.trim()) {
          imageList.push({
            src: url.trim(),
            width: 1000,
            height: 1000,
            alt: title
          })
        }
      })
    }

    // Construct variants structure
    const colorValues = colors && Array.isArray(colors) && colors.length > 0
      ? colors.map((c: string) => ({ name: c.trim(), swatch: { color: getHexForColor(c.trim()), image: null } }))
      : [{ name: 'Original', swatch: { color: '#ebd9be', image: null } }]

    const sizeValues = sizes && Array.isArray(sizes) && sizes.length > 0
      ? sizes.map((s: string) => ({ name: s.trim(), swatch: null, stock: Number(stock !== undefined ? stock : 10) }))
      : [{ name: 'Standard', swatch: null, stock: Number(stock !== undefined ? stock : 10) }]

    const defaultOptions = [
      { name: 'Color', optionValues: colorValues },
      { name: 'Size', optionValues: sizeValues }
    ]

    const defaultSelectedOptions = [
      { name: 'Color', value: colorValues[0].name },
      { name: 'Size', value: sizeValues[0].name }
    ]

    const productData = {
      id,
      title,
      handle,
      price: Number(price),
      description: description || '',
      featured_image,
      images: imageList,
      collection_handles: collectionHandle ? [collectionHandle] : ['accessories'],
      status: status || 'New in',
      features: features || [],
      care_instruction: careInstruction || '',
      shipping_and_return: shippingAndReturn || 'Standard shipping rates apply.',
      rating: 5.0,
      review_number: 0,
      stock: stock !== undefined ? Number(stock) : 10,
      options: options || defaultOptions,
      selected_options: selected_options || defaultSelectedOptions,
      meta_title: metaTitle || null,
      meta_description: metaDescription || null,
      meta_keywords: metaKeywords || null,
      og_image: ogImage || null
    }

    const { data: product, error } = await adminClient
      .from('products')
      .insert(productData)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Insert stock log
    try {
      await adminClient
        .from('stock_logs')
        .insert({
          product_id: productData.id,
          change: productData.stock,
          reason: 'Initial creation'
        })
    } catch (logErr) {
      console.error('Failed to write stock log for new product:', logErr)
    }

    // Log admin action
    await logAdminAction({
      action: 'create_product',
      targetType: 'product',
      targetId: productData.id,
      details: `Created product "${productData.title}" with initial stock of ${productData.stock} and price of ₹${productData.price}`
    })

    return NextResponse.json({ success: true, product })
  } catch (err: any) {
    if (err.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (err.message === 'Forbidden') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}

// PUT: Edit an existing product
export async function PUT(request: NextRequest) {
  try {
    await authorizeAdmin()
    const body = await request.json()
    const {
      id,
      title,
      price,
      description,
      imageUrl,
      galleryUrls,
      collectionHandle,
      status,
      features,
      careInstruction,
      shippingAndReturn,
      stock,
      colors,
      sizes,
      options,
      selected_options,
      metaTitle,
      metaDescription,
      metaKeywords,
      ogImage
    } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing product ID' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // Fetch current product for stock comparison if needed
    let stockDifference = 0
    let shouldLogStock = false
    let currentStockValue = 0

    if (stock !== undefined) {
      try {
        const { data: currentProduct } = await adminClient
          .from('products')
          .select('stock')
          .eq('id', id)
          .single()
        if (currentProduct) {
          currentStockValue = currentProduct.stock || 0
          stockDifference = Number(stock) - currentStockValue
          if (stockDifference !== 0) {
            shouldLogStock = true
          }
        }
      } catch (e) {
        console.error('Failed to fetch current stock for comparison:', e)
      }
    }

    const updateData: any = {}

    if (title) updateData.title = title
    if (price !== undefined) updateData.price = Number(price)
    if (description !== undefined) updateData.description = description
    if (status !== undefined) updateData.status = status
    if (careInstruction !== undefined) updateData.care_instruction = careInstruction
    if (shippingAndReturn !== undefined) updateData.shipping_and_return = shippingAndReturn
    if (features !== undefined) updateData.features = features
    if (collectionHandle) updateData.collection_handles = [collectionHandle]
    if (stock !== undefined) updateData.stock = Number(stock)
    if (metaTitle !== undefined) updateData.meta_title = metaTitle || null
    if (metaDescription !== undefined) updateData.meta_description = metaDescription || null
    if (metaKeywords !== undefined) updateData.meta_keywords = metaKeywords || null
    if (ogImage !== undefined) updateData.og_image = ogImage || null

    // Handle images updates
    if (imageUrl || galleryUrls) {
      const activeTitle = title || 'Product'
      let mainImg = imageUrl
      if (!mainImg) {
        // Fetch current featured image as fallback
        const { data: currentProduct } = await adminClient
          .from('products')
          .select('featured_image')
          .eq('id', id)
          .single()
        mainImg = currentProduct?.featured_image?.src
      }

      if (mainImg) {
        const featured_image = {
          src: mainImg,
          width: 1000,
          height: 1000,
          alt: activeTitle
        }
        updateData.featured_image = featured_image

        const imageList = [featured_image]
        if (galleryUrls && Array.isArray(galleryUrls)) {
          galleryUrls.forEach((url: string) => {
            if (url.trim()) {
              imageList.push({
                src: url.trim(),
                width: 1000,
                height: 1000,
                alt: activeTitle
              })
            }
          })
        }
        updateData.images = imageList
      }
    }

    // Handle options/variants updates
    if (options && selected_options) {
      updateData.options = options
      updateData.selected_options = selected_options
    } else if (colors || sizes) {
      // Fetch current options as fallback if one of them is missing
      let activeColors = colors
      let activeSizes = sizes

      if (!activeColors || !activeSizes) {
        const { data: currentProduct } = await adminClient
          .from('products')
          .select('options')
          .eq('id', id)
          .single()
        
        const currentOpts = currentProduct?.options || []
        const currentColorOpts = currentOpts.find((o: any) => o.name === 'Color')?.optionValues || []
        const currentSizeOpts = currentOpts.find((o: any) => o.name === 'Size')?.optionValues || []

        if (!activeColors) {
          activeColors = currentColorOpts.map((v: any) => v.name)
        }
        if (!activeSizes) {
          activeSizes = currentSizeOpts.map((v: any) => v.name)
        }
      }

      const colorValues = activeColors && activeColors.length > 0
        ? activeColors.map((c: string) => ({ name: c.trim(), swatch: { color: getHexForColor(c.trim()), image: null } }))
        : [{ name: 'Original', swatch: { color: '#ebd9be', image: null } }]

      const sizeValues = activeSizes && activeSizes.length > 0
        ? activeSizes.map((s: string) => ({ name: s.trim(), swatch: null, stock: Number(stock !== undefined ? stock : 10) }))
        : [{ name: 'Standard', swatch: null, stock: Number(stock !== undefined ? stock : 10) }]

      updateData.options = [
        { name: 'Color', optionValues: colorValues },
        { name: 'Size', optionValues: sizeValues }
      ]

      updateData.selected_options = [
        { name: 'Color', value: colorValues[0].name },
        { name: 'Size', value: sizeValues[0].name }
      ]
    }

    const { data: product, error } = await adminClient
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (shouldLogStock) {
      try {
        await adminClient
          .from('stock_logs')
          .insert({
            product_id: id,
            change: stockDifference,
            reason: 'Manual adjustment'
          })
      } catch (logErr) {
        console.error('Failed to write stock log for edited product:', logErr)
      }
    }

    // Log admin action
    await logAdminAction({
      action: 'update_product',
      targetType: 'product',
      targetId: id,
      details: `Updated product properties: ${Object.keys(updateData).join(', ')}. ${shouldLogStock ? `Stock adjusted from ${currentStockValue} to ${stock} (${stockDifference >= 0 ? '+' : ''}${stockDifference}).` : ''}`
    })

    return NextResponse.json({ success: true, product })
  } catch (err: any) {
    if (err.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (err.message === 'Forbidden') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}

// DELETE: Remove a product
export async function DELETE(request: NextRequest) {
  try {
    await authorizeAdmin()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing product ID' }, { status: 400 })
    }

    const adminClient = createAdminClient()
    const { error } = await adminClient
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Log admin action
    await logAdminAction({
      action: 'delete_product',
      targetType: 'product',
      targetId: id,
      details: `Deleted product ID: ${id}`
    })

    return NextResponse.json({ success: true, message: 'Product deleted successfully' })
  } catch (err: any) {
    if (err.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (err.message === 'Forbidden') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
