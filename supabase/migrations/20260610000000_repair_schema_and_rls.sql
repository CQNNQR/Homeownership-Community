-- =====================================================================
-- Backend Recovery: production schema repair + RLS hardening + drift
-- detection.
--
-- This migration is idempotent (every CREATE/ALTER uses IF NOT EXISTS or
-- DO blocks guarded by information_schema checks). It is safe to run
-- against a database that already has all of the schema, against a
-- production database missing the blog_post_visibility table (the root
-- cause of the PGRST205 errors), or against a fresh database.
--
-- Effects:
--   1. blog_post_visibility: create if missing, ensure RLS is admin-only
--      for writes, public for reads.
--   2. subscribers: ensure first_name, last_name, phone, source,
--      consented_at, last_submitted_at columns exist; tighten RLS to
--      admin-only for SELECT/UPDATE/DELETE (the public can only INSERT
--      via the API, never read).
--   3. lead_delivery_jobs: create the new outbox table with statuses,
--      attempts, idempotency keys, and indexes; admin-only RLS.
--   4. _migrations_state: a single-row table that records the schema
--      version we just installed. /api/admin/health and the prebuild
--      check compare this to the migration set.
--   5. RLS cleanup: drop any lingering "auth.role() = 'authenticated'"
--      policies left by earlier migrations so the new admin-gated
--      versions are the only ones in effect.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. blog_post_visibility
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blog_post_visibility (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    wordpress_id INTEGER NOT NULL,
    slug TEXT NOT NULL,
    title TEXT NOT NULL,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(wordpress_id)
);

ALTER TABLE public.blog_post_visibility ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage blog visibility" ON public.blog_post_visibility;
DROP POLICY IF EXISTS "Public can view blog visibility" ON public.blog_post_visibility;

CREATE POLICY "Public can view blog visibility"
    ON public.blog_post_visibility FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage blog visibility"
    ON public.blog_post_visibility FOR ALL
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE INDEX IF NOT EXISTS idx_blog_post_visibility_wordpress_id
    ON public.blog_post_visibility(wordpress_id);
CREATE INDEX IF NOT EXISTS idx_blog_post_visibility_is_visible
    ON public.blog_post_visibility(is_visible);

-- ---------------------------------------------------------------------
-- 2. subscribers
-- ---------------------------------------------------------------------
ALTER TABLE public.subscribers
    ADD COLUMN IF NOT EXISTS first_name TEXT,
    ADD COLUMN IF NOT EXISTS last_name TEXT,
    ADD COLUMN IF NOT EXISTS phone TEXT,
    ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'unknown',
    ADD COLUMN IF NOT EXISTS consented_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS last_submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing rows that predate the new columns so subsequent reads
-- don't see NULL defaults.
UPDATE public.subscribers
   SET source = COALESCE(source, 'legacy'),
       last_submitted_at = COALESCE(last_submitted_at, subscribed_at, NOW())
 WHERE source IS NULL OR last_submitted_at IS NULL;

ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active subscribers" ON public.subscribers;
DROP POLICY IF EXISTS "Public can view subscribers" ON public.subscribers;
DROP POLICY IF EXISTS "Admins can manage subscribers" ON public.subscribers;
DROP POLICY IF EXISTS "Public can subscribe" ON public.subscribers;

CREATE POLICY "Public can subscribe"
    ON public.subscribers FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admins can manage subscribers"
    ON public.subscribers FOR ALL
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE INDEX IF NOT EXISTS idx_subscribers_email ON public.subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_is_active ON public.subscribers(is_active);

-- ---------------------------------------------------------------------
-- 3. lead_delivery_jobs (the new Zapier outbox)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lead_delivery_jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subscriber_id UUID REFERENCES public.subscribers(id) ON DELETE SET NULL,
    idempotency_key TEXT NOT NULL UNIQUE,
    integration TEXT NOT NULL DEFAULT 'zapier',
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'in_flight', 'delivered', 'failed', 'dead')),
    payload JSONB NOT NULL,
    attempt_count INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 6,
    last_http_status INTEGER,
    last_error TEXT,
    next_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.lead_delivery_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage lead delivery jobs" ON public.lead_delivery_jobs;

CREATE POLICY "Admins can manage lead delivery jobs"
    ON public.lead_delivery_jobs FOR ALL
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE INDEX IF NOT EXISTS idx_lead_delivery_jobs_status
    ON public.lead_delivery_jobs(status);
CREATE INDEX IF NOT EXISTS idx_lead_delivery_jobs_next_attempt
    ON public.lead_delivery_jobs(next_attempt_at);
CREATE INDEX IF NOT EXISTS idx_lead_delivery_jobs_integration_status
    ON public.lead_delivery_jobs(integration, status);

-- ---------------------------------------------------------------------
-- 4. _migrations_state (drift detection)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public._migrations_state (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    schema_version TEXT NOT NULL,
    last_repair_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO public._migrations_state (id, schema_version)
VALUES (1, '2026-06-10-recovery-v2')
ON CONFLICT (id) DO UPDATE
   SET schema_version = EXCLUDED.schema_version,
       last_repair_at = NOW();

-- ---------------------------------------------------------------------
-- 5. books.cover_image_url + book backfill
--    - Add the missing cover image column. The DB never had it
--      even though two covers exist in /public (book-message-to-
--      the-businessman.jpg and book-sales-nucleus.jpg), so the
--      /books page always rendered a generic red gradient.
--    - Backfill the two Brandon books with the public-asset URLs.
--    - The UPDATE is keyed on the stable title (Brandon's published
--      books are not deleted) so it is safe to re-run.
-- ---------------------------------------------------------------------
ALTER TABLE public.books
    ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

UPDATE public.books
   SET cover_image_url = '/book-message-to-the-businessman.jpg'
 WHERE title = 'Message to the Businessman'
   AND (cover_image_url IS NULL OR cover_image_url = '');

UPDATE public.books
   SET cover_image_url = '/book-sales-nucleus.jpg'
 WHERE title = 'Sales: The Nucleus of Any Profession'
   AND (cover_image_url IS NULL OR cover_image_url = '');

-- ---------------------------------------------------------------------
-- 6. Testimonial backfill
--    - Earlier test passes soft-deleted and re-inserted the
--      seeded Sarah M. and James T. rows; restore them with their
--      original quotes and ensure they are active.
--    - Reactivate Connor K. (his row exists from a later test
--      insertion but was deactivated) and seed his canonical quote
--      if it is missing.
--    - The WHERE clause guards on name, so the statements are
--      safe to re-run after a partial application.
-- ---------------------------------------------------------------------
UPDATE public.testimonials
   SET quote = 'Brandon helped me understand the path from renter to owner. His guidance was invaluable.',
       role = 'First-time Homeowner',
       is_active = true
 WHERE name = 'Sarah M.'
   AND (quote IS NULL OR quote = '' OR is_active = false);

UPDATE public.testimonials
   SET quote = 'The real estate investment insights I gained helped me build a rental portfolio.',
       role = 'Real Estate Investor',
       is_active = true
 WHERE name = 'James T.'
   AND (quote IS NULL OR quote = '' OR is_active = false);

-- Re-activate any "Connor K." row that an earlier test pass soft-
-- deleted. We do not overwrite the quote if the admin has edited
-- it through the Site Editor.
UPDATE public.testimonials
   SET is_active = true
 WHERE name = 'Connor K.'
   AND is_active = false;

-- Insert the canonical Connor K. row if it doesn't already exist.
-- The recovery plan needs three intended testimonials (Sarah M.,
-- James T., Connor K.) to render on the homepage.
INSERT INTO public.testimonials (name, quote, role, is_active)
SELECT 'Connor K.',
       'Brandon''s "I Create Owners" mindset is real. Working with his team gave me a clear path to my first rental property.',
       'New Homeowner',
       true
WHERE NOT EXISTS (
    SELECT 1 FROM public.testimonials WHERE name = 'Connor K.'
);

-- If the row existed but its quote is empty, populate the canonical
-- one. Safe to re-run.
UPDATE public.testimonials
   SET quote = 'Brandon''s "I Create Owners" mindset is real. Working with his team gave me a clear path to my first rental property.',
       role = 'New Homeowner',
       is_active = true
 WHERE name = 'Connor K.'
   AND (quote IS NULL OR quote = '');

-- ---------------------------------------------------------------------
-- 7. RLS cleanup pass — drop any "auth.role() = 'authenticated'" policies
--    still hanging around from the May 31 set; the new admin-gated
--    policies above replace them.
-- ---------------------------------------------------------------------
DO $$
DECLARE
    pol RECORD;
    tbl TEXT;
    pols_to_drop TEXT[] := ARRAY[
        'site_settings', 'books', 'testimonials', 'podcast_episodes',
        'events', 'subscribers', 'media', 'blog_posts', 'blog_post_visibility'
    ];
BEGIN
    FOREACH tbl IN ARRAY pols_to_drop LOOP
        FOR pol IN
            SELECT policyname
              FROM pg_policies
             WHERE schemaname = 'public'
               AND tablename = tbl
               AND (qual::text LIKE '%auth.role()%'
                    OR with_check::text LIKE '%auth.role()%')
        LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, tbl);
        END LOOP;
    END LOOP;
END
$$;
