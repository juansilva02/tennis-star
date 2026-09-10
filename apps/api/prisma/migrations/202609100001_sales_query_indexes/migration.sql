CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX "Product_archivedAt_status_id_idx" ON "Product"("archivedAt", "status", "id");
CREATE INDEX "Customer_archivedAt_id_idx" ON "Customer"("archivedAt", "id");
CREATE INDEX "Customer_membershipId_idx" ON "Customer"("membershipId");
CREATE INDEX "Sale_hiddenAt_createdAt_id_idx" ON "Sale"("hiddenAt", "createdAt", "id");
CREATE INDEX "Sale_createdAt_idx" ON "Sale"("createdAt");
CREATE INDEX "Sale_customerId_idx" ON "Sale"("customerId");
CREATE INDEX "SaleItem_saleId_idx" ON "SaleItem"("saleId");
CREATE INDEX "SaleItem_productId_idx" ON "SaleItem"("productId");
CREATE INDEX "SaleStatusHistory_saleId_createdAt_idx" ON "SaleStatusHistory"("saleId", "createdAt");
CREATE INDEX "LoyaltyTransaction_customerId_createdAt_idx" ON "LoyaltyTransaction"("customerId", "createdAt");
CREATE INDEX "ProductOption_productId_idx" ON "ProductOption"("productId");
CREATE INDEX "ProductOptionValue_optionId_idx" ON "ProductOptionValue"("optionId");

-- ILIKE '%term%' searches require trigram indexes rather than B-tree name indexes.
CREATE INDEX "Product_name_trgm_idx" ON "Product" USING GIN ("name" gin_trgm_ops);
CREATE INDEX "Product_sku_trgm_idx" ON "Product" USING GIN ("sku" gin_trgm_ops);
CREATE INDEX "Customer_name_trgm_idx" ON "Customer" USING GIN ("name" gin_trgm_ops);
CREATE INDEX "Customer_email_trgm_idx" ON "Customer" USING GIN ("email" gin_trgm_ops);
CREATE INDEX "Customer_address_trgm_idx" ON "Customer" USING GIN ("address" gin_trgm_ops);
CREATE INDEX "Customer_city_trgm_idx" ON "Customer" USING GIN ("city" gin_trgm_ops);
CREATE INDEX "Customer_postalCode_trgm_idx" ON "Customer" USING GIN ("postalCode" gin_trgm_ops);
CREATE INDEX "Sale_orderNumber_trgm_idx" ON "Sale" USING GIN ("orderNumber" gin_trgm_ops);
