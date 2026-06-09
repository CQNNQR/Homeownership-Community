import { NextResponse } from 'next/server'
import { getServerClient, ensureAdminRole, isAllowlistedAdminEmail } from '@/lib/admin'

export async function GET() {
  // Read the session via the SSR cookie-aware client and verify the JWT
  // belongs to an admin (app_metadata.role === 'admin'). Always returns
  // 200 — the client decides what to do when isAdmin is false. This
  // prevents the editor's checkAuth useEffect from blowing up on
  // missing auth (e.g. during cold start or a logged-out visit).
  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ isAdmin: false, user: null })
  }

  // Fast path: role is already on the JWT.
  if (user.app_metadata?.role === 'admin') {
    return NextResponse.json({
      isAdmin: true,
      user: { email: user.email ?? null },
    })
  }

  // Slow path: the user is authenticated but the JWT lacks the admin
  // role. If their email is on the allowlist, self-heal by writing
  // app_metadata.role via the service-role key. The user must then
  // refresh their session (the caller handles this by signing them
  // out and back in) to pick up the new claim.
  if (isAllowlistedAdminEmail(user.email)) {
    const result = await ensureAdminRole({
      id: user.id,
      email: user.email,
      app_metadata: user.app_metadata as Record<string, unknown> | null,
    })

    if (result.healed) {
      // Force a session refresh by re-signing the user in via the
      // service-role client. We can't do that for the request's
      // cookies directly, so the best signal to the client is to
      // return isAdmin=false and let the login page re-run
      // signInWithPassword (which will issue a fresh JWT carrying
      // the new app_metadata claim). Returning a `healed` flag lets
      // the login UI say something better than "not an admin".
      return NextResponse.json({
        isAdmin: false,
        user: { email: user.email ?? null },
        healed: true,
        reason: 'role-granted-please-relogin',
      })
    }

    return NextResponse.json({
      isAdmin: false,
      user: { email: user.email ?? null },
      healed: false,
      reason: result.reason,
    })
  }

  return NextResponse.json({
    isAdmin: false,
    user: { email: user.email ?? null },
  })
}
