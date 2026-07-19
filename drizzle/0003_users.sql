-- Comptes self-serve (inscription autonome). Idempotent.
CREATE TABLE IF NOT EXISTS "users" (
  "id" serial PRIMARY KEY NOT NULL,
  "email" text NOT NULL UNIQUE,
  "password_hash" text NOT NULL,
  "name" text,
  "role" text DEFAULT 'client' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);
