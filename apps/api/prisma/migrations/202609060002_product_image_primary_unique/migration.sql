CREATE UNIQUE INDEX "product_images_one_primary_per_product_idx"
ON "product_images"("productId") WHERE "isPrimary" = true;
