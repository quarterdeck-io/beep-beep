-- AlterTable - Add overrideDescription text field to OverrideDescriptionSettings
ALTER TABLE "OverrideDescriptionSettings" ADD COLUMN IF NOT EXISTS "overrideDescription" TEXT;


