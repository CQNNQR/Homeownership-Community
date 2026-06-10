import { randomUUID } from 'node:crypto'
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

export async function GET() {
  const guard = await requireAdminOrResponse()
  if (!guard.ok) return guard.response
  const requestId = newRequestId()
  return withServerLog(
    { requestId, op: 'list_subscribers', table: 'subscribers', userId: guard.user.id },
    async () => {
      const { data, error } = await guard.supabase
        .from('subscribers')
        .select('*')
        .order('last_submitted_at', { ascending: false })
      if (error) {
        logServerOp({ requestId, op: 'list_subscribers', table: 'subscribers', userId: guard.user.id, errorCode: error.code })
        return ok([])
      }
      return ok(data || [])
    },
  )
}

function normalizeEmail(email: unknown): string | null {
  if (typeof email !== 'string') return null
  const trimmed = email.trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return null
  return trimmed
}

/**
 * Public POST remains for legacy callers (the Navigation modal).
 * The new canonical lead endpoint is /api/leads. This route:
 *   - normalizes email
 *   - upserts (reactivates existing records)
 *   - records source + consent timestamp
 *   - enqueues a Zapier delivery job (if /api/leads hasn't already)
 *   - returns the saved record
 */
export async function POST(request: Request) {
  const requestId = newRequestId()
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') return badRequest('Body must be a JSON object')

  const email = normalizeEmail((body as { email?: unknown }).email)
  if (!email) return badRequest('Valid email required')

  const source = String((body as { source?: string }).source ?? 'unknown')
  const firstName = (body as { firstName?: string }).firstName?.trim() || null
  const lastName = (body as { lastName?: string }).lastName?.trim() || null
  const phone = (body as { phone?: string }).phone?.trim() || null
  const idempotencyKey = String((body as { idempotencyKey?: string }).idempotencyKey ?? '')
    || `sub-${email}-${Date.now()}-${randomUUID()}`

  const supabase = getServiceRoleClient() ?? (await getServerClient())

  return withServerLog(
    { requestId, op: 'create_subscriber', table: 'subscribers', meta: { source, email } },
    async () => {
      // Upsert: if email already exists, reactivate and merge new
      // fields; otherwise insert.
      const { data: existing } = await supabase
        .from('subscribers')
        .select('*')
        .eq('email', email)
        .maybeSingle()

      let record
      if (existing) {
        const { data: updated, error: upErr } = await supabase
          .from('subscribers')
          .update({
            first_name: firstName ?? (existing as { first_name?: string }).first_name,
            last_name: lastName ?? (existing as { last_name?: string }).last_name,
            phone: phone ?? (existing as { phone?: string }).phone,
            source,
            is_active: true,
            last_submitted_at: new Date().toISOString(),
            consented_at: new Date().toISOString(),
          })
          .eq('id', (existing as { id: string }).id)
          .select()
          .single()
        if (upErr) {
          logServerOp({ requestId, op: 'update_subscriber', table: 'subscribers', recordId: (existing as { id: string }).id, errorCode: upErr.code })
          return badRequest(upErr.message)
        }
        record = updated
      } else {
        const { data: inserted, error: insErr } = await supabase
          .from('subscribers')
          .insert([{
            email,
            first_name: firstName,
            last_name: lastName,
            phone,
            source,
            is_active: true,
            consented_at: new Date().toISOString(),
            last_submitted_at: new Date().toISOString(),
          }])
          .select()
          .single()
        if (insErr || !inserted) {
          logServerOp({ requestId, op: 'insert_subscriber', table: 'subscribers', errorCode: insErr?.code })
          return badRequest(insErr?.message ?? 'Insert failed')
        }
        record = inserted
      }

      // Enqueue a Zapier delivery job. The /api/leads endpoint does
      // this too; the unique idempotency_key on lead_delivery_jobs
      // makes the second enqueue a no-op.
      const { error: jobErr } = await supabase
        .from('lead_delivery_jobs')
        .upsert([{
          subscriber_id: (record as { id: string }).id,
          idempotency_key: idempotencyKey,
          integration: 'zapier',
          status: 'pending',
          payload: {
            email,
            first_name: firstName,
            last_name: lastName,
            phone,
            source,
            created_at: new Date().toISOString(),
          },
          next_attempt_at: new Date().toISOString(),
        }], { onConflict: 'idempotency_key', ignoreDuplicates: true })

      if (jobErr) {
        logServerOp({ requestId, op: 'enqueue_lead_job', table: 'lead_delivery_jobs', recordId: (record as { id: string }).id, errorCode: jobErr.code })
        // Don't fail the request — the subscriber is saved, the job
        // is the recovery path, not the source of truth.
      }

      return ok(record, existing ? 'Subscriber updated' : 'Subscriber created')
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
    'email', 'first_name', 'last_name', 'phone', 'source', 'is_active', 'consented_at', 'last_submitted_at',
  ] as const)
  if (Object.keys(patch).length === 0) {
    return badRequest('No writable fields supplied', { ignored })
  }

  return withServerLog(
    { requestId, op: 'patch_subscriber', table: 'subscribers', recordId: id, userId: guard.user.id, meta: { ignored } },
    async () => {
      const { data, error } = await guard.supabase
        .from('subscribers')
        .update(patch)
        .eq('id', id)
        .select()
        .single()
      if (error || !data) {
        logServerOp({ requestId, op: 'patch_subscriber', table: 'subscribers', recordId: id, userId: guard.user.id, errorCode: error?.code })
        return error ? badRequest(error.message) : notFound('Subscriber')
      }
      return ok(data, 'Subscriber updated')
    },
  )
}
