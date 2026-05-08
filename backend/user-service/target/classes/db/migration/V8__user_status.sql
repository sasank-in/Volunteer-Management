-- Active/inactive status. Existing users default to ACTIVE; only admins can flip the bit.
-- INACTIVE users keep their data but cannot log in.
ALTER TABLE user_accounts
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE';

CREATE INDEX IF NOT EXISTS idx_user_accounts_status ON user_accounts(status);
