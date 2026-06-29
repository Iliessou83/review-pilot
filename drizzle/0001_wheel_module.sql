-- Module Roue de la chance (collecte d'avis + jeu-concours)
-- À exécuter sur la base Neon, ou via: npm run db:push

CREATE TABLE IF NOT EXISTS "wheel_configs" (
  "id" serial PRIMARY KEY NOT NULL,
  "business_id" integer,
  "slug" text NOT NULL,
  "mode" text DEFAULT 'avis' NOT NULL,
  "theme" text DEFAULT 'dark' NOT NULL,
  "business_name" text NOT NULL,
  "headline" text DEFAULT 'Merci de votre visite !' NOT NULL,
  "logo_url" text,
  "brand_color" text DEFAULT '#10b981' NOT NULL,
  "review_url" text NOT NULL,
  "segments" json NOT NULL,
  "require_contact" boolean DEFAULT false NOT NULL,
  "consent_text" text,
  "active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "wheel_configs_slug_unique" UNIQUE("slug")
);

CREATE TABLE IF NOT EXISTS "wheel_spins" (
  "id" serial PRIMARY KEY NOT NULL,
  "wheel_config_id" integer NOT NULL,
  "prize_index" integer NOT NULL,
  "prize_label" text NOT NULL,
  "email" text,
  "phone" text,
  "review_clicked" boolean DEFAULT false NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

DO $$ BEGIN
  ALTER TABLE "wheel_configs" ADD CONSTRAINT "wheel_configs_business_id_businesses_id_fk"
    FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "wheel_spins" ADD CONSTRAINT "wheel_spins_wheel_config_id_wheel_configs_id_fk"
    FOREIGN KEY ("wheel_config_id") REFERENCES "wheel_configs"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE INDEX IF NOT EXISTS "wheel_spins_config_idx" ON "wheel_spins" ("wheel_config_id");
