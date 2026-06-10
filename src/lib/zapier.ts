/**
 * Zapier delivery library.
 *
 * Responsibilities (Backend Recovery Plan §4):
 *   - Resolve the Zapier webhook URL from the server-only env
 *     ZAPIER_WEBHOOK_URL. The URL is no longer stored in site_settings
 *     (it was publicly readable).
 *   - Send a payload to the webhook with a per-job timeout.
 *   - Provide a `dispatchLeadJob` that the cron-style dispatcher
 *     endpoint (/api/admin/integrations/zapier/dispatch) can call
 *     for retries.
 *   - Exponential backoff for failures: attempt 1 → 1m, 2 → 5m,
 *     3 → 15m, 4 → 1h, 5 → 6h, 6 → 24h. After max_attempts the
 *     job goes to `dead`.
 */

const ZAPIER_WEBHOOK_URL = (process.env.ZAPIER_WEBHOOK_URL || '').trim()
const PER_REQUEST_TIMEOUT_MS = 8000

export interface ZapierLeadPayload {
  email: string
  first_name?: string | null
  last_name?: string | null
  phone?: string | null
  source: string
  created_at: string
  [key: string]: unknown
}

export interface DispatchResult {
  ok: boolean
  status?: number
  error?: string
  skipped?: boolean
  durationMs: number
}

/**
 * Backoff schedule in minutes. Index 0 is the first retry (after
 * attempt 1 failed), index N-1 is the last retry before going to
 * `dead`. Aligned with max_attempts = 6.
 */
const BACKOFF_MINUTES = [1, 5, 15, 60, 360, 1440]

export function nextAttemptDelayMinutes(attemptCount: number): number {
  if (attemptCount <= 0) return 0
  const idx = Math.min(attemptCount - 1, BACKOFF_MINUTES.length - 1)
  return BACKOFF_MINUTES[idx]
}

export function isWebhookConfigured(): boolean {
  return /^https?:\/\//i.test(ZAPIER_WEBHOOK_URL)
}

export async function sendToZapier(payload: ZapierLeadPayload): Promise<DispatchResult> {
  const start = Date.now()
  if (!isWebhookConfigured()) {
    return { ok: true, skipped: true, durationMs: Date.now() - start }
  }
  try {
    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), PER_REQUEST_TIMEOUT_MS)
    const res = await fetch(ZAPIER_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
    clearTimeout(t)
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      return { ok: false, status: res.status, error: text || `HTTP ${res.status}`, durationMs: Date.now() - start }
    }
    return { ok: true, status: res.status, durationMs: Date.now() - start }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Unknown error sending to Zapier',
      durationMs: Date.now() - start,
    }
  }
}

/**
 * Test ping used by /api/admin/integrations/zapier/test. Sends a
 * small probe payload (not a real lead) and returns the same shape
 * as sendToZapier.
 */
export async function pingZapier(): Promise<DispatchResult> {
  return sendToZapier({
    email: 'test@homeownership-community.local',
    first_name: 'Zapier',
    last_name: 'ConnectivityTest',
    source: 'admin-integration-test',
    created_at: new Date().toISOString(),
    test: true,
  } as ZapierLeadPayload)
}
