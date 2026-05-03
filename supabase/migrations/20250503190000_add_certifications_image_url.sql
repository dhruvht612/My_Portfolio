-- Optional: badge image URL for admin ImageUploader (cert-images bucket).
-- Run via `supabase db push` after link, or paste in Supabase SQL Editor.
ALTER TABLE certifications ADD COLUMN IF NOT EXISTS image_url text;
