import {
  boolean,
  date,
  integer,
  pgEnum,
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
  type: varchar("type", { length: 32 }).notNull(), // тип квитка: weekday, weekend, student-weekend, etc.
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

export const exhibition_status = pgEnum("exhibition_status", [
  "draft",
  "published",
  "archived",
]);

export const exhibitions = pgTable("exhibitions", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 150 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  emoji: varchar("emoji", { length: 16 }).notNull(), // короткий emoji код/символ
  banner_color: varchar("banner_color", { length: 32 })
    .notNull()
    .default("green"), // колір банера green, yellow, blue, red, violet
  short_description: text("short_description").notNull(),
  content_md: text("content_md").notNull(),
  start_date: date("start_date"), // optional (nullable) => постійна експозиція
  end_date: date("end_date"),
  status: exhibition_status("status").default("draft").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const meme_status = pgEnum("meme_status", [
  "draft",
  "published",
  "archived",
  "deprecated",
]);

// базова таблиця мемів
export const memes = pgTable("memes", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 180 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  short_description: text("short_description").notNull(),
  explanation: text("explanation").notNull(),
  status: meme_status("status").notNull().default("draft"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// розширений опис, походження, авторство
export const meme_details = pgTable("meme_details", {
  meme_id: integer("meme_id").primaryKey(), // 1:1 via PK = FK pattern
  origin_year: integer("origin_year"),
  first_seen_date: date("first_seen_date"),
  origin_platform: varchar("origin_platform", { length: 120 }),
  origin_url: varchar("origin_url", { length: 500 }),
  origin_country: varchar("origin_country", { length: 80 }),
  language: varchar("language", { length: 16 }),
  creator_name: varchar("creator_name", { length: 255 }),
  creator_contact: varchar("creator_contact", { length: 255 }),
  license: varchar("license", { length: 64 }),
  attribution_required: boolean("attribution_required")
    .notNull()
    .default(false),
});

// модерація мемів
export const meme_moderation = pgTable("meme_moderation", {
  meme_id: integer("meme_id").primaryKey(),
  nsfw: boolean("nsfw").notNull().default(false),
  sensitive: boolean("sensitive").notNull().default(false),
  verified: boolean("verified").notNull().default(false),
  locked: boolean("locked").notNull().default(false),
  review_notes: text("review_notes"),
});

// медіа
export const meme_media_type = pgEnum("meme_media_type", [
  "image",
  "video",
  "other",
]);
export const meme_media = pgTable("meme_media", {
  id: serial("id").primaryKey(),
  meme_id: integer("meme_id").notNull(),
  type: meme_media_type("type").notNull().default("image"),
  url: varchar("url", { length: 600 }).notNull(),
  width: integer("width"),
  height: integer("height"),
  alt_text: varchar("alt_text", { length: 500 }),
  attribution: varchar("attribution", { length: 255 }),
  is_primary: boolean("is_primary").notNull().default(false),
  order_index: integer("order_index").default(0),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// альт заголовки
export const meme_alt_titles = pgTable("meme_alt_titles", {
  id: serial("id").primaryKey(),
  meme_id: integer("meme_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
});

// теги
export const meme_tags = pgTable("meme_tags", {
  meme_id: integer("meme_id").notNull(),
  tag: varchar("tag", { length: 64 }).notNull(),
});

// категорії
export const meme_categories = pgTable("meme_categories", {
  meme_id: integer("meme_id").notNull(),
  category: varchar("category", { length: 64 }).notNull(),
});

// формати мемів (фото, відео, анімації)
export const meme_formats = pgTable("meme_formats", {
  meme_id: integer("meme_id").notNull(),
  format: varchar("format", { length: 64 }).notNull(),
});
