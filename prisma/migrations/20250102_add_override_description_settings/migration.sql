-- CreateTable for OverrideDescriptionSettings
CREATE TABLE IF NOT EXISTS "OverrideDescriptionSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "useOverrideDescription" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OverrideDescriptionSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "OverrideDescriptionSettings_userId_key" ON "OverrideDescriptionSettings"("userId");

-- AddForeignKey (only if User table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'User') THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'OverrideDescriptionSettings_userId_fkey'
        ) THEN
            ALTER TABLE "OverrideDescriptionSettings" 
            ADD CONSTRAINT "OverrideDescriptionSettings_userId_fkey" 
            FOREIGN KEY ("userId") REFERENCES "User"("id") 
            ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
    END IF;
END $$;

