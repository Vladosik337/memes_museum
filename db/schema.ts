import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  first_name: varchar({ length: 100 }).notNull(),
  last_name: varchar({ length: 100 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password_hash: varchar({ length: 255 }), // для password-based
  role: varchar({ length: 50 }).notNull(), // 'admin' або 'user'
  oidc_sub: varchar({ length: 255 }), // для OpenID Connect
  created_at: timestamp({ mode: "date" }).defaultNow().notNull(),
  updated_at: timestamp({ mode: "date" }).defaultNow().notNull(),
});
