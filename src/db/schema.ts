import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  serial,
  json,
} from "drizzle-orm/pg-core";

export const businesses = pgTable("businesses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  platform: text("platform", { enum: ["google", "trustpilot"] }).notNull(),
  platformId: text("platform_id").notNull(),
  platformToken: text("platform_token").notNull(),
  autoReply5Star: boolean("auto_reply_5_star").default(true).notNull(),
  ownerEmail: text("owner_email").notNull(),
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
  platform: text("platform", { enum: ["google", "trustpilot"] }).notNull(),
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

export type Business = typeof businesses.$inferSelect;
export type NewBusiness = typeof businesses.$inferInsert;
export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
export type PendingResponse = typeof pendingResponses.$inferSelect;
export type NewPendingResponse = typeof pendingResponses.$inferInsert;
