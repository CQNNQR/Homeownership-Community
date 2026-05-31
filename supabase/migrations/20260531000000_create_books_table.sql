-- Books Table
CREATE TABLE public.books (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT DEFAULT 'Brandon Bee Dixon',
    amazon_url TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- Public can view active books
CREATE POLICY "Public can view active books" ON public.books
    FOR SELECT USING (is_active = true);

-- Only authenticated can manage books
CREATE POLICY "Admins can manage books" ON public.books
    FOR ALL USING (auth.role() = 'authenticated');

-- Create index for sorting
CREATE INDEX idx_books_sort_order ON public.books(sort_order ASC);
