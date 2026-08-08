-- Système de posts GMB (4x/mois), collecte de médias client, et stratégie Q&A.
-- Voir project_review_pilot_gmb memory / demande Ilies 2026-08-08.

ALTER TABLE businesses ADD COLUMN IF NOT EXISTS posts_target_per_month integer NOT NULL DEFAULT 4;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS media_upload_token text;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS last_content_reminder_at timestamp;
CREATE UNIQUE INDEX IF NOT EXISTS businesses_media_upload_token_idx ON businesses (media_upload_token) WHERE media_upload_token IS NOT NULL;

CREATE TABLE IF NOT EXISTS qna_strategies (
  id serial PRIMARY KEY,
  business_id integer NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  items json NOT NULL DEFAULT '[]',
  updated_at timestamp NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS qna_strategies_business_idx ON qna_strategies (business_id);

CREATE TABLE IF NOT EXISTS posts (
  id serial PRIMARY KEY,
  business_id integer NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  content text NOT NULL,
  media_url text,
  media_type text CHECK (media_type IN ('image', 'video')),
  source text NOT NULL DEFAULT 'equipe' CHECK (source IN ('client', 'equipe')),
  status text NOT NULL DEFAULT 'brouillon' CHECK (status IN ('brouillon', 'pret', 'publie', 'echec')),
  scheduled_at timestamp,
  published_at timestamp,
  google_post_id text,
  error_message text,
  created_at timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS posts_business_idx ON posts (business_id);
CREATE INDEX IF NOT EXISTS posts_status_idx ON posts (status);
