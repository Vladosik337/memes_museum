import {
  boolean,
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
  purchase_id: integer("purchase_id"), // FK на purchases
  first_name: varchar("first_name", { length: 64 }).notNull(),
  last_name: varchar("last_name", { length: 64 }).notNull(),
  email: varchar("email", { length: 128 }).notNull(),
  visit_date: date("visit_date").notNull(),
  comment: text("comment"),
  number: varchar("number", { length: 32 }).notNull().unique(), // унікальний номер квитка
  qr_code: varchar("qr_code", { length: 128 }),
  status: varchar("status", { length: 32 }).default("active"), // active, cancelled, used, etc.
  isOwner: boolean("is_owner").default(false).notNull(), // чи це квиток замовника
  created_at: timestamp("created_at").defaultNow(),
});

// export const ticket_guests = pgTable("ticket_guests", {
//   id: serial("id").primaryKey(),
//   ticket_id: integer("ticket_id").notNull(), // FK на tickets
//   first_name: varchar("first_name", { length: 64 }).notNull(),
//   last_name: varchar("last_name", { length: 64 }).notNull(),
// });

export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(), // FK на users
  purchase_date: date("purchase_date").notNull(),
  total_amount: integer("total_amount").notNull(),
  status: varchar("status", { length: 32 }).default("completed"),
  created_at: timestamp("created_at").defaultNow(),
});

export const ticket_prices = pgTable("ticket_prices", {
  id: serial("id").primaryKey(),
  price: integer("price").notNull(), // ціна у копійках (або гривнях)
  valid_from: date("valid_from").notNull(),
  valid_to: date("valid_to"), // nullable: якщо null — ціна діє безстроково
  type: varchar("type", { length: 32 }).notNull(), // тип квитка: standard, student, child, vip тощо
  description: varchar("description", { length: 128 }),
  is_active: boolean("is_active").default(true).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(), // FK на users
  text: text("text").notNull(),
  allow_publish: boolean("allow_publish").default(false).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});
