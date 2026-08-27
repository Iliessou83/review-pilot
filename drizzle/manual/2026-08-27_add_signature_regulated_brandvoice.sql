-- Correctifs "Avant Commercialisation" (2026-08-27) : identité IA réelle,
-- mode professions réglementées, voix de marque, alerte SMS immédiate.
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS signature_name text;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS regulated_sector boolean NOT NULL DEFAULT false;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS brand_tone text NOT NULL DEFAULT 'chaleureux';
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS tutoiement boolean NOT NULL DEFAULT false;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS owner_phone text;
