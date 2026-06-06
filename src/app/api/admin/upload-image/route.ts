import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 450 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const adminClient = createAdminClient()

    // 1. Attempt to create 'products' storage bucket if not exist
    try {
      await adminClient.storage.createBucket('products', {
        public: true,
      })
    } catch (e) {
      // Bucket might already exist or create is disallowed, which is fine
    }

    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`

    // 2. Upload file to 'products' bucket
    const { data, error } = await adminClient.storage
      .from('products')
      .upload(fileName, buffer, {
        contentType: file.type,
        duplex: 'half',
      })

    if (error) {
      // Fallback: try uploading to the 'avatars' bucket (which is guaranteed to exist)
      const { data: fallbackData, error: fallbackError } = await adminClient.storage
        .from('avatars')
        .upload(`products/${fileName}`, buffer, {
          contentType: file.type,
          duplex: 'half',
        })
      
      if (fallbackError) {
        return NextResponse.json({ error: fallbackError.message }, { status: 500 })
      }
      
      const { data: { publicUrl } } = adminClient.storage
        .from('avatars')
        .getPublicUrl(`products/${fileName}`)
        
      return NextResponse.json({ url: publicUrl })
    }

    const { data: { publicUrl } } = adminClient.storage
      .from('products')
      .getPublicUrl(fileName)

    return NextResponse.json({ url: publicUrl })
  } catch (err: any) {
    console.error('Image upload error:', err)
    return NextResponse.json({ error: err.message || 'Failed to upload image' }, { status: 500 })
  }
}
export const maxDuration = 60 // Allow longer runtime for storage upload
