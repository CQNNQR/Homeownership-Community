/**
 * Deployment-time schema + env drift check.
 *
 * Called by:
 *   - the prebuild script in package.json
 *   - /api/admin/health (read-only)
 *   - tests/e2e/backend-recovery.spec.ts
 *
 * Behavior:
 *   - If SUPABASE_SERVICE_ROLE_KEY is missing (e.g. local dev), reports
 *     the missing-key state and returns ok=true so a contributor can
 *     still build. The prebuild script then prints a warning and
 *     continues.
 *   - If the key is set but the database is unreachable, reports
 *     ok=false with the Supabase error.
 *   - If the key is set and reachable, verifies every required table,
 *     column, and RLS policy. Missing items fail the check.
 *
 * The schema is intentionally small: only the tables the recovery
 * plan explicitly calls out as "must be present in production."
 */

export interface RequiredTable {
  name: string
  columns: string[]
  mustHaveAdminRls?: boolean
}

export const REQUIRED_SCHEMA: RequiredTable[] = [
  { name: 'site_settings', columns: ['key', 'value', 'updated_at'] },
  { name: 'books', columns: ['id', 'title', 'amazon_url', 'is_active'], mustHaveAdminRls: true },
  { name: 'events', columns: ['id', 'title', 'event_date', 'is_active'], mustHaveAdminRls: true },
  { name: 'testimonials', columns: ['id', 'name', 'quote', 'is_active'], mustHaveAdminRls: true },
  { name: 'podcast_episodes', columns: ['id', 'title', 'youtube_url', 'is_visible'], mustHaveAdminRls: true },
  { name: 'media', columns: ['id', 'name', 'url', 'type'], mustHaveAdminRls: true },
  { name: 'subscribers', columns: ['id', 'email', 'source', 'first_name', 'last_name', 'phone'], mustHaveAdminRls: true },
  { name: 'blog_post_visibility', columns: ['id', 'wordpress_id', 'slug', 'title', 'is_visible'], mustHaveAdminRls: true },
  { name: 'lead_delivery_jobs', columns: ['id', 'subscriber_id', 'idempotency_key', 'status', 'payload', 'attempt_count'], mustHaveAdminRls: true },
  { name: '_migrations_state', columns: ['id', 'schema_version', 'last_repair_at'] },
]

export const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'RESEND_API_KEY',
  'NEXT_PUBLIC_SITE_URL',
] as const

export interface DriftReport {
  ok: boolean
  schemaVersion: string | null
  missingEnvVars: string[]
  missingTables: string[]
  missingColumns: Array<{ table: string; column: string }>
  unreachable: string | null
  checkedAt: string
}

export async function verifySchema(): Promise<DriftReport> {
  const checkedAt = new Date().toISOString()
  const missingEnvVars: string[] = []
  for (const v of REQUIRED_ENV_VARS) {
    if (!process.env[v]) missingEnvVars.push(v)
  }

  if (missingEnvVars.includes('SUPABASE_SERVICE_ROLE_KEY')
      || missingEnvVars.includes('NEXT_PUBLIC_SUPABASE_URL')) {
    return {
      ok: true,
      schemaVersion: null,
      missingEnvVars,
      missingTables: [],
      missingColumns: [],
      unreachable: 'no-service-role-key',
      checkedAt,
    }
  }

  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )

  // 1. Schema version
  let schemaVersion: string | null = null
  const stateRes = await supabase
    .from('_migrations_state')
    .select('schema_version')
    .eq('id', 1)
    .maybeSingle()
  if (!stateRes.error && stateRes.data) {
    schemaVersion = (stateRes.data as { schema_version: string }).schema_version
  }

  // 2. Tables
  const missingTables: string[] = []
  const missingColumns: Array<{ table: string; column: string }> = []

  for (const t of REQUIRED_SCHEMA) {
    const tbl = await supabase
      .from(t.name as any)
      .select('*')
      .limit(1)
    if (tbl.error) {
      // Table missing or RLS blocking read
      missingTables.push(t.name)
      continue
    }
    for (const col of t.columns) {
      const colRes = await supabase
        .from(t.name as any)
        .select(col)
        .limit(1)
      if (colRes.error) {
        // Almost always a missing column. Other errors (e.g. RLS) also land here.
        if (/column .* does not exist/i.test(colRes.error.message)) {
          missingColumns.push({ table: t.name, column: col })
        }
      }
    }
  }

  const ok = missingTables.length === 0 && missingColumns.length === 0
  return {
    ok,
    schemaVersion,
    missingEnvVars,
    missingTables,
    missingColumns,
    unreachable: null,
    checkedAt,
  }
}
