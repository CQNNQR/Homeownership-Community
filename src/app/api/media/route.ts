import {
  badRequest,
  internalError,
  notFound,
  ok,
  parsePartial,
  newRequestId,
  logServerOp,
  withServerLog,
} from '@/lib/api'
import { getServiceRoleClient, getServerClient, requireAdminOrResponse } from '@/lib/admin'

export async function GET() {
  const guard = await requireAdminOrResponse()
  if (!guard.ok) return guard.response
  const requestId = newRequestId()
  return withServerLog(
    { requestId, op: 'list_media', table: 'media', userId: guard.user.id },
    async () => {
      const { data, error } = await guard.supabase
        .from('media')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) {
        logServerOp({ requestId, op: 'list_media', table: 'media', userId: guard.user.id, errorCode: error.code })
        return internalError(error.message, { code: error.code })
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
  const { name, url, type, size } = body as { name?: string; url?: string; type?: string; size?: number }
  if (!name || !url || !type) return badRequest('name, url, and type required')

  return withServerLog(
    { requestId, op: 'create_media', table: 'media', userId: guard.user.id },
    async () => {
      const { data, error } = await guard.supabase
        .from('media')
        .insert([{ name, url, type, size: size ?? null }])
        .select()
        .single()
      if (error || !data) {
        logServerOp({ requestId, op: 'create_media', table: 'media', userId: guard.user.id, errorCode: error?.code })
        return badRequest(error?.message ?? 'Insert failed')
      }
      return ok(data, 'Media added')
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
    'name', 'url', 'type', 'size',
  ] as const)
  if (Object.keys(patch).length === 0) {
    return badRequest('No writable fields supplied', { ignored })
  }

  return withServerLog(
    { requestId, op: 'patch_media', table: 'media', recordId: id, userId: guard.user.id, meta: { ignored } },
    async () => {
      const { data, error } = await guard.supabase
        .from('media')
        .update(patch)
        .eq('id', id)
        .select()
        .single()
      if (error || !data) {
        logServerOp({ requestId, op: 'patch_media', table: 'media', recordId: id, userId: guard.user.id, errorCode: error?.code })
        return error ? badRequest(error.message) : notFound('Media')
      }
      return ok(data, 'Media updated')
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
    { requestId, op: 'delete_media', table: 'media', recordId: body.id, userId: guard.user.id },
    async () => {
      const { error } = await guard.supabase
        .from('media')
        .delete()
        .eq('id', body.id)
      if (error) {
        logServerOp({ requestId, op: 'delete_media', table: 'media', recordId: body.id, userId: guard.user.id, errorCode: error.code })
        return badRequest(error.message)
      }
      return ok({ id: body.id }, 'Media deleted')
    },
  )
}
