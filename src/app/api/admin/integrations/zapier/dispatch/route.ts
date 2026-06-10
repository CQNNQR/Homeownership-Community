import { ok, badRequest, newRequestId, withServerLog } from '@/lib/api'
import { requireAdminOrResponse } from '@/lib/admin'
import { dispatchPendingJobs } from '@/lib/leads'

/**
 * POST /api/admin/integrations/zapier/dispatch
 *
 * Drains the lead_delivery_jobs queue (one batch) and attempts
 * delivery for each job whose next_attempt_at is now.
 *
 * Two auth modes:
 *   1. Admin user (cookie session) — for the manual "Drain queue"
 *      button in the admin UI.
 *   2. Vercel Cron — Authorization: Bearer ${CRON_SECRET} header.
 *      Wire this to a daily cron in vercel.json to retry the queue
 *      without a human in the loop.
 *
 * Body (optional): { batchSize?: number; force?: boolean }
 */
export async function POST(request: Request) {
  const requestId = newRequestId()
  const cronSecret = process.env.CRON_SECRET
  const authHeader = request.headers.get('authorization') || ''
  const isCron = cronSecret && authHeader === `Bearer ${cronSecret}`

  if (!isCron) {
    const guard = await requireAdminOrResponse()
    if (!guard.ok) return guard.response
  }

  return withServerLog(
    { requestId, op: 'dispatch_pending_jobs', table: 'lead_delivery_jobs', userId: isCron ? null : undefined, meta: { via: isCron ? 'cron' : 'admin' } },
    async () => {
      const body = await request.json().catch(() => ({}))
      const batchSize = Number((body as { batchSize?: number }).batchSize) || 25
      const force = Boolean((body as { force?: boolean }).force)
      if (batchSize < 1 || batchSize > 200) {
        return badRequest('batchSize must be between 1 and 200')
      }
      const result = await dispatchPendingJobs({ batchSize, force })
      return ok(result, `Dispatched ${result.attempted} jobs`)
    },
  )
}

// Also expose GET for the same purpose so Vercel Cron (which uses GET
// by default) can call this endpoint without configuration changes.
export const GET = POST
