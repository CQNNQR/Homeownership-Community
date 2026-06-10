import { ok, newRequestId, withServerLog } from '@/lib/api'
import { requireAdminOrResponse } from '@/lib/admin'
import { verifySchema } from '@/lib/deployment-checks'
import { isWebhookConfigured } from '@/lib/zapier'

/**
 * GET /api/admin/health
 *
 * Aggregated backend health for the admin "Backend Health" tab.
 * Reports:
 *   - Supabase connectivity (read of _migrations_state)
 *   - schema version (from the new repair migration)
 *   - env-var presence (sanitized — never returns values)
 *   - Zapier webhook configuration status (boolean only)
 *   - lead_delivery_jobs queue backlog (counts by status)
 *   - last successful delivery timestamp
 */
export async function GET() {
  const guard = await requireAdminOrResponse()
  if (!guard.ok) return guard.response
  const requestId = newRequestId()
  return withServerLog(
    { requestId, op: 'admin_health', table: '_migrations_state', userId: guard.user.id },
    async () => {
      const drift = await verifySchema()
      const envStatus: Record<string, { configured: boolean }> = {
        NEXT_PUBLIC_SUPABASE_URL: { configured: !!process.env.NEXT_PUBLIC_SUPABASE_URL },
        NEXT_PUBLIC_SUPABASE_ANON_KEY: { configured: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY },
        SUPABASE_SERVICE_ROLE_KEY: { configured: !!process.env.SUPABASE_SERVICE_ROLE_KEY },
        RESEND_API_KEY: { configured: !!process.env.RESEND_API_KEY },
        NEXT_PUBLIC_SITE_URL: { configured: !!process.env.NEXT_PUBLIC_SITE_URL },
        ZAPIER_WEBHOOK_URL: { configured: isWebhookConfigured() },
        CRON_SECRET: { configured: !!process.env.CRON_SECRET },
      }

      // Queue stats
      let queue: { pending: number; in_flight: number; delivered: number; failed: number; dead: number; last_delivery_at: string | null } = {
        pending: 0, in_flight: 0, delivered: 0, failed: 0, dead: 0, last_delivery_at: null,
      }
      if (drift.ok || drift.missingTables.length === 0) {
        const { data: rows } = await guard.supabase
          .from('lead_delivery_jobs')
          .select('status, delivered_at')
        if (rows) {
          for (const r of rows as Array<{ status: string; delivered_at: string | null }>) {
            if (r.status in queue) (queue as unknown as Record<string, number | string | null>)[r.status] = ((queue as unknown as Record<string, number>)[r.status] || 0) + 1
            if (r.delivered_at && (!queue.last_delivery_at || r.delivered_at > queue.last_delivery_at)) {
              queue.last_delivery_at = r.delivered_at as string
            }
          }
        }
      }

      return ok({
        checked_at: new Date().toISOString(),
        schema: {
          ok: drift.ok,
          schema_version: drift.schemaVersion,
          missing_tables: drift.missingTables,
          missing_columns: drift.missingColumns,
        },
        env: envStatus,
        queue,
      })
    },
  )
}
