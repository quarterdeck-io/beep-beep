-- CreateTable
CREATE TABLE "SkuSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nextSkuCounter" INTEGER NOT NULL DEFAULT 1,
    "skuPrefix" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SkuSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SkuSettings_userId_key" ON "SkuSettings"("userId");

-- AddForeignKey
ALTER TABLE "SkuSettings" ADD CONSTRAINT "SkuSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
