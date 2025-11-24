-- CreateTable
CREATE TABLE "DraftListing" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "imageUrl" TEXT,
    "categoryId" TEXT,
    "upc" TEXT,
    "productData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DraftListing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DraftListing_userId_idx" ON "DraftListing"("userId");

-- AddForeignKey
ALTER TABLE "DraftListing" ADD CONSTRAINT "DraftListing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
