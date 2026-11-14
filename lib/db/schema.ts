import {
  pgTable,
  pgEnum,
  text,
  timestamp,
  boolean,
  integer,
  decimal,
  uuid,
  doublePrecision,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const roleEnum = pgEnum("role", ["BUYER", "ORGANIZER", "STAFF", "ADMIN"]);

export const eventStatusEnum = pgEnum("event_status", [
  "DRAFT",
  "PUBLISHED",
  "SOLD_OUT",
  "FINISHED",
]);

export const eventCategoryEnum = pgEnum("event_category", [
  "MUSIC",
  "THEATER",
  "SPORTS",
  "WORKSHOP",
  "PARTY",
  "OTHER",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "PENDING",
  "PAID",
  "CANCELLED",
  "REFUNDED",
]);

export const ticketStatusEnum = pgEnum("ticket_status", [
  "ACTIVE",
  "USED",
  "CANCELLED",
  "TRANSFERRED",
]);

export const refundStatusEnum = pgEnum("refund_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
]);

// ─── Tablas ───────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified"),
  image: text("image"),
  role: roleEnum("role").notNull().default("BUYER"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Tabla requerida por NextAuth v5 con Drizzle Adapter
// El DrizzleAdapter de NextAuth v5 requiere estos nombres de columna exactos
export const accounts = pgTable("accounts", {
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("providerAccountId").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
});

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires").notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires").notNull(),
});

export const organizers = pgTable("organizers", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  orgName: text("org_name").notNull(),
  ruc: text("ruc"),
  bankAccount: text("bank_account"),
  verified: boolean("verified").notNull().default(false),
  logoUrl: text("logo_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizerId: uuid("organizer_id")
    .notNull()
    .references(() => organizers.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  coverUrl: text("cover_url"),
  venueName: text("venue_name").notNull(),
  venueAddress: text("venue_address").notNull(),
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
  startsAt: timestamp("starts_at").notNull(),
  endsAt: timestamp("ends_at"),
  status: eventStatusEnum("status").notNull().default("DRAFT"),
  category: eventCategoryEnum("category").notNull().default("OTHER"),
  isFeatured: boolean("is_featured").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const ticketTypes = pgTable("ticket_types", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // General, VIP, Mesa, etc.
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("PEN"),
  totalQuantity: integer("total_quantity").notNull(),
  soldQuantity: integer("sold_quantity").notNull().default(0),
  saleStartsAt: timestamp("sale_starts_at"),
  saleEndsAt: timestamp("sale_ends_at"),
});

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  buyerId: uuid("buyer_id")
    .notNull()
    .references(() => users.id),
  eventId: uuid("event_id")
    .notNull()
    .references(() => events.id),
  status: orderStatusEnum("status").notNull().default("PENDING"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  paymentIntentId: text("payment_intent_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const tickets = pgTable("tickets", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id),
  ticketTypeId: uuid("ticket_type_id")
    .notNull()
    .references(() => ticketTypes.id),
  eventId: uuid("event_id")
    .notNull()
    .references(() => events.id),
  buyerId: uuid("buyer_id")
    .notNull()
    .references(() => users.id),
  qrCode: text("qr_code").notNull().unique(), // hash único encriptado
  qrUrl: text("qr_url"), // imagen QR guardada en Vercel Blob
  status: ticketStatusEnum("status").notNull().default("ACTIVE"),
  checkedInAt: timestamp("checked_in_at"),
  checkedInBy: uuid("checked_in_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const ticketTransfers = pgTable("ticket_transfers", {
  id: uuid("id").primaryKey().defaultRandom(),
  ticketId: uuid("ticket_id")
    .notNull()
    .references(() => tickets.id),
  fromUserId: uuid("from_user_id")
    .notNull()
    .references(() => users.id),
  toUserId: uuid("to_user_id").references(() => users.id),
  token: text("token").notNull().unique(), // token único de transferencia
  expiresAt: timestamp("expires_at").notNull(),
  acceptedAt: timestamp("accepted_at"),
});

export const refunds = pgTable("refunds", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  reason: text("reason"),
  status: refundStatusEnum("status").notNull().default("PENDING"),
  requestedAt: timestamp("requested_at").notNull().defaultNow(),
  processedAt: timestamp("processed_at"),
});

// ─── Relations ────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ one, many }) => ({
  organizer: one(organizers, {
    fields: [users.id],
    references: [organizers.userId],
  }),
  orders: many(orders),
  tickets: many(tickets),
}));

export const organizersRelations = relations(organizers, ({ one, many }) => ({
  user: one(users, { fields: [organizers.userId], references: [users.id] }),
  events: many(events),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  organizer: one(organizers, {
    fields: [events.organizerId],
    references: [organizers.id],
  }),
  ticketTypes: many(ticketTypes),
  orders: many(orders),
  tickets: many(tickets),
}));

export const ticketTypesRelations = relations(ticketTypes, ({ one, many }) => ({
  event: one(events, { fields: [ticketTypes.eventId], references: [events.id] }),
  tickets: many(tickets),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  buyer: one(users, { fields: [orders.buyerId], references: [users.id] }),
  event: one(events, { fields: [orders.eventId], references: [events.id] }),
  tickets: many(tickets),
  refund: one(refunds, { fields: [orders.id], references: [refunds.orderId] }),
}));

export const ticketsRelations = relations(tickets, ({ one }) => ({
  order: one(orders, { fields: [tickets.orderId], references: [orders.id] }),
  ticketType: one(ticketTypes, {
    fields: [tickets.ticketTypeId],
    references: [ticketTypes.id],
  }),
  event: one(events, { fields: [tickets.eventId], references: [events.id] }),
  buyer: one(users, { fields: [tickets.buyerId], references: [users.id] }),
  transfer: one(ticketTransfers, {
    fields: [tickets.id],
    references: [ticketTransfers.ticketId],
  }),
}));
