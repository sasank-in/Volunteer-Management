-- Public, shareable URL slug for events. Allows /e/{slug} pages outside the auth wall.
ALTER TABLE events ADD COLUMN IF NOT EXISTS slug VARCHAR(180);

-- Backfill existing rows with a stable, collision-resistant slug derived from id.
UPDATE events
SET slug = CONCAT(
    LOWER(REGEXP_REPLACE(SUBSTRING(title FROM 1 FOR 60), '[^a-zA-Z0-9]+', '-', 'g')),
    '-',
    SUBSTRING(id::text FROM 1 FOR 8))
WHERE slug IS NULL;

ALTER TABLE events ALTER COLUMN slug SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
