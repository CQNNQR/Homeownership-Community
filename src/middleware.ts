import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// TEMPORARILY DISABLED - Auth is handled client-side in page components
// Re-enable after fixing Supabase cookie sync with middleware

export async function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
