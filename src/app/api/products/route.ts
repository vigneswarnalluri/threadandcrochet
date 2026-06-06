import { NextResponse } from 'next/server'
import { getProducts, getProductDetailByHandle } from '@/data/data'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const handle = searchParams.get('handle')
    const handles = searchParams.get('handles')
    const ids = searchParams.get('ids')

    if (handle) {
      const productDetail = await getProductDetailByHandle(handle)
      if (!productDetail) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }
      return NextResponse.json(productDetail)
    }

    const allProducts = await getProducts()

    if (handles) {
      const handleList = handles.split(',').map(h => h.trim().toLowerCase())
      const filtered = allProducts.filter(p => handleList.includes(p.handle.toLowerCase()))
      return NextResponse.json(filtered)
    }

    if (ids) {
      const idList = ids.split(',').map(id => id.trim())
      const filtered = allProducts.filter(p => idList.includes(p.id.toString()))
      return NextResponse.json(filtered)
    }

    return NextResponse.json(allProducts)
  } catch (error: any) {
    console.error('Error in /api/products API:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
