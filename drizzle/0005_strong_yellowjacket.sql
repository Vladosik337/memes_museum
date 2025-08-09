ALTER TABLE "ticket_prices" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "ticket_prices" DROP COLUMN "is_owner";