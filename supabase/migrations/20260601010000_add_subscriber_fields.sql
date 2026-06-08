-- Add first_name, last_name, phone columns to subscribers so the
-- "Join the Community" form can actually persist what it asks for.
-- All nullable so existing rows are not affected and the public
-- INSERT-with-true policy continues to work.

ALTER TABLE public.subscribers
    ADD COLUMN IF NOT EXISTS first_name TEXT,
    ADD COLUMN IF NOT EXISTS last_name TEXT,
    ADD COLUMN IF NOT EXISTS phone TEXT;
