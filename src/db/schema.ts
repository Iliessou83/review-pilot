import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  serial,
  json,
} from "drizzle-orm/pg-core";

// Une ligne de la fiche produits (questionnaire commerçant). Sert de référentiel
// de faits que l'IA n'a JAMAIS le droit de contredire ou de renier dans une réponse.
export type ProductFact = {
  category: string;       // ex: "Steak haché", "Filet de poulet"
  status: "frais" | "surgele" | "mixte"; // mixte = les deux selon la pièce
  disclosed: boolean;     // annoncé/étiqueté clairement en boutique ?
  note?: string;          // précision libre (ex: "décongelé sous vide le jour même")
};

export const businesses = pgTable("businesses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  platform: text("platform", { enum: ["google", "trustpilot", "facebook", "tripadvisor", "pagesjaunes", "other"] }).notNull(),
  platformId: text("platform_id").notNull(),
  platformToken: text("platform_token").notNull(),
  autoReply5Star: boolean("auto_reply_5_star").default(true).notNull(),
  autoReplyNegative: boolean("auto_reply_negative").default(false).notNull(),
  businessType: text("business_type").default("restaurant"),
  compensationEnabled: boolean("compensation_enabled").default(false).notNull(),
  compensationText: text("compensation_text"),
  // Fiche de faits produits (voir ProductFact) — référentiel anti-hallucination de l'IA.
  productFacts: json("product_facts").$type<ProductFact[]>().default([]).notNull(),
  // Mots-clés additionnels (en plus de la liste par défaut) qui forcent la validation
  // humaine et bloquent toute auto-publication, quelle que soit la note.
  escalationKeywords: json("escalation_keywords").$type<string[]>().default([]).notNull(),
  ownerEmail: text("owner_email").notNull(),
  referralCode: text("referral_code"),
  referredBy: text("referred_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  platformReviewId: text("platform_review_id").notNull(),
  authorName: text("author_name").notNull(),
  rating: integer("rating").notNull(),
  text: text("text").notNull(),
  publishedAt: timestamp("published_at").notNull(),
  responded: boolean("responded").default(false).notNull(),
  responseText: text("response_text"),
  respondedAt: timestamp("responded_at"),
  platform: text("platform", { enum: ["google", "trustpilot", "facebook", "tripadvisor", "pagesjaunes", "other"] }).notNull(),
});

export const pendingResponses = pgTable("pending_responses", {
  id: serial("id").primaryKey(),
  reviewId: integer("review_id")
    .notNull()
    .references(() => reviews.id, { onDelete: "cascade" }),
  suggestions: json("suggestions").$type<string[]>().notNull(),
  notifiedAt: timestamp("notified_at").defaultNow().notNull(),
  chosenSuggestionIndex: integer("chosen_suggestion_index"),
  customResponse: text("custom_response"),
  status: text("status", { enum: ["pending", "sent"] }).default("pending").notNull(),
});

// --- Roue de la chance (collecte d'avis + jeu-concours) ---

// Un segment de la roue. `weight` = poids de probabilité (entier). La somme des
// poids n'a pas besoin de faire 100 : le tirage est pondéré côté serveur.
export type WheelSegment = {
  label: string;   // ex: "-10%", "Café offert", "Rejouez"
  weight: number;  // probabilité relative (ex: 60, 15, 5)
  color: string;   // couleur du segment (hex)
};

export const wheelConfigs = pgTable("wheel_configs", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").references(() => businesses.id, {
    onDelete: "cascade",
  }),
  // identifiant public dans l'URL /r/[slug]
  slug: text("slug").notNull().unique(),
  // "avis" = roue boutique tout-le-monde-gagne ; "concours" = gros lots réseaux
  mode: text("mode", { enum: ["avis", "concours"] }).default("avis").notNull(),
  theme: text("theme", { enum: ["dark", "neon", "warm"] }).default("dark").notNull(),
  businessName: text("business_name").notNull(),
  headline: text("headline").default("Merci de votre visite !").notNull(),
  logoUrl: text("logo_url"),
  brandColor: text("brand_color").default("#10b981").notNull(),
  // lien d'avis Google du commerçant (g.page/r/... ou .../write_review)
  reviewUrl: text("review_url").notNull(),
  segments: json("segments").$type<WheelSegment[]>().notNull(),
  // mode concours : capture email/tel avant de tourner
  requireContact: boolean("require_contact").default(false).notNull(),
  // texte de consentement RGPD affiché en mode concours
  consentText: text("consent_text"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const wheelSpins = pgTable("wheel_spins", {
  id: serial("id").primaryKey(),
  wheelConfigId: integer("wheel_config_id")
    .notNull()
    .references(() => wheelConfigs.id, { onDelete: "cascade" }),
  prizeIndex: integer("prize_index").notNull(),
  prizeLabel: text("prize_label").notNull(),
  email: text("email"),
  phone: text("phone"),
  // mesure : l'utilisateur a-t-il cliqué pour aller laisser un avis (jamais conditionné)
  reviewClicked: boolean("review_clicked").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- Abonnements / facturation (essai-avec-CB Stripe) ---
// Une ligne par client (clé = email du compte). Synchronisée par les webhooks
// Stripe. `reminderSentAt` garantit qu'on n'envoie le rappel J-3 qu'une fois.
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  planId: text("plan_id"), // "starter" | "solo" | "pro" | "studio"
  // trialing | active | past_due | canceled | incomplete | unpaid
  status: text("status").default("incomplete").notNull(),
  trialEndsAt: timestamp("trial_ends_at"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false).notNull(),
  // horodatage de l'email de rappel J-3 (anti-doublon)
  reminderSentAt: timestamp("reminder_sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;

export type Business = typeof businesses.$inferSelect;
export type NewBusiness = typeof businesses.$inferInsert;
export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
export type PendingResponse = typeof pendingResponses.$inferSelect;
export type NewPendingResponse = typeof pendingResponses.$inferInsert;
export type WheelConfig = typeof wheelConfigs.$inferSelect;
export type NewWheelConfig = typeof wheelConfigs.$inferInsert;
export type WheelSpin = typeof wheelSpins.$inferSelect;
export type NewWheelSpin = typeof wheelSpins.$inferInsert;
