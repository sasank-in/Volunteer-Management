-- Optional public cover image URL for events. Empty for events created before
-- the upload feature shipped — frontend renders a placeholder in that case.
ALTER TABLE events ADD COLUMN IF NOT EXISTS cover_image_url VARCHAR(500);
