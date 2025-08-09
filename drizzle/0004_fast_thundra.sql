CREATE TABLE "ticket_prices" (
	"id" serial PRIMARY KEY NOT NULL,
	"price" integer NOT NULL,
	"valid_from" date NOT NULL,
	"valid_to" date,
	"type" varchar(32) NOT NULL,
	"description" varchar(128),
	"is_owner" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tickets" ALTER COLUMN "is_owner" SET DATA TYPE boolean;