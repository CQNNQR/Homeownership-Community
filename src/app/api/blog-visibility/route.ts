import { NextResponse } from 'next/server'
import { getServerClient, getServiceRoleClient } from '@/lib/admin'

// Helper to fetch from WordPress
async function fetchWordPressPosts() {
  const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://your-wordpress-site.com'
  const url = `${WORDPRESS_URL}/wp-json/wp/v2/posts?_embed&per_page=20&status=publish`

  try {
    const response = await fetch(url, { next: { revalidate: 60 } })
    if (!response.ok) return []
    return await response.json()
  } catch (error) {
    console.error('Error fetching from WordPress:', error)
    return []
  }
}

export async function GET() {
  const supabase = getServiceRoleClient() ?? (await getServerClient())

  // Get visibility settings from our DB
  const { data: visibilityData } = await supabase
    .from('blog_post_visibility')
    .select('wordpress_id, slug, is_visible')

  // Fetch posts from WordPress
  const wpPosts = await fetchWordPressPosts()

  // Merge visibility data
  const visibilityMap = new Map(
    visibilityData?.map(v => [v.wordpress_id.toString(), v]) ||
    []
  )

  const posts = wpPosts.map((post: any) => {
    const visibility = visibilityMap.get(post.id.toString())
    return {
      wordpress_id: post.id,
      slug: post.slug,
      title: post.title.rendered,
      excerpt: post.excerpt.rendered,
      image: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || null,
      image_alt: post._embedded?.['wp:featuredmedia']?.[0]?.alt_text || '',
      date: post.date,
      category: post._embedded?.['wp:term']?.[0]?.[0]?.name || 'Blog',
      is_visible: visibility?.is_visible ?? true, // Default to visible if not set
    }
  })

  return NextResponse.json(posts)
}

// Sync posts from WordPress and update visibility
export async function POST(request: Request) {
  const authSupabase = await getServerClient()
  const { data: { user } } = await authSupabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (user.app_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const supabase = getServiceRoleClient() ?? authSupabase

  const { wordpress_id, slug, title, action } = await request.json()

  if (action === 'toggle') {
    // Get current visibility
    const { data: existing } = await supabase
      .from('blog_post_visibility')
      .select('is_visible')
      .eq('wordpress_id', wordpress_id)
      .single()

    const newVisibility = existing ? !existing.is_visible : false

    const { error } = await supabase
      .from('blog_post_visibility')
      .upsert({
        wordpress_id,
        slug,
        title,
        is_visible: newVisibility,
        updated_at: new Date().toISOString(),
      })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, is_visible: newVisibility })
  }

  if (action === 'sync') {
    // Sync all posts from WordPress
    const wpPosts = await fetchWordPressPosts()

    for (const post of wpPosts) {
      // Check if exists
      const { data: existing } = await supabase
        .from('blog_post_visibility')
        .select('wordpress_id')
        .eq('wordpress_id', post.id)
        .single()

      if (!existing) {
        // Insert new
        await supabase
          .from('blog_post_visibility')
          .insert({
            wordpress_id: post.id,
            slug: post.slug,
            title: post.title.rendered,
            is_visible: true,
          })
      }
    }

    return NextResponse.json({ success: true, count: wpPosts.length })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
