import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

export const revalidate = 0 // Disable cache for live settings

export async function GET() {
  try {
    const adminClient = createAdminClient()
    const { data, error } = await adminClient
      .from('store_settings')
      .select('*')

    if (error) {
      console.error('Database error fetching settings:', error)
      return NextResponse.json({ success: false, settings: [] })
    }

    return NextResponse.json({ success: true, settings: data || [] })
  } catch (err: any) {
    console.error('Settings API handler error:', err)
    return NextResponse.json({ success: false, error: err.message || 'Server error' }, { status: 500 })
  }
}
