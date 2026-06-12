CREATE TABLE "businesses" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"platform" text NOT NULL,
	"platform_id" text NOT NULL,
	"platform_token" text NOT NULL,
	"auto_reply_5_star" boolean DEFAULT true NOT NULL,
	"auto_reply_negative" boolean DEFAULT false NOT NULL,
	"business_type" text DEFAULT 'restaurant',
	"compensation_enabled" boolean DEFAULT false NOT NULL,
	"compensation_text" text,
	"owner_email" text NOT NULL,
	"referral_code" text,
	"referred_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pending_responses" (
	"id" serial PRIMARY KEY NOT NULL,
	"review_id" integer NOT NULL,
	"suggestions" json NOT NULL,
	"notified_at" timestamp DEFAULT now() NOT NULL,
	"chosen_suggestion_index" integer,
	"custom_response" text,
	"status" text DEFAULT 'pending' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"platform_review_id" text NOT NULL,
	"author_name" text NOT NULL,
	"rating" integer NOT NULL,
	"text" text NOT NULL,
	"published_at" timestamp NOT NULL,
	"responded" boolean DEFAULT false NOT NULL,
	"response_text" text,
	"responded_at" timestamp,
	"platform" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pending_responses" ADD CONSTRAINT "pending_responses_review_id_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;