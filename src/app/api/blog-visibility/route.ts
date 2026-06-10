import { revalidatePath } from 'next/cache'
import {
  badRequest,
  ok,
  newRequestId,
  logServerOp,
  withServerLog,
} from '@/lib/api'
import { getServiceRoleClient, getServerClient } from '@/lib/admin'

async function fetchWordPressPosts() {
  const url = `${process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://your-wordpress-site.com'}/wp-json/wp/v2/posts?_embed&per_page=20&status=publish`
  try {
    const res = await fetch(url, { next: { revalidate: 60 } })
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

export async function GET() {
  const supabase = getServiceRoleClient() ?? (await getServerClient())
  const requestId = newRequestId()
  return withServerLog(
    { requestId, op: 'list_blog_visibility', table: 'blog_post_visibility' },
    async () => {
      const { data: visibilityData } = await supabase
        .from('blog_post_visibility')
        .select('wordpress_id, slug, is_visible')

      const wpPosts = await fetchWordPressPosts()
      const visibilityMap = new Map(
        (visibilityData || []).map((v) => [String((v as { wordpress_id: number }).wordpress_id), v as { wordpress_id: number; slug: string; is_visible: boolean }]),
      )

      const posts = wpPosts.map((post: any) => {
        const visibility = visibilityMap.get(String(post.id))
        return {
          wordpress_id: post.id,
          slug: post.slug,
          title: post.title?.rendered,
          excerpt: post.excerpt?.rendered,
          image: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || null,
          image_alt: post._embedded?.['wp:featuredmedia']?.[0]?.alt_text || '',
          date: post.date,
          category: post._embedded?.['wp:term']?.[0]?.[0]?.name || 'Blog',
          is_visible: visibility?.is_visible ?? true,
        }
      })
      return ok(posts)
    },
  )
}

/**
 * PATCH: { wordpress_id, slug, title, action: 'toggle' } — single
 * toggle. The /api/blog-visibility POST also accepts action='sync'
 * for the admin "Sync from WordPress" button.
 */
export async function POST(request: Request) {
  // Admin guard: this endpoint has always been admin-gated because
  // it writes blog_post_visibility.
  const { requireAdminOrResponse } = await import('@/lib/admin')
  const guard = await requireAdminOrResponse()
  if (!guard.ok) return guard.response
  const requestId = newRequestId()
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') return badRequest('Body must be a JSON object')
  const { wordpress_id, slug, title, action } = body as {
    wordpress_id?: number; slug?: string; title?: string; action?: string
  }
  if (!action) return badRequest('action required')
  if (!wordpress_id) return badRequest('wordpress_id required')

  return withServerLog(
    { requestId, op: 'blog_visibility', table: 'blog_post_visibility', recordId: String(wordpress_id), userId: guard.user.id, meta: { action } },
    async () => {
      const writeClient = getServiceRoleClient() ?? guard.supabase

      if (action === 'toggle') {
        const { data: existing } = await writeClient
          .from('blog_post_visibility')
          .select('is_visible')
          .eq('wordpress_id', wordpress_id)
          .maybeSingle()
        const newVisibility = existing ? !(existing as { is_visible: boolean }).is_visible : false

        const { error } = await writeClient
          .from('blog_post_visibility')
          .upsert({
            wordpress_id,
            slug,
            title,
            is_visible: newVisibility,
            updated_at: new Date().toISOString(),
          })
        if (error) {
          logServerOp({ requestId, op: 'blog_visibility_toggle', table: 'blog_post_visibility', recordId: String(wordpress_id), userId: guard.user.id, errorCode: error.code })
          return badRequest(error.message)
        }
        revalidatePath('/blog')
        if (slug) revalidatePath(`/blog/${slug}`)
        return ok({ is_visible: newVisibility }, 'Visibility toggled')
      }

      if (action === 'sync') {
        const wpPosts = await fetchWordPressPosts()
        let inserted = 0
        for (const post of wpPosts) {
          const { data: existing } = await writeClient
            .from('blog_post_visibility')
            .select('wordpress_id')
            .eq('wordpress_id', post.id)
            .maybeSingle()
          if (!existing) {
            const { error } = await writeClient
              .from('blog_post_visibility')
              .insert({
                wordpress_id: post.id,
                slug: post.slug,
                title: post.title?.rendered,
                is_visible: true,
              })
            if (!error) inserted++
          }
        }
        revalidatePath('/blog')
        return ok({ count: wpPosts.length, inserted }, 'Sync complete')
      }

      return badRequest(`Unknown action: ${action}`)
    },
  )
}
