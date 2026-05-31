-- Add is_visible field to podcast_episodes table
ALTER TABLE public.podcast_episodes ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;

-- Update existing episode to be visible
UPDATE public.podcast_episodes SET is_visible = true WHERE is_visible IS NULL;

-- Enable RLS
ALTER TABLE public.podcast_episodes ENABLE ROW LEVEL SECURITY;

-- Public can view visible episodes
CREATE POLICY "Public can view visible podcast episodes" ON public.podcast_episodes
    FOR SELECT USING (is_visible = true);

-- Only authenticated users can manage episodes
DROP POLICY IF EXISTS "Admins can manage podcast episodes" ON public.podcast_episodes;
CREATE POLICY "Admins can manage podcast episodes" ON public.podcast_episodes
    FOR ALL USING (auth.role() = 'authenticated');
