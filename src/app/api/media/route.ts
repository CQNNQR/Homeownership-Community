import { NextResponse } from 'next/server'
import { getServerClient, getServiceRoleClient } from '@/lib/admin'

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

export async function GET() {
  const { supabase, error } = await requireAdmin()
  if (error) return error

  const { data, error: dbError } = await supabase
    .from('media')
    .select('*')
    .order('created_at', { ascending: false })

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json(data || [])
}

export async function POST(request: Request) {
  const { supabase, error } = await requireAdmin()
  if (error) return error

  const { name, url, type, size } = await request.json()

  if (!name || !url || !type) {
    return NextResponse.json({ error: 'Name, URL and type required' }, { status: 400 })
  }

  const { data, error: dbError } = await supabase
    .from('media')
    .insert([{ name, url, type, size }])
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
    return NextResponse.json({ error: 'Media ID required' }, { status: 400 })
  }

  const { error: dbError } = await supabase
    .from('media')
    .delete()
    .eq('id', id)

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
