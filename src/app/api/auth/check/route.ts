import { NextResponse } from 'next/server'
import { getServerClient } from '@/lib/admin'

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

  return NextResponse.json({
    isAdmin: user.app_metadata?.role === 'admin',
    user: { email: user.email ?? null },
  })
}
