import { NextResponse } from 'next/server'
import { getServerClient, getServiceRoleClient } from '@/lib/admin'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  // Public read. The keys stored in site_settings (theme_*, social URLs,
  // hero text, footer copy, SEO meta, section visibility) are all values
  // that need to render on the public-facing site (Navigation, Footer,
  // EventsPreview fetch this on every public page load). Gating GET behind
  // admin auth caused 401s on every anonymous visit and broke the theme
  // picker on the public site. The anon-key Supabase client has SELECT on
  // site_settings via RLS (server-side getSettings() in src/lib/settings.ts
  // has been doing the same read for months), so we use the same approach
  // here. Writes remain admin-gated below.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({})
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

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
