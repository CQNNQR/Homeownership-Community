#!/usr/bin/env node
/**
 * Prebuild schema check.
 *
 * Runs a smoke test against the production Supabase project. If
 * SUPABASE_SERVICE_ROLE_KEY is missing (e.g. a contributor build),
 * prints a warning and exits 0 so the build can continue. If the key
 * is set and the schema is drifted, prints the report and exits 1 so
 * the build fails.
 *
 * Invoked from package.json's "prebuild" script. Loads .env.local
 * automatically when present (Node 20+).
 */
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

function loadDotenvLocal() {
  const file = join(process.cwd(), '.env.local')
  if (!existsSync(file)) return
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i)
    if (!m) continue
    if (m[1].startsWith('#')) continue
    if (process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '')
    }
  }
}
loadDotenvLocal()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (process.env.NEXT_SKIP_PREBUILD === '1') {
  console.warn('[prebuild] NEXT_SKIP_PREBUILD=1 set; skipping schema check.')
  process.exit(0)
}

if (!supabaseUrl || !serviceKey) {
  console.warn('[prebuild] SUPABASE_SERVICE_ROLE_KEY not set; skipping schema check. Set it in .env.local to enforce.')
  process.exit(0)
}

const { createClient } = await import('@supabase/supabase-js')
const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const REQUIRED_TABLES = [
  'site_settings', 'books', 'events', 'testimonials', 'podcast_episodes',
  'media', 'subscribers', 'blog_post_visibility', 'lead_delivery_jobs',
  '_migrations_state',
]
const REQUIRED_COLUMNS = {
  subscribers: ['email', 'source', 'first_name', 'last_name', 'phone'],
  blog_post_visibility: ['wordpress_id', 'slug', 'title', 'is_visible'],
  lead_delivery_jobs: ['subscriber_id', 'idempotency_key', 'status', 'payload', 'attempt_count'],
}

const missingTables = []
const missingColumns = []
for (const t of REQUIRED_TABLES) {
  const r = await supabase.from(t).select('*').limit(1)
  if (r.error) { missingTables.push(t); continue }
  for (const c of REQUIRED_COLUMNS[t] || []) {
    const cr = await supabase.from(t).select(c).limit(1)
    if (cr.error && /column .* does not exist/i.test(cr.error.message)) {
      missingColumns.push(`${t}.${c}`)
    }
  }
}

if (missingTables.length || missingColumns.length) {
  // The recovery plan wants this to fail the build when a Supabase
  // connection is available, so a missed migration cannot deploy. We
  // do not gate on a CI flag explicitly; the only "soft" case is when
  // SUPABASE_SERVICE_ROLE_KEY is not set (we exit 0 above). In every
  // other case (CI, contributor with a service key, prod build) we
  // hard-fail and tell the operator which migration to apply.
  console.error('[prebuild] Schema drift detected:')
  if (missingTables.length) console.error('  Missing tables:', missingTables.join(', '))
  if (missingColumns.length) console.error('  Missing columns:', missingColumns.join(', '))
  console.error('Run supabase/migrations/20260610000000_repair_schema_and_rls.sql on the project.')
  process.exit(1)
}

console.log('[prebuild] Schema check passed.')
