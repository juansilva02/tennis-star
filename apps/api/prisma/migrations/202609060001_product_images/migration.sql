ALTER TABLE "Product" DROP COLUMN "imagePublicId";

CREATE TABLE "product_images" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "altText" TEXT,
  "isPrimary" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
);

INSERT INTO "product_images" ("id", "productId", "url", "altText", "isPrimary")
SELECT "id" || '-legacy-image', "id", "imageUrl", "name", true
FROM "Product"
WHERE "imageUrl" IS NOT NULL;

CREATE INDEX "product_images_productId_isPrimary_idx"
ON "product_images"("productId", "isPrimary");

ALTER TABLE "product_images"
ADD CONSTRAINT "product_images_productId_fkey"
FOREIGN KEY ("productId") REFERENCES "Product"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
