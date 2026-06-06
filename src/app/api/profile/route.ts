import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, address, email, phone_number, avatar_url')
      .eq('id', user.id)
      .single()

    return NextResponse.json({
      fullName: profile?.full_name || user.email?.split('@')[0] || 'Guest',
      address: profile?.address || '',
      email: profile?.email || user.email || '',
      phoneNumber: profile?.phone_number || '',
      avatarUrl: profile?.avatar_url || null,
    })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
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
    const { fullName, address, email, phoneNumber } = body

    const updateData: any = {
      id: user.id,
      updated_at: new Date().toISOString(),
    }

    if (fullName !== undefined) updateData.full_name = fullName
    if (address !== undefined) updateData.address = address
    if (email !== undefined) updateData.email = email
    if (phoneNumber !== undefined) updateData.phone_number = phoneNumber

    const { data, error } = await supabase
      .from('profiles')
      .upsert(updateData)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      profile: data,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}

