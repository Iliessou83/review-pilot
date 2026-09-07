-- Index de performance pour les chemins chauds du dashboard et des cron.
-- Les index uniques sur les identifiants plateforme doivent être ajoutés après
-- contrôle des doublons existants ; on ne supprime aucune donnée automatiquement.
CREATE INDEX IF NOT EXISTS reviews_business_published_idx
  ON reviews (business_id, published_at DESC);

CREATE INDEX IF NOT EXISTS reviews_business_rating_idx
  ON reviews (business_id, rating);

CREATE INDEX IF NOT EXISTS pending_responses_status_notified_idx
  ON pending_responses (status, notified_at);

CREATE INDEX IF NOT EXISTS login_attempts_reset_at_idx
  ON login_attempts (reset_at);
