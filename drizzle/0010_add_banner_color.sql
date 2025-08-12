-- Add banner_color column to exhibitions to match application schema
ALTER TABLE "exhibitions"
  ADD COLUMN IF NOT EXISTS "banner_color" varchar(32) NOT NULL DEFAULT 'green';

-- (Optional) If you want to backfill NULLs just in case (should not be needed due to NOT NULL + DEFAULT)
UPDATE "exhibitions" SET "banner_color" = 'green' WHERE "banner_color" IS NULL;
