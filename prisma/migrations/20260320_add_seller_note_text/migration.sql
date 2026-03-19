-- Add universal seller note text field
ALTER TABLE "SellerNoteSettings"
ADD COLUMN IF NOT EXISTS "sellerNoteText" TEXT;

