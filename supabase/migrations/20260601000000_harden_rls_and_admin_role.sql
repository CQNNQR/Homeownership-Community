-- Harden RLS policies: gate admin operations behind app_metadata.role = 'admin'
-- Remove public SELECT on media and subscribers.
-- Use DROP POLICY IF EXISTS for idempotency.

-- =============================================================
-- site_settings: keep public SELECT, restrict writes to admins
-- =============================================================
DROP POLICY IF EXISTS "Public can view site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can update site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Authenticated can update settings" ON public.site_settings;
DROP POLICY IF EXISTS "Authenticated can insert settings" ON public.site_settings;

CREATE POLICY "Public can view site settings" ON public.site_settings
    FOR SELECT USING (true);

CREATE POLICY "Admins can update site settings" ON public.site_settings
    FOR UPDATE USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins can insert site settings" ON public.site_settings
    FOR INSERT WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- =============================================================
-- books: keep public SELECT (active only), restrict writes to admins
-- =============================================================
DROP POLICY IF EXISTS "Public can view active books" ON public.books;
DROP POLICY IF EXISTS "Admins can manage books" ON public.books;

CREATE POLICY "Public can view active books" ON public.books
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage books" ON public.books
    FOR ALL USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- =============================================================
-- testimonials: keep public SELECT (active only), restrict writes to admins
-- =============================================================
DROP POLICY IF EXISTS "Public can view active testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admins can manage testimonials" ON public.testimonials;

CREATE POLICY "Public can view active testimonials" ON public.testimonials
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage testimonials" ON public.testimonials
    FOR ALL USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- =============================================================
-- podcast_episodes: keep public SELECT (visible only), restrict writes to admins
-- =============================================================
DROP POLICY IF EXISTS "Public can view podcast episodes" ON public.podcast_episodes;
DROP POLICY IF EXISTS "Public can view visible podcast episodes" ON public.podcast_episodes;
DROP POLICY IF EXISTS "Admins can manage podcast episodes" ON public.podcast_episodes;

CREATE POLICY "Public can view visible podcast episodes" ON public.podcast_episodes
    FOR SELECT USING (is_visible = true);

CREATE POLICY "Admins can manage podcast episodes" ON public.podcast_episodes
    FOR ALL USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- =============================================================
-- events: keep public SELECT (active only), restrict writes to admins
-- =============================================================
DROP POLICY IF EXISTS "Public can view active events" ON public.events;
DROP POLICY IF EXISTS "Admins can manage events" ON public.events;

CREATE POLICY "Public can view active events" ON public.events
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage events" ON public.events
    FOR ALL USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- =============================================================
-- subscribers: keep public INSERT, remove public SELECT, admin only otherwise
-- =============================================================
DROP POLICY IF EXISTS "Public can view active subscribers" ON public.subscribers;
DROP POLICY IF EXISTS "Admins can manage subscribers" ON public.subscribers;
DROP POLICY IF EXISTS "Public can subscribe" ON public.subscribers;

CREATE POLICY "Public can subscribe" ON public.subscribers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage subscribers" ON public.subscribers
    FOR ALL USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- =============================================================
-- media: remove public SELECT, admin only
-- =============================================================
DROP POLICY IF EXISTS "Public can view media" ON public.media;
DROP POLICY IF EXISTS "Admins can manage media" ON public.media;

CREATE POLICY "Admins can manage media" ON public.media
    FOR ALL USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- =============================================================
-- blog_posts: keep public SELECT (published only), restrict writes to admins
-- =============================================================
DROP POLICY IF EXISTS "Public can view published blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can manage blog posts" ON public.blog_posts;

CREATE POLICY "Public can view published blog posts" ON public.blog_posts
    FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage blog posts" ON public.blog_posts
    FOR ALL USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- =============================================================
-- blog_post_visibility: keep public SELECT, restrict writes to admins
-- =============================================================
DROP POLICY IF EXISTS "Public can view blog visibility" ON public.blog_post_visibility;
DROP POLICY IF EXISTS "Admins can manage blog visibility" ON public.blog_post_visibility;

CREATE POLICY "Public can view blog visibility" ON public.blog_post_visibility
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage blog visibility" ON public.blog_post_visibility
    FOR ALL USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
