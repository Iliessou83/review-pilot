-- Boucle de collecte d'avis (SMS / WhatsApp).
-- Idempotent : IF NOT EXISTS partout, réexécutable sans risque.

ALTER TABLE "businesses" ADD COLUMN IF NOT EXISTS "review_link" text;

CREATE TABLE IF NOT EXISTS "contacts" (
  "id" serial PRIMARY KEY NOT NULL,
  "business_id" integer NOT NULL REFERENCES "businesses"("id") ON DELETE cascade,
  "phone" text NOT NULL,
  "name" text,
  "source" text DEFAULT 'manual' NOT NULL,
  "opted_out" boolean DEFAULT false NOT NULL,
  "last_requested_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "review_requests" (
  "id" serial PRIMARY KEY NOT NULL,
  "business_id" integer NOT NULL REFERENCES "businesses"("id") ON DELETE cascade,
  "contact_id" integer NOT NULL REFERENCES "contacts"("id") ON DELETE cascade,
  "channel" text DEFAULT 'sms' NOT NULL,
  "token" text NOT NULL UNIQUE,
  "status" text DEFAULT 'queued' NOT NULL,
  "provider_message_id" text,
  "error" text,
  "sent_at" timestamp,
  "clicked_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- Un même numéro n'existe qu'une fois par commerce (dédoublonnage import Roue).
CREATE UNIQUE INDEX IF NOT EXISTS "contacts_business_phone_uq" ON "contacts" ("business_id", "phone");
