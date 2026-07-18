-- Fiche produits (anti-hallucination IA) + mots-clés d'escalade
-- À exécuter sur la base Neon, ou via: npm run db:push

ALTER TABLE "businesses" ADD COLUMN IF NOT EXISTS "product_facts" json DEFAULT '[]'::json NOT NULL;
ALTER TABLE "businesses" ADD COLUMN IF NOT EXISTS "escalation_keywords" json DEFAULT '[]'::json NOT NULL;
