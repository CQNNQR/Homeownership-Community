-- Testimonials Table
-- Stores customer testimonials and success stories

CREATE TABLE public.testimonials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    quote TEXT NOT NULL,
    role TEXT,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Public read access (only active testimonials)
CREATE POLICY "Public can view active testimonials" ON public.testimonials
    FOR SELECT USING (is_active = true);

-- Only authenticated users can manage testimonials
CREATE POLICY "Admins can manage testimonials" ON public.testimonials
    FOR ALL USING (auth.role() = 'authenticated');

-- Insert sample testimonials
INSERT INTO public.testimonials (name, quote, role) VALUES
    ('Sarah M.', 'Brandon helped me understand the path from renter to owner. His guidance was invaluable.', 'First-time Homeowner'),
    ('James T.', 'The real estate investment insights I gained helped me build a rental portfolio.', 'Real Estate Investor');
