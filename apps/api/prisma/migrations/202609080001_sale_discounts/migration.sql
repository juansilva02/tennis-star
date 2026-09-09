ALTER TABLE "Sale"
ADD COLUMN "subtotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN "discountId" TEXT,
ADD COLUMN "discountCode" TEXT,
ADD COLUMN "discountAmount" DECIMAL(12,2) NOT NULL DEFAULT 0;

UPDATE "Sale" SET "subtotal" = "total";

CREATE INDEX "Sale_discountId_idx" ON "Sale"("discountId");

ALTER TABLE "Sale"
ADD CONSTRAINT "Sale_discountId_fkey"
FOREIGN KEY ("discountId") REFERENCES "Discount"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
