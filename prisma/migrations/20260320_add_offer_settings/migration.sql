-- CreateTable for OfferSettings
CREATE TABLE IF NOT EXISTS "OfferSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "allowOffers" BOOLEAN NOT NULL DEFAULT false,
    "minimumOfferAmount" DOUBLE PRECISION NOT NULL DEFAULT 10.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OfferSettings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "OfferSettings_userId_key" ON "OfferSettings"("userId");

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'User') THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'OfferSettings_userId_fkey'
        ) THEN
            ALTER TABLE "OfferSettings"
            ADD CONSTRAINT "OfferSettings_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "User"("id")
            ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
    END IF;
END $$;

