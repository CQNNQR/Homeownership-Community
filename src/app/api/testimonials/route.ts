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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const includeAll = searchParams.get('all') === '1' || searchParams.get('all') === 'true'

  if (includeAll) {
    const { supabase, error } = await requireAdmin()
    if (error) return error

    const { data, error: dbError } = await supabase
      .from('testimonials')
      .select('*')

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  }

  // Public read: anon client is fine because the public RLS policy
  // already allows SELECT on rows where is_active = true.
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .eq('is_active', true)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data || [])
}

export async function POST(request: Request) {
  const { supabase, error } = await requireAdmin()
  if (error) return error

  const { name, quote, role, is_active } = await request.json()

  if (!name || !quote) {
    return NextResponse.json({ error: 'Name and quote required' }, { status: 400 })
  }

  const { data, error: dbError } = await supabase
    .from('testimonials')
    .insert([{ name, quote, role, is_active: is_active ?? true }])
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

  const { id, name, quote, role, is_active } = await request.json()

  if (!id) {
    return NextResponse.json({ error: 'Testimonial ID required' }, { status: 400 })
  }

  const { data, error: dbError } = await supabase
    .from('testimonials')
    .update({ name, quote, role, is_active })
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
    return NextResponse.json({ error: 'Testimonial ID required' }, { status: 400 })
  }

  // Soft delete to match the editor's existing behavior: it sets
  // is_active=false rather than removing the row.
  const { error: dbError } = await supabase
    .from('testimonials')
    .update({ is_active: false })
    .eq('id', id)

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
