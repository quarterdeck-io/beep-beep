-- Migration: Change discount from percentage to USD amount
-- Rename discountPercentage to discountAmount and update default value

-- Step 1: Add new column with default value
ALTER TABLE "DiscountSettings" ADD COLUMN IF NOT EXISTS "discountAmount" DOUBLE PRECISION DEFAULT 3.0;

-- Step 2: Migrate existing data - convert percentage to a reasonable USD amount
-- For users who had 30% discount, we'll set $3 as default
-- This is a one-way migration since percentage and USD are different concepts
UPDATE "DiscountSettings" SET "discountAmount" = 3.0 WHERE "discountAmount" IS NULL;

-- Step 3: Make the column NOT NULL
ALTER TABLE "DiscountSettings" ALTER COLUMN "discountAmount" SET NOT NULL;

-- Step 4: Drop the old percentage column
ALTER TABLE "DiscountSettings" DROP COLUMN IF EXISTS "discountPercentage";
