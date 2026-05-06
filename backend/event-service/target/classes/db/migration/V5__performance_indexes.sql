-- Composite for the "find upcoming open events" query, which scans by status + date.
CREATE INDEX IF NOT EXISTS idx_events_status_date ON events(status, event_date);

-- Speed up "is this volunteer already registered for this event" check on the
-- registration hot path.
CREATE INDEX IF NOT EXISTS idx_participations_event_volunteer
  ON participations(event_id, volunteer_id);
