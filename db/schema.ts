import {
  date,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  first_name: varchar({ length: 100 }).notNull(),
  last_name: varchar({ length: 100 }),
  email: varchar({ length: 255 }).notNull().unique(),
  password_hash: varchar({ length: 255 }), // для password-based
  role: varchar({ length: 50 }).notNull(), // 'admin' або 'user'
  oidc_sub: varchar({ length: 255 }), // для OpenID Connect
  created_at: timestamp({ mode: "date" }).defaultNow().notNull(),
  updated_at: timestamp({ mode: "date" }).defaultNow().notNull(),
});

export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(), // FK на users
  first_name: varchar("first_name", { length: 64 }).notNull(),
  last_name: varchar("last_name", { length: 64 }).notNull(),
  email: varchar("email", { length: 128 }).notNull(),
  visit_date: date("visit_date").notNull(),
  comment: text("comment"),
  qr_code: varchar("qr_code", { length: 128 }),
  status: varchar("status", { length: 32 }).default("active"),
  created_at: timestamp("created_at").defaultNow(),
});

export const ticket_guests = pgTable("ticket_guests", {
  id: serial("id").primaryKey(),
  ticket_id: integer("ticket_id").notNull(), // FK на tickets
  first_name: varchar("first_name", { length: 64 }).notNull(),
  last_name: varchar("last_name", { length: 64 }).notNull(),
});

export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(), // FK на users
  purchase_date: date("purchase_date").notNull(),
  total_amount: integer("total_amount").notNull(),
  status: varchar("status", { length: 32 }).default("completed"),
  created_at: timestamp("created_at").defaultNow(),
});
