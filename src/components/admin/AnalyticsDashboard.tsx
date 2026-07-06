'use client'

import { useEffect, useState } from 'react'

/**
 * Admin "Analytics" tab content.
 *
 * Fetches /api/admin/analytics and renders four KPI cards, two top-N
 * tables, a bar chart of the timeline, and a recent-activity feed.
 *
 * The chart is a hand-rolled SVG so we don't pull in a charting
 * dependency for what is, deliberately, a small admin-only widget.
 */

type Range = '24h' | '7d' | '30d'

interface AnalyticsResponse {
  range: { label: string; sinceIso: string }
  summary: {
    totalViews: number
    uniqueVisitors: number
    todayViews: number
    botViews: number
  }
  topPaths: { path: string; views: number; uniqueVisitors: number }[]
  topReferrers: { referrerHost: string; views: number }[]
  timeline: { bucketIso: string; views: number }[]
  recent: { path: string; referrerHost: string | null; createdAt: string; isBot: boolean }[]
}

const RANGES: { key: Range; label: string }[] = [
  { key: '24h', label: 'Last 24 hours' },
  { key: '7d', label: 'Last 7 days' },
  { key: '30d', label: 'Last 30 days' },
]

function formatRelative(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime()
  const sec = Math.floor(ms / 1000)
  if (sec < 60) return `${sec}s ago`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.floor(hr / 24)
  return `${day}d ago`
}

function formatBucketLabel(iso: string, range: Range): string {
  const d = new Date(iso)
  if (range === '24h') {
    return d.toLocaleTimeString(undefined, { hour: 'numeric', hour12: true })
  }
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function AnalyticsDashboard() {
  const [range, setRange] = useState<Range>('24h')
  const [data, setData] = useState<AnalyticsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetch(`/api/admin/analytics?range=${range}`, { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) {
          const payload = await res.json().catch(() => ({}))
          throw new Error(payload?.error?.message || `HTTP ${res.status}`)
        }
        const payload = await res.json()
        return payload.data as AnalyticsResponse
      })
      .then((d) => {
        if (!cancelled) setData(d)
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [range])

  return (
    <div className="space-y-6">
      {/* Header + range toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-black">Site Analytics</h2>
          <p className="text-sm text-gray-500">
            Self-hosted page-view tracking. No cookies, no third-party scripts.
          </p>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {RANGES.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => setRange(r.key)}
              data-testid={`analytics-range-${r.key}`}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                range === r.key
                  ? 'bg-white text-red-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div
          role="alert"
          data-testid="analytics-error"
          className="bg-red-50 border border-red-300 text-red-800 rounded-lg px-4 py-3 text-sm"
        >
          Failed to load analytics: {error}
        </div>
      )}

      {loading && !data && (
        <div className="text-center py-12 text-gray-500">Loading analytics…</div>
      )}

      {data && (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Kpi label="Page views" value={data.summary.totalViews} sub={`in ${data.range.label}`} />
            <Kpi label="Unique visitors" value={data.summary.uniqueVisitors} sub="hashed IP + UA" />
            <Kpi label="Views today" value={data.summary.todayViews} sub="since 00:00 UTC" />
            <Kpi label="Bot traffic" value={data.summary.botViews} sub="excluded from totals" muted />
          </div>

          {/* Timeline chart */}
          <div className="bg-white rounded-xl shadow p-4 sm:p-6">
            <h3 className="text-base font-bold text-black mb-4">Page views over time</h3>
            <TimelineChart buckets={data.timeline} range={range} />
          </div>

          {/* Top tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TopPathsTable rows={data.topPaths} />
            <TopReferrersTable rows={data.topReferrers} />
          </div>

          {/* Recent activity */}
          <div className="bg-white rounded-xl shadow p-4 sm:p-6">
            <h3 className="text-base font-bold text-black mb-4">Recent activity</h3>
            {data.recent.length === 0 ? (
              <p className="text-sm text-gray-500">No page views in this window yet.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {data.recent.map((r, i) => (
                  <li key={`${r.createdAt}-${i}`} className="py-2 flex items-center justify-between gap-3 text-sm">
                    <div className="min-w-0 flex-1">
                      <span className="font-mono text-gray-800 truncate inline-block max-w-full">
                        {r.path}
                      </span>
                      {r.referrerHost && (
                        <span className="ml-2 text-xs text-gray-500">← {r.referrerHost}</span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {formatRelative(r.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function Kpi({ label, value, sub, muted }: { label: string; value: number; sub: string; muted?: boolean }) {
  return (
    <div className={`rounded-xl shadow p-4 sm:p-5 ${muted ? 'bg-gray-50' : 'bg-white'}`}>
      <div className="text-xs uppercase tracking-wide text-gray-500 font-medium">{label}</div>
      <div className="mt-1 text-3xl font-bold text-black tabular-nums">{value.toLocaleString()}</div>
      <div className="text-xs text-gray-500 mt-1">{sub}</div>
    </div>
  )
}

function TimelineChart({ buckets, range }: { buckets: { bucketIso: string; views: number }[]; range: Range }) {
  const max = Math.max(1, ...buckets.map((b) => b.views))
  const width = 800
  const height = 180
  const padX = 8
  const padTop = 12
  const padBottom = 28
  const innerW = width - padX * 2
  const innerH = height - padTop - padBottom
  const barW = buckets.length > 0 ? innerW / buckets.length : innerW

  // Show ~6 evenly-spaced labels along the x-axis so it stays legible.
  const labelStride = Math.max(1, Math.ceil(buckets.length / 6))

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="w-full h-44"
        role="img"
        aria-label="Page views over time"
      >
        {/* baseline */}
        <line
          x1={padX}
          y1={padTop + innerH}
          x2={width - padX}
          y2={padTop + innerH}
          stroke="#e5e7eb"
          strokeWidth={1}
        />
        {buckets.map((b, i) => {
          const h = max > 0 ? (b.views / max) * innerH : 0
          const x = padX + i * barW
          const y = padTop + innerH - h
          return (
            <g key={b.bucketIso}>
              <rect
                x={x + 1}
                y={y}
                width={Math.max(0, barW - 2)}
                height={h}
                fill="#b91c1c"
                opacity={b.views === 0 ? 0.15 : 0.9}
                rx={2}
              >
                <title>{`${formatBucketLabel(b.bucketIso, range)} — ${b.views} views`}</title>
              </rect>
              {i % labelStride === 0 && (
                <text
                  x={x + barW / 2}
                  y={height - 8}
                  textAnchor="middle"
                  fontSize={10}
                  fill="#6b7280"
                >
                  {formatBucketLabel(b.bucketIso, range)}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

function TopPathsTable({ rows }: { rows: AnalyticsResponse['topPaths'] }) {
  return (
    <div className="bg-white rounded-xl shadow p-4 sm:p-6">
      <h3 className="text-base font-bold text-black mb-3">Top pages</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-gray-500">No data yet.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
              <th className="pb-2 font-medium">Path</th>
              <th className="pb-2 font-medium text-right">Views</th>
              <th className="pb-2 font-medium text-right">Unique</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((r) => (
              <tr key={r.path}>
                <td className="py-2 font-mono text-gray-800 truncate max-w-xs">{r.path}</td>
                <td className="py-2 text-right tabular-nums">{r.views.toLocaleString()}</td>
                <td className="py-2 text-right tabular-nums">{r.uniqueVisitors.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

function TopReferrersTable({ rows }: { rows: AnalyticsResponse['topReferrers'] }) {
  return (
    <div className="bg-white rounded-xl shadow p-4 sm:p-6">
      <h3 className="text-base font-bold text-black mb-3">Top referrers</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-gray-500">No data yet.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
              <th className="pb-2 font-medium">Source</th>
              <th className="pb-2 font-medium text-right">Views</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((r) => (
              <tr key={r.referrerHost}>
                <td className="py-2 text-gray-800 truncate max-w-xs">{r.referrerHost}</td>
                <td className="py-2 text-right tabular-nums">{r.views.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}