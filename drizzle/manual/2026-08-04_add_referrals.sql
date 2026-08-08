-- Système de parrainage réel (users.referral_code + table referrals).
-- Avant ce fichier, /parrainage affichait un code Math.random() jamais
-- persisté ni relu par aucune route : voir project_caela_reputation memory.
-- Voir aussi drizzle/manual/README ou les migrations précédentes pour le
-- style (IF NOT EXISTS partout, jamais de perte de données).

ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code text;
-- Unique seulement une fois rempli (les lignes existantes restent NULL, pas
-- de conflit sur plusieurs NULL avec un index unique standard Postgres).
CREATE UNIQUE INDEX IF NOT EXISTS users_referral_code_idx ON users (referral_code) WHERE referral_code IS NOT NULL;

CREATE TABLE IF NOT EXISTS referrals (
  id serial PRIMARY KEY,
  referrer_email text NOT NULL,
  referred_email text NOT NULL UNIQUE,
  code text NOT NULL,
  created_at timestamp NOT NULL DEFAULT now(),
  -- Posé par le webhook Stripe quand l'abonnement du filleul passe "active"
  -- pour la première fois (fin d'essai, premier prélèvement réussi).
  referred_first_payment_at timestamp,
  -- Posé par le cron referral-reward, 21 jours après le premier paiement.
  referrer_rewarded_at timestamp
);

CREATE INDEX IF NOT EXISTS referrals_referrer_email_idx ON referrals (referrer_email);
CREATE INDEX IF NOT EXISTS referrals_reward_due_idx ON referrals (referred_first_payment_at) WHERE referrer_rewarded_at IS NULL;
