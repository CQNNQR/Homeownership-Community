import { NextResponse } from 'next/server'
import { getServerClient, getServiceRoleClient } from '@/lib/admin'
import { sendToZapier } from '@/lib/zapier'

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

  const body = await request.json()
  const email: string | undefined = body?.email
  const firstName: string | null = body?.firstName ? String(body.firstName).trim() : null
  const lastName: string | null = body?.lastName ? String(body.lastName).trim() : null
  const phone: string | null = body?.phone ? String(body.phone).trim() : null
  const source: string = body?.source ? String(body.source) : 'unknown'

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('subscribers')
    .insert([{ email, first_name: firstName, last_name: lastName, phone }])
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ message: 'Already subscribed' }, { status: 200 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  sendToZapier({
    email,
    first_name: firstName,
    last_name: lastName,
    phone,
    source,
    created_at: new Date().toISOString(),
  }).catch(err => console.error('Zapier webhook error:', err))

  return NextResponse.json(data)
}
