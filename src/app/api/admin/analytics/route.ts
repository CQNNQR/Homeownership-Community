import { ok, badRequest, internalError, withServerLog, newRequestId } from '@/lib/api'
import { requireAdminOrResponse } from '@/lib/admin'

/**
 * GET /api/admin/analytics?range=24h|7d|30d
 *
 * Aggregates page_views for the admin dashboard. Returns:
 *   - summary:       { totalViews, uniqueVisitors, todayViews }
 *   - topPaths:      [{ path, views, uniqueVisitors }]            (top 10)
 *   - topReferrers:  [{ referrerHost, views }]                    (top 10)
 *   - timeline:      [{ hourIso, views }]                         (24 buckets)
 *   - recent:        [{ path, referrerHost, createdAt, isBot }]   (last 20)
 *   - range:         { label, sinceIso }
 *
 * Aggregation is done in JS for the MVP — at typical traffic volumes
 * (a few thousand views/day) pulling the rows and reducing is fine.
 * If the table grows past ~100k rows in the window we can swap the
 * aggregation for a Postgres RPC; the response shape stays identical.
 */

type PageViewRow = {
  path: string
  referrer: string | null
  referrer_host: string | null
  visitor_hash: string
  user_agent: string | null
  is_bot: boolean
  created_at: string
}

const RANGE_TO_HOURS: Record<string, number> = {
  '24h': 24,
  '7d': 24 * 7,
  '30d': 24 * 30,
}

export async function GET(request: Request) {
  const guard = await requireAdminOrResponse()
  if (!guard.ok) return guard.response

  const url = new URL(request.url)
  const rangeKey = (url.searchParams.get('range') || '24h').toLowerCase()
  const hours = RANGE_TO_HOURS[rangeKey]
  if (!hours) {
    return badRequest(`Unknown range "${rangeKey}". Expected one of: 24h, 7d, 30d.`)
  }

  const requestId = newRequestId()
  return withServerLog(
    { requestId, op: 'admin_analytics', table: 'page_views', userId: guard.user.id, meta: { range: rangeKey, hours } },
    async () => {
      const since = new Date(Date.now() - hours * 60 * 60 * 1000)
      const sinceIso = since.toISOString()

      const { data: rows, error } = await guard.supabase
        .from('page_views')
        .select('path, referrer, referrer_host, visitor_hash, user_agent, is_bot, created_at')
        .gte('created_at', sinceIso)
        .order('created_at', { ascending: false })
        .limit(50_000)

      if (error) {
        return internalError(`Failed to load page_views: ${error.message}`, { code: error.code })
      }

      const all = (rows ?? []) as PageViewRow[]
      const humans = all.filter((r) => !r.is_bot)
      const todayStart = new Date()
      todayStart.setUTCHours(0, 0, 0, 0)

      // --- summary ----------------------------------------------------
      const uniqueVisitorSet = new Set(humans.map((r) => r.visitor_hash))
      const todayViews = humans.filter((r) => new Date(r.created_at) >= todayStart).length

      // --- top paths --------------------------------------------------
      const pathMap = new Map<string, { views: number; visitors: Set<string> }>()
      for (const r of humans) {
        const entry = pathMap.get(r.path) ?? { views: 0, visitors: new Set<string>() }
        entry.views += 1
        entry.visitors.add(r.visitor_hash)
        pathMap.set(r.path, entry)
      }
      const topPaths = [...pathMap.entries()]
        .map(([path, agg]) => ({ path, views: agg.views, uniqueVisitors: agg.visitors.size }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10)

      // --- top referrers ----------------------------------------------
      const refMap = new Map<string, number>()
      for (const r of humans) {
        const host = r.referrer_host || 'direct'
        refMap.set(host, (refMap.get(host) ?? 0) + 1)
      }
      const topReferrers = [...refMap.entries()]
        .map(([referrerHost, views]) => ({ referrerHost, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10)

      // --- timeline (back-filled). 24 hourly buckets for 24h, otherwise
      //     one bucket per day so the chart stays readable. ---
      const bucketMs = hours <= 24 ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000
      const bucketCount = hours <= 24 ? 24 : Math.ceil(hours / 24)
      const buckets: { bucketStart: number; views: number }[] = []
      const now = Date.now()
      const lastBucketStart = Math.floor(now / bucketMs) * bucketMs
      // First bucket starts (bucketCount - 1) intervals before "now".
      const firstBucketStart = lastBucketStart - (bucketCount - 1) * bucketMs
      for (let i = 0; i < bucketCount; i++) {
        buckets.push({ bucketStart: firstBucketStart + i * bucketMs, views: 0 })
      }
      for (const r of humans) {
        const ts = new Date(r.created_at).getTime()
        const idx = Math.floor(ts / bucketMs) - firstBucketStart / bucketMs
        if (idx >= 0 && idx < bucketCount) {
          buckets[idx]!.views += 1
        }
      }
      const timeline = buckets.map((b) => ({
        bucketIso: new Date(b.bucketStart).toISOString(),
        views: b.views,
      }))

      // --- recent activity --------------------------------------------
      const recent = humans.slice(0, 20).map((r) => ({
        path: r.path,
        referrerHost: r.referrer_host,
        createdAt: r.created_at,
        isBot: r.is_bot,
      }))

      return ok({
        range: { label: rangeKey, sinceIso },
        summary: {
          totalViews: humans.length,
          uniqueVisitors: uniqueVisitorSet.size,
          todayViews,
          botViews: all.length - humans.length,
        },
        topPaths,
        topReferrers,
        timeline,
        recent,
      })
    },
  )
}