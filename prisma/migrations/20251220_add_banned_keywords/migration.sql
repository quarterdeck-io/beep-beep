-- CreateTable for BannedKeyword
CREATE TABLE IF NOT EXISTS "BannedKeyword" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BannedKeyword_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "BannedKeyword_userId_keyword_key" ON "BannedKeyword"("userId", "keyword");
CREATE INDEX IF NOT EXISTS "BannedKeyword_userId_idx" ON "BannedKeyword"("userId");

-- AddForeignKey (only if User table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'User') THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'BannedKeyword_userId_fkey'
        ) THEN
            ALTER TABLE "BannedKeyword" 
            ADD CONSTRAINT "BannedKeyword_userId_fkey" 
            FOREIGN KEY ("userId") REFERENCES "User"("id") 
            ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
    END IF;
END $$;
