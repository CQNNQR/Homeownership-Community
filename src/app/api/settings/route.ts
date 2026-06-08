import { NextResponse } from 'next/server'
import { getServerClient, getServiceRoleClient } from '@/lib/admin'

export async function GET() {
  const supabase = getServiceRoleClient() ?? (await getServerClient())

  const { data, error } = await supabase
    .from('site_settings')
    .select('key, value')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Convert array to key-value object
  const settings: Record<string, string> = {}
  data?.forEach((item: { key: string; value: string }) => {
    settings[item.key] = item.value
  })

  return NextResponse.json(settings)
}

export async function POST(request: Request) {
  const authSupabase = await getServerClient()
  const { data: { user } } = await authSupabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (user.app_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const supabase = getServiceRoleClient() ?? authSupabase

  const body = await request.json()
  const updates: Array<{ key: string; value: string }> = Array.isArray(body)
    ? body
    : body && typeof body === 'object'
      ? Object.entries(body).map(([key, value]) => ({ key, value: String(value) }))
      : []

  if (updates.length === 0) {
    return NextResponse.json({ error: 'No settings provided' }, { status: 400 })
  }

  const { error } = await supabase
    .from('site_settings')
    .upsert(updates, { onConflict: 'key' })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, count: updates.length })
}
