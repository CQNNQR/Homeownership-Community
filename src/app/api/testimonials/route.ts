import { revalidatePath } from 'next/cache'
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

// After any testimonial mutation, force the homepage to re-render
// so the next request sees the new active rows. /testimonials has
// its own revalidation already (every 10s via revalidate=10), but
// the / page only refreshes its 10-second ISR window on demand.
const PUBLIC_REVALIDATE_PATHS = ['/']

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const includeAll = searchParams.get('all') === '1' || searchParams.get('all') === 'true'
  const requestId = newRequestId()

  if (includeAll) {
    const guard = await requireAdminOrResponse()
    if (!guard.ok) return guard.response
    return withServerLog(
      { requestId, op: 'list_testimonials_all', table: 'testimonials', userId: guard.user.id },
      async () => {
        const { data, error } = await guard.supabase.from('testimonials').select('*')
        if (error) {
          logServerOp({ requestId, op: 'list_testimonials_all', table: 'testimonials', userId: guard.user.id, errorCode: error.code })
          return ok([])
        }
        return ok(data || [])
      },
    )
  }

  // Public read: anon key client is fine because RLS exposes active rows.
  const supabase = getServiceRoleClient() ?? (await getServerClient())
  return withServerLog(
    { requestId, op: 'list_testimonials_public', table: 'testimonials' },
    async () => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_active', true)
      if (error) {
        logServerOp({ requestId, op: 'list_testimonials_public', table: 'testimonials', errorCode: error.code })
        // Surface a structured 500 so a Supabase outage is visible
        // to operators instead of masquerading as "no testimonials".
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
  const { name, quote } = body as { name?: string; quote?: string }
  if (!name || !quote) return badRequest('name and quote required')

  return withServerLog(
    { requestId, op: 'create_testimonial', table: 'testimonials', userId: guard.user.id },
    async () => {
      const { data, error } = await guard.supabase
        .from('testimonials')
        .insert([{
          name,
          quote,
          role: (body as { role?: string }).role,
          is_active: (body as { is_active?: boolean }).is_active ?? true,
        }])
        .select()
        .single()
      if (error || !data) {
        logServerOp({ requestId, op: 'create_testimonial', table: 'testimonials', userId: guard.user.id, errorCode: error?.code })
        return badRequest(error?.message ?? 'Insert failed')
      }
      for (const p of PUBLIC_REVALIDATE_PATHS) revalidatePath(p)
      return ok(data, 'Testimonial created')
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
    { requestId, op: 'replace_testimonial', table: 'testimonials', recordId: body.id, userId: guard.user.id },
    async () => {
      const { data, error } = await guard.supabase
        .from('testimonials')
        .update({ name: body.name, quote: body.quote, role: body.role, is_active: body.is_active })
        .eq('id', body.id)
        .select()
        .single()
      if (error || !data) {
        logServerOp({ requestId, op: 'replace_testimonial', table: 'testimonials', recordId: body.id, userId: guard.user.id, errorCode: error?.code })
        return error ? badRequest(error.message) : notFound('Testimonial')
      }
      for (const p of PUBLIC_REVALIDATE_PATHS) revalidatePath(p)
      return ok(data, 'Testimonial updated')
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
    'name', 'quote', 'role', 'is_active',
  ] as const)
  if (Object.keys(patch).length === 0) {
    return badRequest('No writable fields supplied', { ignored })
  }

  return withServerLog(
    { requestId, op: 'patch_testimonial', table: 'testimonials', recordId: id, userId: guard.user.id, meta: { ignored } },
    async () => {
      const { data, error } = await guard.supabase
        .from('testimonials')
        .update(patch)
        .eq('id', id)
        .select()
        .single()
      if (error || !data) {
        logServerOp({ requestId, op: 'patch_testimonial', table: 'testimonials', recordId: id, userId: guard.user.id, errorCode: error?.code })
        return error ? badRequest(error.message) : notFound('Testimonial')
      }
      for (const p of PUBLIC_REVALIDATE_PATHS) revalidatePath(p)
      return ok(data, 'Testimonial updated')
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
    { requestId, op: 'soft_delete_testimonial', table: 'testimonials', recordId: body.id, userId: guard.user.id },
    async () => {
      const { data, error } = await guard.supabase
        .from('testimonials')
        .update({ is_active: false })
        .eq('id', body.id)
        .select('id')
        .single()
      if (error || !data) {
        logServerOp({ requestId, op: 'soft_delete_testimonial', table: 'testimonials', recordId: body.id, userId: guard.user.id, errorCode: error?.code })
        return error ? badRequest(error.message) : notFound('Testimonial')
      }
      for (const p of PUBLIC_REVALIDATE_PATHS) revalidatePath(p)
      return ok({ id: body.id }, 'Testimonial deactivated')
    },
  )
}
