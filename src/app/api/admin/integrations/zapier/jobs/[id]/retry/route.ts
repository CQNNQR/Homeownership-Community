import { badRequest, notFound, ok, newRequestId, withServerLog } from '@/lib/api'
import { requireAdminOrResponse } from '@/lib/admin'
import { dispatchLeadJob } from '@/lib/leads'

/**
 * POST /api/admin/integrations/zapier/jobs/[id]/retry
 *
 * Forces an immediate redelivery attempt for a specific job, even if
 * the job is `dead` or its next_attempt_at is in the future. Returns
 * the dispatch result so the admin UI can show the outcome.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdminOrResponse()
  if (!guard.ok) return guard.response
  const { id } = await params
  if (!id) return badRequest('id required')
  const requestId = newRequestId()
  return withServerLog(
    { requestId, op: 'retry_delivery_job', table: 'lead_delivery_jobs', recordId: id, userId: guard.user.id },
    async () => {
      const result = await dispatchLeadJob({ id, force: true })
      if (result.error === 'job not found') return notFound('Lead delivery job')
      return ok(result, result.ok ? 'Delivery succeeded' : 'Delivery failed; job rescheduled')
    },
  )
}
