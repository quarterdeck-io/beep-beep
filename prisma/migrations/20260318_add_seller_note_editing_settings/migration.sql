-- CreateTable for SellerNoteSettings
CREATE TABLE IF NOT EXISTS "SellerNoteSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "enableSellerNoteEditing" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SellerNoteSettings_pkey" PRIMARY KEY ("id")
);

-- Ensure unique per user
CREATE UNIQUE INDEX IF NOT EXISTS "SellerNoteSettings_userId_key" ON "SellerNoteSettings"("userId");

-- Add foreign key to User table (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'User') THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'SellerNoteSettings_userId_fkey'
        ) THEN
            ALTER TABLE "SellerNoteSettings"
            ADD CONSTRAINT "SellerNoteSettings_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "User"("id")
            ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
    END IF;
END $$;

