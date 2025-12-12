-- CreateTable for DiscountSettings
CREATE TABLE IF NOT EXISTS "DiscountSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "discountPercentage" DOUBLE PRECISION NOT NULL DEFAULT 30.0,
    "minimumPrice" DOUBLE PRECISION NOT NULL DEFAULT 4.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiscountSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "DiscountSettings_userId_key" ON "DiscountSettings"("userId");

-- AddForeignKey (only if User table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'User') THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'DiscountSettings_userId_fkey'
        ) THEN
            ALTER TABLE "DiscountSettings" 
            ADD CONSTRAINT "DiscountSettings_userId_fkey" 
            FOREIGN KEY ("userId") REFERENCES "User"("id") 
            ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
    END IF;
END $$;
