-- Alerte quota à 90% : horodatage anti-doublon mensuel sur subscriptions.
-- Idempotent, additif, sans risque.

ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "quota_alert_sent_at" timestamp;
