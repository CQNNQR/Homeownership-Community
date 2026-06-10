import { ok, newRequestId, withServerLog } from '@/lib/api'
import { requireAdminOrResponse } from '@/lib/admin'

/**
 * GET /api/admin/integrations/zapier/jobs
 *
 * Lists lead_delivery_jobs with the most recent first. Supports
 * `?status=pending|delivered|failed|dead|in_flight` and `?limit=N`.
 * Returns a summary block (counts by status) so the admin UI can
 * show a queue dashboard without N extra round-trips.
 */
export async function GET(request: Request) {
  const guard = await requireAdminOrResponse()
  if (!guard.ok) return guard.response
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10) || 50, 200)
  const requestId = newRequestId()

  return withServerLog(
    { requestId, op: 'list_delivery_jobs', table: 'lead_delivery_jobs', userId: guard.user.id, meta: { status, limit } },
    async () => {
      let query = guard.supabase
        .from('lead_delivery_jobs')
        .select('id, subscriber_id, idempotency_key, status, attempt_count, max_attempts, last_http_status, last_error, next_attempt_at, delivered_at, created_at, updated_at, payload')
        .order('created_at', { ascending: false })
        .limit(limit)
      if (status) query = query.eq('status', status)
      const { data, error } = await query
      if (error) return ok({ jobs: [], summary: { pending: 0, in_flight: 0, delivered: 0, failed: 0, dead: 0 } })

      // Summary counts (independent query — fine for the dashboard).
      const { data: counts } = await guard.supabase
        .from('lead_delivery_jobs')
        .select('status')
      const summary = { pending: 0, in_flight: 0, delivered: 0, failed: 0, dead: 0 }
      for (const row of (counts || []) as Array<{ status: string }>) {
        if (row.status in summary) (summary as Record<string, number>)[row.status]++
      }

      return ok({ jobs: data || [], summary })
    },
  )
}
