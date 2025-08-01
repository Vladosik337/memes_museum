CREATE TABLE "purchases" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"purchase_date" date NOT NULL,
	"total_amount" integer NOT NULL,
	"status" varchar(32) DEFAULT 'completed',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ticket_guests" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticket_id" integer NOT NULL,
	"first_name" varchar(64) NOT NULL,
	"last_name" varchar(64) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"first_name" varchar(64) NOT NULL,
	"last_name" varchar(64) NOT NULL,
	"email" varchar(128) NOT NULL,
	"visit_date" date NOT NULL,
	"comment" text,
	"qr_code" varchar(128),
	"status" varchar(32) DEFAULT 'active',
	"created_at" timestamp DEFAULT now()
);
