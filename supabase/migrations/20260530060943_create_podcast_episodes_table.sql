-- Podcast Episodes Table
-- Stores Power of Ownership podcast episodes

CREATE TABLE public.podcast_episodes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    youtube_url TEXT NOT NULL,
    episode_number INTEGER,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.podcast_episodes ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public can view podcast episodes" ON public.podcast_episodes
    FOR SELECT USING (true);

-- Only authenticated users can manage episodes
CREATE POLICY "Admins can manage podcast episodes" ON public.podcast_episodes
    FOR ALL USING (auth.role() = 'authenticated');

-- Insert sample episode
INSERT INTO public.podcast_episodes (title, description, youtube_url, episode_number) VALUES
    ('Episode 1: Introduction to the Power of Ownership', 'Brandon introduces the Power of Ownership Podcast and shares his mission to help people become homeowners and investors.', 'https://youtube.com/@billionaireloanofficer', 1);
