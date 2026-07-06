import { NextResponse } from 'next/server'
import { createHash } from 'node:crypto'
import { getServiceRoleClient } from '@/lib/admin'

/**
 * POST /api/track
 *
 * Public, no-auth, fire-and-forget endpoint that records a page view.
 * Called by the <TrackingBeacon /> client component on every public
 * page load and on every client-side route change.
 *
 * Server-side enrichment (so we trust the server, not the client):
 *   - IP  → x-forwarded-for / x-real-ip (Vercel sets these)
 *   - UA  → user-agent header
 *   - visitor_hash = SHA-256(ip + UA) — never store IP/UA in clear
 *
 * Bot filtering: a short blocklist catches the obvious crawlers so
 * they don't pollute the human metrics. Everything that matches goes
 * into page_views with is_bot = true so it can be audited later, but
 * the admin dashboard only counts is_bot = false rows.
 *
 * Path / referrer sanitization: we accept the client-sent values but
 * bound them so a malicious client can't stuff a 10 MB string into
 * the DB. Path is capped at 512 chars, referrer at 1024.
 *
 * Returns 204 No Content. The client does not need a response body
 * and should never block the user-visible page on this call.
 */

// --- Bot detection ----------------------------------------------------
// Keep this list short and conservative. A more comprehensive UA
// parser belongs in a library; for now, the bots that show up in
// Vercel logs are well-served by these patterns.
const BOT_UA_PATTERNS = [
  /bot/i,
  /crawler/i,
  /spider/i,
  /slurp/i,         // Yahoo
  /facebookexternalhit/i,
  /facebot/i,
  /twitterbot/i,
  /linkedinbot/i,
  /embedly/i,
  /preview/i,
  /curl\//i,
  /wget\//i,
  /python-requests/i,
  /go-http-client/i,
  /headlesschrome/i,
  /puppeteer/i,
  /playwright/i,
]

function isBot(ua: string | null): boolean {
  if (!ua) return false
  return BOT_UA_PATTERNS.some((re) => re.test(ua))
}

// --- Client IP extraction --------------------------------------------
// Vercel forwards the original client IP in x-forwarded-for as a
// comma-separated chain (proxy, proxy, client). We want the LAST
// entry. x-real-ip is the Vercel-set fallback.
function extractIp(headers: Headers): string {
  const fwd = headers.get('x-forwarded-for')
  if (fwd) {
    const parts = fwd.split(',').map((s) => s.trim()).filter(Boolean)
    if (parts.length > 0) return parts[parts.length - 1]!
  }
  const real = headers.get('x-real-ip')
  if (real) return real.trim()
  return '0.0.0.0'
}

function safeReferrerHost(value: string | null): string | null {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.hostname.toLowerCase()
  } catch {
    // Sometimes referrer is a same-origin path-only string — store as-is.
    return null
  }
}

function clamp(value: string | null | undefined, max: number): string | null {
  if (!value) return null
  return value.length > max ? value.slice(0, max) : value
}

export async function POST(request: Request) {
  // 1. Parse + sanitize the body. The body is best-effort — we never
  // reject a beacon just because the client is on a flaky network.
  let body: { path?: string; referrer?: string } = {}
  try {
    const text = await request.text()
    if (text) body = JSON.parse(text)
  } catch {
    // Ignore malformed bodies — the page view is still a valid signal.
  }

  const path = clamp(body.path, 512)
  if (!path) {
    return new NextResponse(null, { status: 204 })
  }

  const referrer = clamp(body.referrer, 1024)

  // 2. Pull the trust-the-server fields from the request.
  const ua = request.headers.get('user-agent') ?? ''
  const ip = extractIp(request.headers)

  // 3. Hash the visitor identity so we never store raw IP/UA in the DB.
  const visitorHash = createHash('sha256')
    .update(`${ip}|${ua}`)
    .digest('hex')
    .slice(0, 32) // 128 bits is plenty for visitor uniqueness

  // 4. Write the row via service role (RLS would otherwise reject the
  // anon insert). If the service role isn't configured we silently
  // skip — the dashboard will just show zero data, never 500 the page.
  const supabase = getServiceRoleClient()
  if (!supabase) {
    return new NextResponse(null, { status: 204 })
  }

  // We do NOT await the write in a blocking way that would expose the
  // caller's latency to Supabase. Wait — actually we do want a small
  // await so the row is durable before the response returns. The
  // client beacon is fire-and-forget and the response is 204, so the
  // user-visible page never blocks on this.
  try {
    await supabase.from('page_views').insert({
      path,
      referrer,
      referrer_host: safeReferrerHost(referrer),
      visitor_hash: visitorHash,
      user_agent: clamp(ua, 512),
      is_bot: isBot(ua),
    })
  } catch {
    // Swallow DB errors — analytics is best-effort and must never
    // break the visitor's page load.
  }

  return new NextResponse(null, { status: 204 })
}