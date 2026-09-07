ALTER TABLE pending_responses
  ADD COLUMN IF NOT EXISTS processing_at timestamptz;
