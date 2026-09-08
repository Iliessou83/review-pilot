ALTER TABLE businesses
  ALTER COLUMN auto_reply_5_star SET DEFAULT false;

-- Aucune preuve de consentement append-only n'existe pour les activations
-- historiques. On repart donc en mode manuel et chaque commerçant réactive
-- volontairement le périmètre souhaité dans Réglages.
UPDATE businesses
SET auto_reply_5_star = false,
    auto_reply_negative = false
WHERE auto_reply_5_star = true
   OR auto_reply_negative = true;

CREATE TABLE IF NOT EXISTS business_consents (
  id serial PRIMARY KEY,
  business_id integer NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  actor_email text NOT NULL,
  scope text NOT NULL CHECK (scope IN ('manual', 'positive_auto', 'all_delegated')),
  terms_version text NOT NULL,
  granted boolean NOT NULL,
  created_at timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS business_consents_business_created_idx
  ON business_consents (business_id, created_at DESC);

CREATE TABLE IF NOT EXISTS review_activity_events (
  id serial PRIMARY KEY,
  business_id integer NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  platform text NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('review_detected', 'reply_published')),
  handling_mode text CHECK (handling_mode IN ('manual', 'automated', 'merchant_approved', 'caela_approved')),
  latency_seconds integer,
  occurred_at timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS review_activity_events_business_occurred_idx
  ON review_activity_events (business_id, occurred_at DESC);
