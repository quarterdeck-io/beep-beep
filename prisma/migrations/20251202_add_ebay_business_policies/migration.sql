-- CreateTable for EbayBusinessPolicies only (safe migration)
CREATE TABLE IF NOT EXISTS "EbayBusinessPolicies" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "paymentPolicyId" TEXT,
    "paymentPolicyName" TEXT,
    "returnPolicyId" TEXT,
    "returnPolicyName" TEXT,
    "fulfillmentPolicyId" TEXT,
    "fulfillmentPolicyName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EbayBusinessPolicies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "EbayBusinessPolicies_userId_key" ON "EbayBusinessPolicies"("userId");

-- AddForeignKey (only if User table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'User') THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'EbayBusinessPolicies_userId_fkey'
        ) THEN
            ALTER TABLE "EbayBusinessPolicies" 
            ADD CONSTRAINT "EbayBusinessPolicies_userId_fkey" 
            FOREIGN KEY ("userId") REFERENCES "User"("id") 
            ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
    END IF;
END $$;

