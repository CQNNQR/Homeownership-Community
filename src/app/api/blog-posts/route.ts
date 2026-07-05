/**
 * /api/blog-posts
 *
 * CRUD over the local `blog_posts` table (Supabase) that powers the
 * admin Blog Manager's "Local" tab.
 *
 * Endpoints:
 *   GET    /api/blog-posts                  -> public, only is_published=true
 *   GET    /api/blog-posts?all=true|1       -> admin-only, all rows
 *   POST   /api/blog-posts                  -> admin-only, insert new post
 *   PUT    /api/blog-posts                  -> admin-only, replace by id
 *   DELETE /api/blog-posts                  -> admin-only, delete by id
 *
 * PATCH is intentionally not supported: the admin form sends the full
 * record on edit (use PUT). If/when the admin shifts to true partial
 * updates, add PATCH using the parsePartial() helper from @/lib/api.
 *
 * Response shape follows the standard { data, error } envelope used
 * elsewhere in the codebase. Public GET also returns the raw rows
 * (consistent with /api/podcast public mode) — the admin client
 * accepts both a bare array and an envelope.
 */
import {
  badRequest,
  internalError,
  notFound,
  ok,
  newRequestId,
  logServerOp,
  withServerLog,
} from '@/lib/api'
import { getServiceRoleClient, getServerClient, requireAdminOrResponse } from '@/lib/admin'

const PUBLIC_SELECT =
  'id, title, slug, excerpt, content, featured_image_url, author_name, category, tags, reading_time_minutes, is_published, is_featured, published_at, created_at, updated_at'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const includeAll = searchParams.get('all') === 'true' || searchParams.get('all') === '1'
  const requestId = newRequestId()

  // Admin view (drafts included, no filter).
  if (includeAll) {
    const guard = await requireAdminOrResponse()
    if (!guard.ok) return guard.response
    return withServerLog(
      { requestId, op: 'list_blog_posts_all', table: 'blog_posts', userId: guard.user.id },
      async () => {
        const { data, error } = await guard.supabase
          .from('blog_posts')
          .select(PUBLIC_SELECT)
          .order('created_at', { ascending: false })
        if (error) {
          logServerOp({
            requestId,
            op: 'list_blog_posts_all',
            table: 'blog_posts',
            userId: guard.user.id,
            errorCode: error.code,
          })
          return internalError(error.message, { code: error.code })
        }
        return ok(data || [])
      },
    )
  }

  // Public view: only published posts.
  const supabase = getServiceRoleClient() ?? (await getServerClient())
  return withServerLog(
    { requestId, op: 'list_blog_posts_public', table: 'blog_posts' },
    async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(PUBLIC_SELECT)
        .eq('is_published', true)
        .order('published_at', { ascending: false, nullsFirst: false })
      if (error) {
        logServerOp({
          requestId,
          op: 'list_blog_posts_public',
          table: 'blog_posts',
          errorCode: error.code,
        })
        return internalError(error.message, { code: error.code })
      }
      return ok(data || [])
    },
  )
}

interface PostBody {
  title?: unknown
  slug?: unknown
  excerpt?: unknown
  content?: unknown
  featured_image_url?: unknown
  author_name?: unknown
  category?: unknown
  tags?: unknown
  reading_time_minutes?: unknown
  is_published?: unknown
  is_featured?: unknown
  published_at?: unknown
  id?: unknown
}

function readPostFields(body: PostBody) {
  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const slug = typeof body.slug === 'string' && body.slug.trim() ? body.slug.trim() : null
  const content = typeof body.content === 'string' ? body.content : ''
  const excerpt = typeof body.excerpt === 'string' ? body.excerpt : null
  const featured_image_url =
    typeof body.featured_image_url === 'string' && body.featured_image_url.trim()
      ? body.featured_image_url.trim()
      : null
  const author_name =
    typeof body.author_name === 'string' && body.author_name.trim()
      ? body.author_name.trim()
      : 'Brandon Bee Dixon'
  const category =
    typeof body.category === 'string' && body.category.trim()
      ? body.category.trim()
      : 'General'
  const tags = Array.isArray(body.tags)
    ? (body.tags.filter((t) => typeof t === 'string') as string[])
    : []
  const reading_time_minutes =
    typeof body.reading_time_minutes === 'number' && Number.isFinite(body.reading_time_minutes)
      ? Math.max(1, Math.round(body.reading_time_minutes))
      : 5
  const is_published = body.is_published === true
  const is_featured = body.is_featured === true
  const published_at =
    typeof body.published_at === 'string' && body.published_at
      ? new Date(body.published_at).toISOString()
      : null
  return {
    title,
    slug,
    content,
    excerpt,
    featured_image_url,
    author_name,
    category,
    tags,
    reading_time_minutes,
    is_published,
    is_featured,
    published_at,
  }
}

export async function POST(request: Request) {
  const guard = await requireAdminOrResponse()
  if (!guard.ok) return guard.response
  const requestId = newRequestId()
  const body = (await request.json().catch(() => null)) as PostBody | null
  if (!body || typeof body !== 'object') return badRequest('Body must be a JSON object')
  const fields = readPostFields(body)
  if (!fields.title) return badRequest('title required')
  if (!fields.content) return badRequest('content required')
  if (!fields.slug) return badRequest('slug required')

  return withServerLog(
    { requestId, op: 'create_blog_post', table: 'blog_posts', userId: guard.user.id },
    async () => {
      const { data, error } = await guard.supabase
        .from('blog_posts')
        .insert([fields])
        .select(PUBLIC_SELECT)
        .single()
      if (error || !data) {
        logServerOp({
          requestId,
          op: 'create_blog_post',
          table: 'blog_posts',
          userId: guard.user.id,
          errorCode: error?.code,
        })
        return badRequest(error?.message ?? 'Insert failed')
      }
      return ok(data, 'Post created')
    },
  )
}

export async function PUT(request: Request) {
  const guard = await requireAdminOrResponse()
  if (!guard.ok) return guard.response
  const requestId = newRequestId()
  const body = (await request.json().catch(() => null)) as PostBody | null
  if (!body || typeof body !== 'object') return badRequest('Body must be a JSON object')
  const id = typeof body.id === 'string' ? body.id : ''
  if (!id) return badRequest('id required')
  const fields = readPostFields(body)
  if (!fields.title) return badRequest('title required')
  if (!fields.content) return badRequest('content required')
  if (!fields.slug) return badRequest('slug required')

  return withServerLog(
    {
      requestId,
      op: 'replace_blog_post',
      table: 'blog_posts',
      recordId: id,
      userId: guard.user.id,
    },
    async () => {
      const { data, error } = await guard.supabase
        .from('blog_posts')
        .update({
          ...fields,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select(PUBLIC_SELECT)
        .single()
      if (error || !data) {
        logServerOp({
          requestId,
          op: 'replace_blog_post',
          table: 'blog_posts',
          recordId: id,
          userId: guard.user.id,
          errorCode: error?.code,
        })
        return error ? badRequest(error.message) : notFound('Post')
      }
      return ok(data, 'Post updated')
    },
  )
}

export async function DELETE(request: Request) {
  const guard = await requireAdminOrResponse()
  if (!guard.ok) return guard.response
  const requestId = newRequestId()
  const body = (await request.json().catch(() => null)) as { id?: string } | null
  if (!body?.id) return badRequest('id required')

  return withServerLog(
    {
      requestId,
      op: 'delete_blog_post',
      table: 'blog_posts',
      recordId: body.id,
      userId: guard.user.id,
    },
    async () => {
      const { error } = await guard.supabase.from('blog_posts').delete().eq('id', body.id)
      if (error) {
        logServerOp({
          requestId,
          op: 'delete_blog_post',
          table: 'blog_posts',
          recordId: body.id,
          userId: guard.user.id,
          errorCode: error.code,
        })
        return badRequest(error.message)
      }
      return ok({ id: body.id }, 'Post deleted')
    },
  )
}
