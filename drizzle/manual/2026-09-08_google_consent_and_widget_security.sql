ALTER TABLE businesses ADD COLUMN IF NOT EXISTS widget_public_token text;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS widget_enabled boolean DEFAULT false NOT NULL;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS widget_allowed_origins json DEFAULT '[]'::json NOT NULL;

UPDATE businesses
SET widget_public_token = gen_random_uuid()::text
WHERE widget_public_token IS NULL;

ALTER TABLE businesses
  ALTER COLUMN widget_public_token SET DEFAULT gen_random_uuid()::text,
  ALTER COLUMN widget_public_token SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS businesses_widget_public_token_unique
  ON businesses (widget_public_token);

-- Une synchronisation manuelle et le cron peuvent se chevaucher. Cet index
-- rend l'insertion idempotente au niveau PostgreSQL, même en cas de course.
CREATE UNIQUE INDEX IF NOT EXISTS reviews_business_platform_review_unique
  ON reviews (business_id, platform_review_id);

CREATE TABLE IF NOT EXISTS google_access_consents (
  id serial PRIMARY KEY,
  business_id integer NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  actor_email text NOT NULL,
  terms_version text NOT NULL,
  owner_or_manager_confirmed boolean NOT NULL,
  oauth_access_granted boolean NOT NULL,
  created_at timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS google_access_consents_business_created_idx
  ON google_access_consents (business_id, created_at DESC);

CREATE TABLE IF NOT EXISTS google_connection_tickets (
  id serial PRIMARY KEY,
  token_hash text NOT NULL UNIQUE,
  actor_email text NOT NULL,
  encrypted_refresh_token text NOT NULL,
  terms_version text NOT NULL,
  expires_at timestamp NOT NULL,
  created_at timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS google_connection_tickets_expires_idx
  ON google_connection_tickets (expires_at);
