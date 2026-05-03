-- Optional: badge image URL for admin ImageUploader (cert-images bucket).
-- Run in Supabase SQL editor if your DB was created before this column existed.
ALTER TABLE certifications ADD COLUMN IF NOT EXISTS image_url text;
