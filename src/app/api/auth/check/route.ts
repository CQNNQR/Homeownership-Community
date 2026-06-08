import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/admin'

export async function GET() {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ isAdmin: false, user: null })
  }

  return NextResponse.json({
    isAdmin: user.app_metadata?.role === 'admin',
    user: { email: user.email ?? null },
  })
}
