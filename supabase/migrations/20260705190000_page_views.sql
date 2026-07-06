-- =====================================================================
-- Page-view analytics for the admin dashboard.
--
-- Self-hosted, cookie-less analytics. Every public page load fires a
-- client beacon that hits /api/track; the route handler enriches the
-- payload with the request IP + UA, hashes the visitor identity, and
-- inserts one row here via the service-role key.
--
-- Design choices:
--   - No PII is stored. visitor_hash is SHA-256(ip + user_agent) so we
--     can count unique visitors without keeping identifiable data.
--   - RLS: only admins (app_metadata.role = 'admin') can SELECT.
--     Anon has no INSERT policy; writes go through the service-role
--     client from /api/track so we can validate + bot-filter on the
--     server before persisting.
--   - The migration is idempotent so it is safe to re-run on a DB
--     that already has the table.
--
-- Aggregations the admin dashboard needs:
--   - Top paths in a window            → GROUP BY path
--   - Unique visitors                  → COUNT(DISTINCT visitor_hash)
--   - Hourly timeline                  → date_trunc('hour', created_at)
--   - Recent activity feed             → ORDER BY created_at DESC LIMIT N
--   All queries use the indexes below.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.page_views (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    path          TEXT NOT NULL,
    referrer      TEXT,
    referrer_host TEXT,
    visitor_hash  TEXT NOT NULL,
    user_agent    TEXT,
    is_bot        BOOLEAN NOT NULL DEFAULT false,
    created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Drop any policies from an earlier (failed) run so this migration can
-- be re-applied cleanly.
DROP POLICY IF EXISTS "Admins can view page views"   ON public.page_views;
DROP POLICY IF EXISTS "Admins can delete page views" ON public.page_views;

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view page views"
    ON public.page_views FOR SELECT
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins can delete page views"
    ON public.page_views FOR DELETE
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_page_views_created_at
    ON public.page_views (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_page_views_path_created_at
    ON public.page_views (path, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_page_views_visitor_created_at
    ON public.page_views (visitor_hash, created_at DESC);

-- Partial index: most admin queries filter is_bot = false. The index
-- only stores non-bot rows, so it stays small even under heavy bot
-- traffic.
CREATE INDEX IF NOT EXISTS idx_page_views_humans_created_at
    ON public.page_views (created_at DESC)
    WHERE is_bot = false;

-- Drift detection: bump the schema version so /api/admin/health and the
-- prebuild check know the analytics table is expected to exist.
UPDATE public._migrations_state
   SET schema_version = '2026-07-05-page-views-v1',
       last_repair_at = NOW()
 WHERE id = 1;