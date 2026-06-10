import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import {
  badRequest,
  notFound,
  ok,
  parsePartial,
  newRequestId,
  logServerOp,
  withServerLog,
} from '@/lib/api'
import { getServiceRoleClient, getServerClient, requireAdminOrResponse } from '@/lib/admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Public-read whitelisted settings. Anything outside this list is read
// only by admins (the same /api/settings endpoint still works for them
// because the GET below uses the anon key and site_settings has a
// public-SELECT policy).
const PUBLIC_PATHS_TO_REVALIDATE = ['/', '/about', '/books', '/blog', '/contact', '/podcast', '/resources']

// Whitelist of writable site_setting keys. Anything else is rejected.
// Includes the public-facing settings (theme, hero, contact, etc.) and
// intentionally EXCLUDES server-only secrets (zapier_webhook_url,
// resend_api_key, etc.) — those are now env vars.
const WRITABLE_SETTING_KEYS = new Set<string>([
  'site_name', 'site_description', 'meta_description',
  'logo_url', 'hero_image_url', 'hero_title', 'hero_subtitle', 'hero_tagline',
  'contact_email', 'contact_phone',
  'social_facebook', 'social_instagram', 'social_linkedin', 'social_twitter',
  'social_youtube', 'social_tiktok',
  'podcast_url', 'join_modal_title', 'join_modal_message',
  'footer_mission', 'cta_button_text', 'cta_button_url',
  'blog_section_title',
  'show_books_section', 'show_community_ad', 'show_events_section', 'show_testimonials_section',
  'theme_primary_color', 'theme_secondary_color', 'theme_accent_color',
  'theme_header_bg', 'theme_footer_bg',
])

function isWritableKey(k: string): boolean {
  return WRITABLE_SETTING_KEYS.has(k)
}

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ data: {} })
  }
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(supabaseUrl, supabaseKey)
  const requestId = newRequestId()
  return withServerLog(
    { requestId, op: 'list_settings', table: 'site_settings' },
    async () => {
      const { data, error } = await supabase.from('site_settings').select('key, value')
      if (error) {
        logServerOp({ requestId, op: 'list_settings', table: 'site_settings', errorCode: error.code })
        return ok({})
      }
      const settings: Record<string, string> = {}
      data?.forEach((item: { key: string; value: string }) => {
        settings[item.key] = item.value
      })
      return ok(settings, undefined, {
        headers: { 'Cache-Control': 'no-store, max-age=0' },
      })
    },
  )
}

/**
 * POST = full upsert of a single key/value or array of {key,value}.
 * Backwards-compatible with the existing admin UI.
 */
export async function POST(request: Request) {
  const guard = await requireAdminOrResponse()
  if (!guard.ok) return guard.response
  const requestId = newRequestId()
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') return badRequest('Body must be a JSON object')

  const updates: Array<{ key: string; value: string }> = Array.isArray(body)
    ? body
    : body && typeof body === 'object'
      ? Object.entries(body).map(([key, value]) => ({ key, value: String(value) }))
      : []
  if (updates.length === 0) return badRequest('No settings provided')

  const rejected = updates.filter((u) => !isWritableKey(u.key))
  if (rejected.length > 0) {
    return badRequest('One or more keys are not writable', { rejected: rejected.map((r) => r.key) })
  }

  return withServerLog(
    { requestId, op: 'upsert_settings', table: 'site_settings', userId: guard.user.id, meta: { count: updates.length } },
    async () => {
      const writeClient = getServiceRoleClient() ?? guard.supabase
      const { error } = await writeClient
        .from('site_settings')
        .upsert(updates, { onConflict: 'key' })
      if (error) {
        logServerOp({ requestId, op: 'upsert_settings', table: 'site_settings', userId: guard.user.id, errorCode: error.code })
        return badRequest(error.message)
      }
      for (const path of PUBLIC_PATHS_TO_REVALIDATE) revalidatePath(path)
      return ok({ count: updates.length }, 'Settings updated')
    },
  )
}

/**
 * PATCH = partial update of a single key. Body: { key, value }.
 * Use this for one-off updates that need not send the full record.
 */
export async function PATCH(request: Request) {
  const guard = await requireAdminOrResponse()
  if (!guard.ok) return guard.response
  const requestId = newRequestId()
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') return badRequest('Body must be a JSON object')
  const { key, value } = body as { key?: string; value?: unknown }
  if (!key) return badRequest('key required')
  if (!isWritableKey(key)) return badRequest(`Key "${key}" is not writable`)

  return withServerLog(
    { requestId, op: 'patch_setting', table: 'site_settings', recordId: key, userId: guard.user.id },
    async () => {
      const writeClient = getServiceRoleClient() ?? guard.supabase
      const { data, error } = await writeClient
        .from('site_settings')
        .upsert({ key, value: String(value) }, { onConflict: 'key' })
        .select()
        .single()
      if (error || !data) {
        logServerOp({ requestId, op: 'patch_setting', table: 'site_settings', recordId: key, userId: guard.user.id, errorCode: error?.code })
        return error ? badRequest(error.message) : notFound('Setting')
      }
      for (const path of PUBLIC_PATHS_TO_REVALIDATE) revalidatePath(path)
      return ok(data, 'Setting updated')
    },
  )
}

/**
 * DELETE = remove a single key. Use sparingly; most settings should
 * be kept (theme colors etc. are read with default fallbacks).
 */
export async function DELETE(request: Request) {
  const guard = await requireAdminOrResponse()
  if (!guard.ok) return guard.response
  const requestId = newRequestId()
  const body = (await request.json().catch(() => null)) as { key?: string } | null
  if (!body?.key) return badRequest('key required')
  if (!isWritableKey(body.key)) return badRequest(`Key "${body.key}" is not writable`)

  return withServerLog(
    { requestId, op: 'delete_setting', table: 'site_settings', recordId: body.key, userId: guard.user.id },
    async () => {
      const writeClient = getServiceRoleClient() ?? guard.supabase
      const { error } = await writeClient.from('site_settings').delete().eq('key', body.key)
      if (error) {
        logServerOp({ requestId, op: 'delete_setting', table: 'site_settings', recordId: body.key, userId: guard.user.id, errorCode: error.code })
        return badRequest(error.message)
      }
      for (const path of PUBLIC_PATHS_TO_REVALIDATE) revalidatePath(path)
      return ok({ key: body.key }, 'Setting deleted')
    },
  )
}

// Re-export parsePartial so other files in this folder can share the
// exact same logic if needed. (Prevents drift between the import
// site and the implementation.)
export { parsePartial }
