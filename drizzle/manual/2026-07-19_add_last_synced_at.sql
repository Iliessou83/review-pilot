-- Migration manuelle : indicateur de synchro réel (NavBar).
-- À exécuter dans Supabase (SQL editor) sur la base review-pilot.

ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS last_synced_at timestamptz;
