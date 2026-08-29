-- Alerte interne "client en train de décrocher" (cron quotidien
-- /api/cron/internal-alerts). Jamais montrée au client, digest envoyé à
-- contact@caela.fr uniquement.
CREATE TABLE IF NOT EXISTS internal_alerts (
  id serial PRIMARY KEY,
  business_id integer NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  type text NOT NULL,
  detail text NOT NULL,
  severity text NOT NULL,
  created_at timestamp NOT NULL DEFAULT now(),
  resolved_at timestamp
);
CREATE INDEX IF NOT EXISTS internal_alerts_business_type_idx ON internal_alerts(business_id, type);
