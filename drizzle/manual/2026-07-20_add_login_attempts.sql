-- Migration manuelle : compteur anti-bruteforce login partagé (voir src/lib/rate-limit.ts).
-- Remplace le Map en mémoire (cassé en prod sur Vercel : plusieurs instances serverless,
-- chacune sa propre mémoire → la limite de 5 tentatives/15min ne tenait pas en pratique).
-- À exécuter dans Supabase/Neon (SQL editor) sur la base review-pilot.

CREATE TABLE IF NOT EXISTS login_attempts (
  id serial PRIMARY KEY,
  ip_key text NOT NULL UNIQUE,
  count integer NOT NULL DEFAULT 1,
  reset_at timestamptz NOT NULL
);
