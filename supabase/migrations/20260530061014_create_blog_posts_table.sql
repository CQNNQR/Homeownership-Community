-- Blog Posts Table
-- Stores blog posts for the Homeownership Community blog

CREATE TABLE public.blog_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    featured_image_url TEXT,
    author_name TEXT DEFAULT 'Brandon Bee Dixon',
    category TEXT DEFAULT 'General',
    tags TEXT[],
    reading_time_minutes INTEGER DEFAULT 5,
    is_published BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Public read access (only published posts)
CREATE POLICY "Public can view published blog posts" ON public.blog_posts
    FOR SELECT USING (is_published = true);

-- Only authenticated users can manage blog posts
CREATE POLICY "Admins can manage blog posts" ON public.blog_posts
    FOR ALL USING (auth.role() = 'authenticated');

-- Create index for faster slug lookups
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);

-- Create index for faster category lookups
CREATE INDEX idx_blog_posts_category ON public.blog_posts(category);

-- Create index for published_at for sorting
CREATE INDEX idx_blog_posts_published_at ON public.blog_posts(published_at DESC);
