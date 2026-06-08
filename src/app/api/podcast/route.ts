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
      .from('podcast_episodes')
      .select('*')

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  }

  // Public read: anon client is fine because the public RLS policy
  // already allows SELECT on rows where is_visible = true.
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data, error } = await supabase
    .from('podcast_episodes')
    .select('*')
    .eq('is_visible', true)
    .order('episode_number', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data || [])
}

export async function POST(request: Request) {
  const { supabase, error } = await requireAdmin()
  if (error) return error

  const { title, description, youtube_url, episode_number, is_visible, published_at } = await request.json()

  if (!title || !youtube_url) {
    return NextResponse.json({ error: 'Title and YouTube URL required' }, { status: 400 })
  }

  const { data, error: dbError } = await supabase
    .from('podcast_episodes')
    .insert([{
      title,
      description,
      youtube_url,
      episode_number: episode_number || null,
      is_visible: is_visible ?? true,
      published_at: published_at || new Date().toISOString(),
    }])
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

  const { id, title, description, youtube_url, episode_number, is_visible, published_at } = await request.json()

  if (!id) {
    return NextResponse.json({ error: 'Episode ID required' }, { status: 400 })
  }

  const { data, error: dbError } = await supabase
    .from('podcast_episodes')
    .update({ title, description, youtube_url, episode_number, is_visible, published_at })
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
    return NextResponse.json({ error: 'Episode ID required' }, { status: 400 })
  }

  const { error: dbError } = await supabase
    .from('podcast_episodes')
    .delete()
    .eq('id', id)

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
