import { revalidatePath } from 'next/cache'
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

const PUBLIC_REVALIDATE_PATHS = ['/', '/events']

export async function GET() {
  const supabase = getServiceRoleClient() ?? (await getServerClient())
  const requestId = newRequestId()
  return withServerLog(
    { requestId, op: 'list_events', table: 'events' },
    async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_active', true)
        .order('event_date', { ascending: true })
      if (error) {
        logServerOp({ requestId, op: 'list_events', table: 'events', errorCode: error.code })
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
  const { title, event_date } = body as { title?: string; event_date?: string }
  if (!title || !event_date) return badRequest('Title and event_date required')

  return withServerLog(
    { requestId, op: 'create_event', table: 'events', userId: guard.user.id },
    async () => {
      const { data, error } = await guard.supabase
        .from('events')
        .insert([{
          title,
          description: (body as { description?: string }).description,
          event_date,
          event_url: (body as { event_url?: string }).event_url,
        }])
        .select()
        .single()
      if (error || !data) {
        logServerOp({ requestId, op: 'create_event', table: 'events', userId: guard.user.id, errorCode: error?.code })
        return badRequest(error?.message ?? 'Insert failed')
      }
      for (const p of PUBLIC_REVALIDATE_PATHS) revalidatePath(p)
      return ok(data, 'Event created')
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
    { requestId, op: 'replace_event', table: 'events', recordId: body.id, userId: guard.user.id },
    async () => {
      const { data, error } = await guard.supabase
        .from('events')
        .update({
          title: body.title,
          description: body.description,
          event_date: body.event_date,
          event_url: body.event_url,
          is_active: body.is_active,
        })
        .eq('id', body.id)
        .select()
        .single()
      if (error || !data) {
        logServerOp({ requestId, op: 'replace_event', table: 'events', recordId: body.id, userId: guard.user.id, errorCode: error?.code })
        return error ? badRequest(error.message) : notFound('Event')
      }
      for (const p of PUBLIC_REVALIDATE_PATHS) revalidatePath(p)
      return ok(data, 'Event updated')
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
    'title', 'description', 'event_date', 'event_url', 'is_active',
  ] as const)
  if (Object.keys(patch).length === 0) {
    return badRequest('No writable fields supplied', { ignored })
  }

  return withServerLog(
    { requestId, op: 'patch_event', table: 'events', recordId: id, userId: guard.user.id, meta: { ignored } },
    async () => {
      const { data, error } = await guard.supabase
        .from('events')
        .update(patch)
        .eq('id', id)
        .select()
        .single()
      if (error || !data) {
        logServerOp({ requestId, op: 'patch_event', table: 'events', recordId: id, userId: guard.user.id, errorCode: error?.code })
        return error ? badRequest(error.message) : notFound('Event')
      }
      for (const p of PUBLIC_REVALIDATE_PATHS) revalidatePath(p)
      return ok(data, 'Event updated')
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
    { requestId, op: 'delete_event', table: 'events', recordId: body.id, userId: guard.user.id },
    async () => {
      const { data, error } = await guard.supabase
        .from('events')
        .update({ is_active: false })
        .eq('id', body.id)
        .select('id')
        .single()
      if (error || !data) {
        logServerOp({ requestId, op: 'delete_event', table: 'events', recordId: body.id, userId: guard.user.id, errorCode: error?.code })
        return error ? badRequest(error.message) : notFound('Event')
      }
      for (const p of PUBLIC_REVALIDATE_PATHS) revalidatePath(p)
      return ok({ id: body.id }, 'Event deactivated')
    },
  )
}
