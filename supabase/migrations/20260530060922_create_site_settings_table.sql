-- Site Settings Table
-- Stores configurable site content like social links, podcast URL, contact info

CREATE TABLE public.site_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Public read access (anyone can view site settings)
CREATE POLICY "Public can view site settings" ON public.site_settings
    FOR SELECT USING (true);

-- Only authenticated users can update site settings
CREATE POLICY "Admins can update site settings" ON public.site_settings
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Insert default settings
INSERT INTO public.site_settings (key, value, description) VALUES
    ('contact_email', 'brandon@hocmortgage.com', 'Main contact email address'),
    ('facebook_url', 'https://www.facebook.com/share/1DySwCFJKY/?mibextid=wwXIfr', 'Facebook profile URL'),
    ('instagram_url', 'https://www.instagram.com/billionaireloanofficer?utm_source=qr', 'Instagram profile URL'),
    ('linkedin_url', 'https://www.linkedin.com/in/brandonbeedixon?utm_source=share_via&utm_content=profile&utm_medium=member_ios', 'LinkedIn profile URL'),
    ('twitter_url', 'https://x.com/billionaire_lo?s=11&t=b8_2VZHBBDvMHx_DZ4ZwPA', 'X/Twitter profile URL'),
    ('youtube_url', 'https://youtube.com/@billionaireloanofficer?si=x_1rO-5t4U3rdgbf', 'YouTube channel URL'),
    ('podcast_url', 'https://youtube.com/@billionaireloanofficer', 'Power of Ownership Podcast URL'),
    ('site_tagline', 'We Create Owners', 'Main site tagline'),
    ('hero_title', 'Building Generational Wealth Through Homeownership', 'Homepage hero title'),
    ('hero_subtitle', 'Join the Homeownership Community and take control of your financial future through real estate investment and property ownership.', 'Homepage hero subtitle');
