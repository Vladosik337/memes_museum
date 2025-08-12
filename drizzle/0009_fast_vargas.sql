CREATE TYPE "public"."exhibition_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TABLE "exhibitions" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(150) NOT NULL,
	"title" varchar(255) NOT NULL,
	"emoji" varchar(16) NOT NULL,
	"short_description" text NOT NULL,
	"content_md" text NOT NULL,
	"start_date" date,
	"end_date" date,
	"status" "exhibition_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "exhibitions_slug_unique" UNIQUE("slug")
);
