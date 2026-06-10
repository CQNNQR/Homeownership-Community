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

const PUBLIC_REVALIDATE_PATHS = ['/', '/books']

export async function GET() {
  const supabase = getServiceRoleClient() ?? (await getServerClient())
  const requestId = newRequestId()
  return withServerLog(
    { requestId, op: 'list_books', table: 'books' },
    async () => {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
      if (error) {
        logServerOp({ requestId, op: 'list_books', table: 'books', errorCode: error.code })
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

  const title = (body as { title?: unknown }).title
  const amazonUrl = (body as { amazon_url?: unknown }).amazon_url
  if (!title || !amazonUrl) return badRequest('Title and Amazon URL required')

  return withServerLog(
    { requestId, op: 'create_book', table: 'books', userId: guard.user.id },
    async () => {
      const { data, error } = await guard.supabase
        .from('books')
        .insert([{
          title,
          author: (body as { author?: string }).author,
          amazon_url: amazonUrl,
          description: (body as { description?: string }).description,
          sort_order: (body as { sort_order?: number }).sort_order ?? 0,
        }])
        .select()
        .single()
      if (error || !data) {
        logServerOp({ requestId, op: 'create_book', table: 'books', userId: guard.user.id, errorCode: error?.code })
        return badRequest(error?.message ?? 'Insert failed')
      }
      for (const p of PUBLIC_REVALIDATE_PATHS) revalidatePath(p)
      return ok(data, 'Book created')
    },
  )
}

export async function PUT(request: Request) {
  const guard = await requireAdminOrResponse()
  if (!guard.ok) return guard.response
  const requestId = newRequestId()
  const body = (await request.json().catch(() => null)) as { id?: string; [k: string]: unknown } | null
  if (!body || typeof body !== 'object' || !body.id) return badRequest('id required')

  return withServerLog(
    { requestId, op: 'replace_book', table: 'books', recordId: body.id, userId: guard.user.id },
    async () => {
      const { data, error } = await guard.supabase
        .from('books')
        .update({
          title: body.title,
          author: body.author,
          amazon_url: body.amazon_url,
          description: body.description,
          sort_order: body.sort_order,
          is_active: body.is_active,
        })
        .eq('id', body.id)
        .select()
        .single()
      if (error || !data) {
        logServerOp({ requestId, op: 'replace_book', table: 'books', recordId: body.id, userId: guard.user.id, errorCode: error?.code })
        return error ? badRequest(error.message) : notFound('Book')
      }
      for (const p of PUBLIC_REVALIDATE_PATHS) revalidatePath(p)
      return ok(data, 'Book updated')
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
    'title', 'author', 'amazon_url', 'description', 'sort_order', 'is_active',
  ] as const)
  if (Object.keys(patch).length === 0) {
    return badRequest('No writable fields supplied', { ignored })
  }

  return withServerLog(
    { requestId, op: 'patch_book', table: 'books', recordId: id, userId: guard.user.id, meta: { ignored } },
    async () => {
      const { data, error } = await guard.supabase
        .from('books')
        .update(patch)
        .eq('id', id)
        .select()
        .single()
      if (error || !data) {
        logServerOp({ requestId, op: 'patch_book', table: 'books', recordId: id, userId: guard.user.id, errorCode: error?.code })
        return error ? badRequest(error.message) : notFound('Book')
      }
      for (const p of PUBLIC_REVALIDATE_PATHS) revalidatePath(p)
      return ok(data, 'Book updated')
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
    { requestId, op: 'delete_book', table: 'books', recordId: body.id, userId: guard.user.id },
    async () => {
      const { data, error } = await guard.supabase
        .from('books')
        .update({ is_active: false })
        .eq('id', body.id)
        .select('id')
        .single()
      if (error || !data) {
        logServerOp({ requestId, op: 'delete_book', table: 'books', recordId: body.id, userId: guard.user.id, errorCode: error?.code })
        return error ? badRequest(error.message) : notFound('Book')
      }
      for (const p of PUBLIC_REVALIDATE_PATHS) revalidatePath(p)
      return ok({ id: body.id }, 'Book deactivated')
    },
  )
}
