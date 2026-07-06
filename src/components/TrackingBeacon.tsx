'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

/**
 * <TrackingBeacon /> — cookie-less, self-hosted page-view tracker.
 *
 * Mount once in the root layout. On every public page load AND on every
 * client-side route change it sends a tiny beacon to /api/track with
 * the current path + referrer. The server enriches with IP + UA and
 * writes the row. The component itself renders nothing.
 *
 * What it deliberately does NOT do:
 *   - Track /admin/** (admins editing their own site would inflate
 *     the metrics; also the admin layout is noindex anyway).
 *   - Track /api/** (would loop on itself and skew the chart).
 *   - Block the page render. The beacon uses sendBeacon (or fetch with
 *     keepalive) so the call survives page transitions.
 *   - Set any cookies. Privacy-friendly out of the box.
 */
export function TrackingBeacon() {
  const pathname = usePathname()
  const lastPathRef = useRef<string | null>(null)

  useEffect(() => {
    // Skip admin + api routes. Mirrors the same logic as /api/track
    // so the filter happens both client and server.
    if (!pathname) return
    if (pathname.startsWith('/admin') || pathname.startsWith('/api')) return

    // Avoid double-firing: this effect runs twice in dev (StrictMode).
    if (lastPathRef.current === pathname) return
    lastPathRef.current = pathname

    const payload = JSON.stringify({
      path: pathname,
      referrer: document.referrer || null,
    })

    // Prefer navigator.sendBeacon when available — it's designed
    // exactly for this use case and survives page unloads.
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      try {
        const blob = new Blob([payload], { type: 'application/json' })
        navigator.sendBeacon('/api/track', blob)
        return
      } catch {
        // fall through to fetch
      }
    }

    // Fallback: fetch with keepalive so the request outlives the page.
    void fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch(() => {
      // Best-effort — analytics never blocks the user.
    })
  }, [pathname])

  return null
}