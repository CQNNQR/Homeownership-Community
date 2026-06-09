import { NextResponse } from 'next/server'
import { getServerClient, isAllowlistedAdminEmail, ensureAdminRole } from '@/lib/admin'

/**
 * POST /api/auth/refresh
 *
 * Self-heal endpoint. The caller passes the email + password they
 * just successfully used to log in. We:
 *   1. Validate the credentials with the anon client (re-asserts
 *      the user knows the password, so this endpoint can't be
 *      abused to elevate a session for someone else).
 *   2. If the email is on the allowlist and the JWT lacks the
 *      admin role, write app_metadata.role = 'admin' via the
 *      service-role client.
 *   3. Mint a fresh session via the service-role client (which
 *      will now include the new claim) and set the resulting
 *      access/refresh cookies on the response.
 *
 * The login page calls this automatically when /api/auth/check
 * returns `{ healed: true }`. On success the user is already
 * signed in with admin privileges.
 */
export async function POST(request: Request) {
  let body: { email?: string; password?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const email = body.email?.trim().toLowerCase()
  const password = body.password

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
  }

  if (!isAllowlistedAdminEmail(email)) {
    return NextResponse.json({ error: 'Not an admin email' }, { status: 403 })
  }

  // Step 1: re-verify password with the anon client. This both
  // proves the caller knows the password and refreshes any session
  // cookies the SSR client can write to.
  const authClient = await getServerClient()
  const { data: signInData, error: signInError } = await authClient.auth.signInWithPassword({
    email,
    password,
  })

  if (signInError || !signInData?.user) {
    return NextResponse.json(
      { error: signInError?.message || 'Invalid credentials' },
      { status: 401 }
    )
  }

  // Step 2: self-heal the role if needed.
  const healResult = await ensureAdminRole({
    id: signInData.user.id,
    email: signInData.user.email,
    app_metadata: signInData.user.app_metadata as Record<string, unknown> | null,
  })

  if (!healResult.healed && healResult.reason && healResult.reason !== 'already-admin') {
    return NextResponse.json(
      { error: `Could not grant admin role: ${healResult.reason}` },
      { status: 500 }
    )
  }

  // Step 3: mint a fresh session that carries the new claim.
  // The signInWithPassword above already wrote cookies, but those
  // cookies were issued BEFORE the role was patched, so the JWT
  // inside them still lacks the new app_metadata claim. We sign
  // in once more so the new JWT (with the patched claim) lands
  // in the cookies. The SSR cookie adapter overwrites the prior
  // set; the final cookie carries the new claim.
  const { error: reSignInError } = await authClient.auth.signInWithPassword({ email, password })
  if (reSignInError) {
    return NextResponse.json(
      { error: `Failed to refresh session: ${reSignInError.message}` },
      { status: 500 }
    )
  }

  // Verify the final cookie state actually has admin role.
  const { data: { user: verifiedUser } } = await authClient.auth.getUser()

  if (verifiedUser?.app_metadata?.role !== 'admin') {
    return NextResponse.json(
      {
        error:
          'Role was granted but the session cookie still lacks the admin claim. ' +
          'Sign out and sign in again from the login page.',
        healed: healResult.healed,
      },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    isAdmin: true,
    healed: healResult.healed,
    user: { email: verifiedUser.email ?? null },
  })
}
