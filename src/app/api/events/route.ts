import { NextResponse } from 'next/server'
import { getServerClient, getServiceRoleClient } from '@/lib/admin'

export async function GET() {
  const supabase = getServiceRoleClient() ?? (await getServerClient())

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('is_active', true)
    .order('event_date', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data || [])
}

async function requireAdmin() {
  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { supabase: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  if (user.app_metadata?.role !== 'admin') {
    return { supabase: null, error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  const writeClient = getServiceRoleClient() ?? supabase
  return { supabase: writeClient, error: null }
}

export async function POST(request: Request) {
  const { supabase, error } = await requireAdmin()
  if (error) return error

  const { title, description, event_date, event_url } = await request.json()

  if (!title || !event_date) {
    return NextResponse.json({ error: 'Title and event date required' }, { status: 400 })
  }

  const { data, error: dbError } = await supabase
    .from('events')
    .insert([{ title, description, event_date, event_url }])
    .select()
    .single()

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function PUT(request: Request) {
  const { supabase, error } = await requireAdmin()
  if (error) return error

  const { id, title, description, event_date, event_url, is_active } = await request.json()

  if (!id) {
    return NextResponse.json({ error: 'Event ID required' }, { status: 400 })
  }

  const { data, error: dbError } = await supabase
    .from('events')
    .update({ title, description, event_date, event_url, is_active })
    .eq('id', id)
    .select()
    .single()

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(request: Request) {
  const { supabase, error } = await requireAdmin()
  if (error) return error

  const { id } = await request.json()

  if (!id) {
    return NextResponse.json({ error: 'Event ID required' }, { status: 400 })
  }

  const { error: dbError } = await supabase
    .from('events')
    .delete()
    .eq('id', id)

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
