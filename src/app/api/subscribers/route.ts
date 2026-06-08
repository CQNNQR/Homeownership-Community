import { NextResponse } from 'next/server'
import { getServerClient, getServiceRoleClient } from '@/lib/admin'

export async function GET() {
  const authSupabase = await getServerClient()
  const { data: { user } } = await authSupabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (user.app_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const supabase = getServiceRoleClient() ?? authSupabase

  const { data, error } = await supabase
    .from('subscribers')
    .select('*')
    .eq('is_active', true)
    .order('subscribed_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data || [])
}

export async function POST(request: Request) {
  const supabase = getServiceRoleClient() ?? (await getServerClient())

  const { email } = await request.json()

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('subscribers')
    .insert([{ email }])
    .select()
    .single()

  if (error) {
    // Ignore duplicate email errors
    if (error.code === '23505') {
      return NextResponse.json({ message: 'Already subscribed' }, { status: 200 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
