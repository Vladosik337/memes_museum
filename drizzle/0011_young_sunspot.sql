CREATE TYPE "public"."meme_media_type" AS ENUM('image', 'video', 'other');--> statement-breakpoint
CREATE TYPE "public"."meme_status" AS ENUM('draft', 'published', 'archived', 'deprecated');--> statement-breakpoint
CREATE TABLE "meme_alt_titles" (
	"id" serial PRIMARY KEY NOT NULL,
	"meme_id" integer NOT NULL,
	"title" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meme_categories" (
	"meme_id" integer NOT NULL,
	"category" varchar(64) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meme_details" (
	"meme_id" integer PRIMARY KEY NOT NULL,
	"origin_year" integer,
	"first_seen_date" date,
	"origin_platform" varchar(120),
	"origin_url" varchar(500),
	"origin_country" varchar(80),
	"language" varchar(16),
	"creator_name" varchar(255),
	"creator_contact" varchar(255),
	"license" varchar(64),
	"attribution_required" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meme_formats" (
	"meme_id" integer NOT NULL,
	"format" varchar(64) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meme_media" (
	"id" serial PRIMARY KEY NOT NULL,
	"meme_id" integer NOT NULL,
	"type" "meme_media_type" DEFAULT 'image' NOT NULL,
	"url" varchar(600) NOT NULL,
	"width" integer,
	"height" integer,
	"alt_text" varchar(500),
	"attribution" varchar(255),
	"is_primary" boolean DEFAULT false NOT NULL,
	"order_index" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meme_moderation" (
	"meme_id" integer PRIMARY KEY NOT NULL,
	"nsfw" boolean DEFAULT false NOT NULL,
	"sensitive" boolean DEFAULT false NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"locked" boolean DEFAULT false NOT NULL,
	"review_notes" text
);
--> statement-breakpoint
CREATE TABLE "meme_tags" (
	"meme_id" integer NOT NULL,
	"tag" varchar(64) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "memes" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(180) NOT NULL,
	"title" varchar(255) NOT NULL,
	"short_description" text NOT NULL,
	"explanation" text NOT NULL,
	"status" "meme_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "memes_slug_unique" UNIQUE("slug")
);
