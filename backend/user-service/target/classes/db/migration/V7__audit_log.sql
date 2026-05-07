-- Append-only audit trail for admin actions. Read-only from the app once
-- written; pruning (if ever needed) belongs to a separate retention job.
CREATE TABLE audit_log (
  id           UUID PRIMARY KEY,
  occurred_at  TIMESTAMPTZ NOT NULL,
  actor_id     UUID NOT NULL,
  actor_username VARCHAR(50) NOT NULL,
  action       VARCHAR(60) NOT NULL,
  target_type  VARCHAR(40),
  target_id    UUID,
  details      TEXT
);

CREATE INDEX idx_audit_log_occurred_at ON audit_log(occurred_at DESC);
CREATE INDEX idx_audit_log_actor       ON audit_log(actor_id);
CREATE INDEX idx_audit_log_target      ON audit_log(target_type, target_id);
