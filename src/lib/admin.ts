import { createServerClient } from '@supabase/ssr'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

/**
 * Comma-separated list of emails that are always granted admin on login.
 * Used to self-heal `app_metadata.role = 'admin'` when an admin's JWT
 * somehow lacks the claim (e.g. legacy user, role wiped by mistake).
 * The /api/auth/check handler will set the role using the service-role
 * client for any email on this list, then require the user to re-login
 * (or refresh the JWT via signInWithPassword) for the new claim to
 * take effect on subsequent requests.
 *
 * Brandon's admin email MUST be on this list. Multiple emails can be
 * separated by commas, e.g. "admin@hoc.com,owner@example.com".
 */
const ADMIN_EMAIL_ALLOWLIST = (process.env.ADMIN_EMAILS || 'admin@hoc.com')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)

export function isAllowlistedAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return ADMIN_EMAIL_ALLOWLIST.includes(email.trim().toLowerCase())
}

export async function getServerClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}

export function getServiceRoleClient(): SupabaseClient | null {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) return null

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}

export async function getCurrentUser() {
  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.app_metadata?.role === 'admin'
}

/**
 * Shared admin guard. Returns the authenticated user + a write-capable
 * Supabase client, or a 401/403 NextResponse. Use this from every admin
 * route handler so the failure mode is consistent.
 */
export interface AdminContext {
  user: { id: string; email: string | null; role: string }
  supabase: NonNullable<ReturnType<typeof getServiceRoleClient>> | Awaited<ReturnType<typeof getServerClient>>
}

export async function requireAdminOrResponse(): Promise<
  | { ok: true; user: AdminContext['user']; supabase: AdminContext['supabase'] }
  | { ok: false; response: import('next/server').NextResponse }
> {
  const authClient = await getServerClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) {
    const { unauthorized } = await import('./api')
    return { ok: false, response: unauthorized() }
  }
  if (user.app_metadata?.role !== 'admin') {
    const { forbidden } = await import('./api')
    return { ok: false, response: forbidden() }
  }
  const writeClient = getServiceRoleClient() ?? authClient
  return {
    ok: true,
    user: { id: user.id, email: user.email ?? null, role: 'admin' },
    supabase: writeClient as AdminContext['supabase'],
  }
}

/**
 * Self-heal: if the authenticated user's email is on the allowlist but
 * their JWT doesn't carry app_metadata.role === 'admin', patch the
 * user's app_metadata using the service-role client. The user will
 * need to refresh their session (next signInWithPassword) for the
 * updated JWT to be issued; the caller should sign them out and back
 * in (or trigger a `supabase.auth.refreshSession()` client-side) to
 * pick up the new claim.
 *
 * Returns true if a role was actually written, false otherwise.
 */
export async function ensureAdminRole(user: {
  id: string
  email?: string | null
  app_metadata?: Record<string, unknown> | null
}): Promise<{ healed: boolean; reason?: string }> {
  if (!isAllowlistedAdminEmail(user.email)) {
    return { healed: false, reason: 'email-not-allowlisted' }
  }
  if (user.app_metadata?.role === 'admin') {
    return { healed: false, reason: 'already-admin' }
  }

  const admin = getServiceRoleClient()
  if (!admin) {
    return { healed: false, reason: 'no-service-role-key' }
  }

  const { error } = await admin.auth.admin.updateUserById(user.id, {
    app_metadata: { ...(user.app_metadata || {}), role: 'admin' },
  })

  if (error) {
    return { healed: false, reason: `update-failed: ${error.message}` }
  }

  return { healed: true }
}
