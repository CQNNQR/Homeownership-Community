-- Fix RLS policies for site_settings table
-- Allow authenticated users to UPDATE and INSERT settings

-- Drop existing policies
DROP POLICY IF EXISTS "Public can view site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can update site settings" ON public.site_settings;

-- Public read access (anyone can view site settings)
CREATE POLICY "Public can view site settings" ON public.site_settings
    FOR SELECT USING (true);

-- Authenticated users can UPDATE settings
CREATE POLICY "Authenticated can update settings" ON public.site_settings
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Authenticated users can INSERT settings
CREATE POLICY "Authenticated can insert settings" ON public.site_settings
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
