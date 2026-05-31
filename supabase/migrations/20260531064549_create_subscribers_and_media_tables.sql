-- Subscribers table to track email subscribers
CREATE TABLE public.subscribers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Enable RLS
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Public can subscribe (INSERT)
CREATE POLICY "Public can subscribe" ON public.subscribers
    FOR INSERT WITH CHECK (true);

-- Public can view active subscribers count
CREATE POLICY "Public can view active subscribers" ON public.subscribers
    FOR SELECT USING (true);

-- Only authenticated can manage subscribers
CREATE POLICY "Admins can manage subscribers" ON public.subscribers
    FOR ALL USING (auth.role() = 'authenticated');

-- Create index for email lookups
CREATE INDEX idx_subscribers_email ON public.subscribers(email);

-- Media/Assets table to store uploaded file URLs
CREATE TABLE public.media (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    type TEXT NOT NULL, -- 'image' or 'pdf'
    size INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- Public can view media
CREATE POLICY "Public can view media" ON public.media
    FOR SELECT USING (true);

-- Only authenticated can manage media
CREATE POLICY "Admins can manage media" ON public.media
    FOR ALL USING (auth.role() = 'authenticated');

-- Events table for announcements
CREATE TABLE public.events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    event_date TIMESTAMP WITH TIME ZONE,
    event_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Public can view active events
CREATE POLICY "Public can view active events" ON public.events
    FOR SELECT USING (is_active = true);

-- Only authenticated can manage events
CREATE POLICY "Admins can manage events" ON public.events
    FOR ALL USING (auth.role() = 'authenticated');
