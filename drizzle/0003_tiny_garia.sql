DROP TABLE "ticket_guests" CASCADE;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "purchase_id" integer;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "is_owner" integer DEFAULT 0 NOT NULL;