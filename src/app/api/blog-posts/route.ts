import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

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

export async function POST(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { title, slug, excerpt, content, featured_image_url, author_name, category, tags, reading_time_minutes, is_published, is_featured, published_at } = await request.json()

  if (!title || !content) {
    return NextResponse.json({ error: 'Title and content required' }, { status: 400 })
  }

  // Generate slug from title if not provided
  const finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const { data, error } = await supabase
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

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function PUT(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { id, title, slug, excerpt, content, featured_image_url, author_name, category, tags, reading_time_minutes, is_published, is_featured, published_at } = await request.json()

  if (!id) {
    return NextResponse.json({ error: 'Post ID required' }, { status: 400 })
  }

  const { data, error } = await supabase
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

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { id } = await request.json()

  if (!id) {
    return NextResponse.json({ error: 'Post ID required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
