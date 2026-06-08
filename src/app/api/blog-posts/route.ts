import { NextResponse } from 'next/server'
import { getServerClient, getServiceRoleClient } from '@/lib/admin'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const includeAll = searchParams.get('all') === 'true'

  if (includeAll) {
    const { supabase, error } = await requireAdmin()
    if (error) return error

    const { data, error: dbError } = await supabase
      .from('blog_posts')
      .select('*')
      .order('updated_at', { ascending: false })

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  }

  const supabase = getServiceRoleClient() ?? (await getServerClient())

  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })

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

  const { title, slug, excerpt, content, featured_image_url, author_name, category, tags, reading_time_minutes, is_published, is_featured, published_at } = await request.json()

  if (!title || !content) {
    return NextResponse.json({ error: 'Title and content required' }, { status: 400 })
  }

  // Generate slug from title if not provided
  const finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const { data, error: dbError } = await supabase
    .from('blog_posts')
    .insert([{
      title,
      slug: finalSlug,
      excerpt,
      content,
      featured_image_url,
      author_name: author_name || 'Brandon Bee Dixon',
      category: category || 'General',
      tags: tags || [],
      reading_time_minutes: reading_time_minutes || 5,
      is_published: is_published || false,
      is_featured: is_featured || false,
      published_at: is_published ? (published_at || new Date().toISOString()) : null,
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

  const { id, title, slug, excerpt, content, featured_image_url, author_name, category, tags, reading_time_minutes, is_published, is_featured, published_at } = await request.json()

  if (!id) {
    return NextResponse.json({ error: 'Post ID required' }, { status: 400 })
  }

  const { data, error: dbError } = await supabase
    .from('blog_posts')
    .update({
      title,
      slug,
      excerpt,
      content,
      featured_image_url,
      author_name,
      category,
      tags,
      reading_time_minutes,
      is_published,
      is_featured,
      published_at: is_published ? (published_at || new Date().toISOString()) : null,
      updated_at: new Date().toISOString(),
    })
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
    return NextResponse.json({ error: 'Post ID required' }, { status: 400 })
  }

  const { error: dbError } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', id)

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
