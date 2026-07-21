-- Migration manuelle : mot de passe oublié pour les comptes clients self-serve
-- (table `users`). Jeton brut envoyé par email, seul son hash sha256 est
-- stocké ici, usage unique, valable 1h (voir src/lib/auth.ts).
-- À exécuter dans Neon/Supabase (SQL editor) sur la base review-pilot.

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id serial PRIMARY KEY,
  user_id integer NOT NULL,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
