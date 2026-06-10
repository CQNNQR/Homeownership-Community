import { ok, badRequest, newRequestId, withServerLog } from '@/lib/api'
import { requireAdminOrResponse } from '@/lib/admin'
import { pingZapier, isWebhookConfigured } from '@/lib/zapier'

/**
 * POST /api/admin/integrations/zapier/test
 *
 * Sends a small probe payload to the configured webhook and reports
 * the outcome. "Connected" is only reported when the webhook returns
 * a 2xx within the timeout. No DB writes; the test is read-only.
 */
export async function POST(request: Request) {
  const guard = await requireAdminOrResponse()
  if (!guard.ok) return guard.response
  const requestId = newRequestId()
  return withServerLog(
    { requestId, op: 'zapier_test', table: 'lead_delivery_jobs', userId: guard.user.id },
    async () => {
      if (!isWebhookConfigured()) {
        return badRequest('ZAPIER_WEBHOOK_URL is not set on the server')
      }
      const result = await pingZapier()
      return ok({
        webhook_configured: true,
        ok: result.ok,
        skipped: !!result.skipped,
        status: result.status ?? null,
        error: result.error ?? null,
        duration_ms: result.durationMs,
      }, result.ok ? 'Zapier reachable' : 'Zapier unreachable')
    },
  )
}
