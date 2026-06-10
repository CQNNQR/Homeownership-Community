import { badRequest, ok, newRequestId, withServerLog } from '@/lib/api'
import { createLead, LeadError } from '@/lib/leads'

/**
 * POST /api/leads — canonical public lead endpoint.
 *
 * Body:
 *   { email, firstName?, lastName?, phone?, source, consent?, idempotencyKey? }
 *
 * Behavior:
 *   - Validates email
 *   - Calls createLead() which upserts the subscriber, enqueues a
 *     Zapier delivery job, and attempts immediate delivery
 *   - Returns the saved subscriber record (so the success banner can
 *     show "Welcome back, Jane" vs "Check your email")
 *   - Always 200 on validation success even if the Zapier call
 *     failed; the delivery is queued and will be retried
 */
export async function POST(request: Request) {
  const requestId = newRequestId()
  return withServerLog(
    { requestId, op: 'create_lead', table: 'subscribers' },
    async () => {
      const body = await request.json().catch(() => null)
      if (!body || typeof body !== 'object') return badRequest('Body must be a JSON object')
      const { email, firstName, lastName, phone, source, consent, idempotencyKey, extra } = body as {
        email?: string; firstName?: string; lastName?: string; phone?: string;
        source?: string; consent?: boolean; idempotencyKey?: string; extra?: Record<string, unknown>;
      }
      if (!email) return badRequest('email required')
      if (!source) return badRequest('source required')

      try {
        const result = await createLead({
          email,
          firstName,
          lastName,
          phone,
          source,
          consent,
          idempotencyKey: idempotencyKey || request.headers.get('x-idempotency-key') || undefined,
          extra,
        })
        return ok({
          subscriber: result.subscriber,
          job_id: (result.job as { id: string }).id,
          delivery: result.delivery,
        }, 'Lead captured')
      } catch (e) {
        if (e instanceof LeadError) {
          return badRequest(e.message, { code: e.code, details: e.details })
        }
        return ok({ retry_queued: true }, 'Lead received; delivery will retry')
      }
    },
  )
}
