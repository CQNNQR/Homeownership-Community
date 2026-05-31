-- Blog Post Visibility Table
-- Stores visibility state for WordPress blog posts

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

-- Enable RLS
ALTER TABLE public.blog_post_visibility ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public can view blog visibility" ON public.blog_post_visibility
    FOR SELECT USING (true);

-- Only authenticated users can manage visibility
CREATE POLICY "Admins can manage blog visibility" ON public.blog_post_visibility
    FOR ALL USING (auth.role() = 'authenticated');
