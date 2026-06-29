-- Ajoute uniquement la table d'abonnements (facturation Stripe essai-avec-CB).
-- Idempotent : sûr même si exécuté manuellement plusieurs fois.
-- La migration de la roue (0001_wheel_module.sql) reste indépendante.
CREATE TABLE IF NOT EXISTS "subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"plan_id" text,
	"status" text DEFAULT 'incomplete' NOT NULL,
	"trial_ends_at" timestamp,
	"current_period_end" timestamp,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"reminder_sent_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptions_email_unique" UNIQUE("email")
);
