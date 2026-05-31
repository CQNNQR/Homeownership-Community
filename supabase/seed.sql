-- Seed books table
INSERT INTO public.books (title, author, amazon_url, description, sort_order, is_active) VALUES
('Message to the Businessman', 'Brandon Bee Dixon', 'https://a.co/d/09f8MkL3', 'Essential wisdom for entrepreneurs and business professionals.', 1, true),
('Sales: The Nucleus of Any Profession', 'Brandon Bee Dixon', 'https://a.co/d/0bXRCoq6', 'Master the art of selling in any industry.', 2, true)
ON CONFLICT DO NOTHING;
