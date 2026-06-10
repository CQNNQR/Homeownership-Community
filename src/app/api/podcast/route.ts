import {
  badRequest,
  notFound,
  ok,
  parsePartial,
  newRequestId,
  logServerOp,
  withServerLog,
} from '@/lib/api'
import { getServiceRoleClient, getServerClient, requireAdminOrResponse } from '@/lib/admin'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const includeAll = searchParams.get('all') === '1' || searchParams.get('all') === 'true'
  const requestId = newRequestId()

  if (includeAll) {
    const guard = await requireAdminOrResponse()
    if (!guard.ok) return guard.response
    return withServerLog(
      { requestId, op: 'list_podcast_all', table: 'podcast_episodes', userId: guard.user.id },
      async () => {
        const { data, error } = await guard.supabase.from('podcast_episodes').select('*')
        if (error) {
          logServerOp({ requestId, op: 'list_podcast_all', table: 'podcast_episodes', userId: guard.user.id, errorCode: error.code })
          return ok([])
        }
        return ok(data || [])
      },
    )
  }

  const supabase = getServiceRoleClient() ?? (await getServerClient())
  return withServerLog(
    { requestId, op: 'list_podcast_public', table: 'podcast_episodes' },
    async () => {
      const { data, error } = await supabase
        .from('podcast_episodes')
        .select('*')
        .eq('is_visible', true)
        .order('episode_number', { ascending: true })
      if (error) {
        logServerOp({ requestId, op: 'list_podcast_public', table: 'podcast_episodes', errorCode: error.code })
        return ok([])
      }
      return ok(data || [])
    },
  )
}

export async function POST(request: Request) {
  const guard = await requireAdminOrResponse()
  if (!guard.ok) return guard.response
  const requestId = newRequestId()
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') return badRequest('Body must be a JSON object')
  const { title, youtube_url } = body as { title?: string; youtube_url?: string }
  if (!title || !youtube_url) return badRequest('title and youtube_url required')

  return withServerLog(
    { requestId, op: 'create_podcast', table: 'podcast_episodes', userId: guard.user.id },
    async () => {
      const { data, error } = await guard.supabase
        .from('podcast_episodes')
        .insert([{
          title,
          description: (body as { description?: string }).description,
          youtube_url,
          episode_number: (body as { episode_number?: number }).episode_number || null,
          is_visible: (body as { is_visible?: boolean }).is_visible ?? true,
          published_at: (body as { published_at?: string }).published_at || new Date().toISOString(),
        }])
        .select()
        .single()
      if (error || !data) {
        logServerOp({ requestId, op: 'create_podcast', table: 'podcast_episodes', userId: guard.user.id, errorCode: error?.code })
        return badRequest(error?.message ?? 'Insert failed')
      }
      return ok(data, 'Episode created')
    },
  )
}

export async function PUT(request: Request) {
  const guard = await requireAdminOrResponse()
  if (!guard.ok) return guard.response
  const requestId = newRequestId()
  const body = (await request.json().catch(() => null)) as { id?: string; [k: string]: unknown } | null
  if (!body?.id) return badRequest('id required')

  return withServerLog(
    { requestId, op: 'replace_podcast', table: 'podcast_episodes', recordId: body.id, userId: guard.user.id },
    async () => {
      const { data, error } = await guard.supabase
        .from('podcast_episodes')
        .update({
          title: body.title,
          description: body.description,
          youtube_url: body.youtube_url,
          episode_number: body.episode_number,
          is_visible: body.is_visible,
          published_at: body.published_at,
        })
        .eq('id', body.id)
        .select()
        .single()
      if (error || !data) {
        logServerOp({ requestId, op: 'replace_podcast', table: 'podcast_episodes', recordId: body.id, userId: guard.user.id, errorCode: error?.code })
        return error ? badRequest(error.message) : notFound('Episode')
      }
      return ok(data, 'Episode updated')
    },
  )
}

export async function PATCH(request: Request) {
  const guard = await requireAdminOrResponse()
  if (!guard.ok) return guard.response
  const requestId = newRequestId()
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') return badRequest('Body must be a JSON object')
  const { id, ...rest } = body as { id?: string; [k: string]: unknown }
  if (!id) return badRequest('id required')

  const { patch, ignored } = parsePartial<Record<string, unknown>>(rest, [
    'title', 'description', 'youtube_url', 'episode_number', 'is_visible', 'published_at',
  ] as const)
  if (Object.keys(patch).length === 0) {
    return badRequest('No writable fields supplied', { ignored })
  }

  return withServerLog(
    { requestId, op: 'patch_podcast', table: 'podcast_episodes', recordId: id, userId: guard.user.id, meta: { ignored } },
    async () => {
      const { data, error } = await guard.supabase
        .from('podcast_episodes')
        .update(patch)
        .eq('id', id)
        .select()
        .single()
      if (error || !data) {
        logServerOp({ requestId, op: 'patch_podcast', table: 'podcast_episodes', recordId: id, userId: guard.user.id, errorCode: error?.code })
        return error ? badRequest(error.message) : notFound('Episode')
      }
      return ok(data, 'Episode updated')
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
    { requestId, op: 'delete_podcast', table: 'podcast_episodes', recordId: body.id, userId: guard.user.id },
    async () => {
      const { error } = await guard.supabase
        .from('podcast_episodes')
        .delete()
        .eq('id', body.id)
      if (error) {
        logServerOp({ requestId, op: 'delete_podcast', table: 'podcast_episodes', recordId: body.id, userId: guard.user.id, errorCode: error.code })
        return badRequest(error.message)
      }
      return ok({ id: body.id }, 'Episode deleted')
    },
  )
}
