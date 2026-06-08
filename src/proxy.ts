import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Next 16 proxy (replaces middleware.ts).
 *
 * Runs for /admin/* only (see `config.matcher` below).
 * - /admin/login: pass through so the login page can render.
 * - Other /admin/* paths: require a Supabase session with
 *   app_metadata.role === 'admin'. Non-admins go to '/', signed-out
 *   users go to '/admin/login'.
 */
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Always allow the login page itself to render.
  if (pathname === '/admin/login') {
    return NextResponse.next()
  }

  // Build a mutable response we can attach refreshed cookies to.
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Mirror refreshed cookies onto both the incoming request
          // (so downstream reads see the latest values) and the
          // outgoing response (so the browser stores them).
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value)
          }
          response = NextResponse.next({ request })
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options)
          }
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/admin/login'
    return NextResponse.redirect(loginUrl)
  }

  if (user.app_metadata?.role !== 'admin') {
    const homeUrl = request.nextUrl.clone()
    homeUrl.pathname = '/'
    return NextResponse.redirect(homeUrl)
  }

  return response
}

export const config = {
  // Restrict the proxy to /admin/* so we don't pay the auth cost on
  // every public route.
  matcher: ['/admin/:path*'],
}
