CREATE TYPE "ProductStatus" AS ENUM ('ACTIVE', 'DRAFT', 'INACTIVE');
CREATE TYPE "Gender" AS ENUM ('MEN', 'WOMEN', 'UNISEX', 'KIDS');
CREATE TYPE "SaleStatus" AS ENUM ('PENDING', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED');
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PAID', 'REFUNDED');
CREATE TYPE "PaymentMethod" AS ENUM ('CREDIT_CARD', 'DEBIT_CARD', 'CASH', 'BANK_TRANSFER');
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED');
CREATE TYPE "NotificationType" AS ENUM ('INFO', 'SUCCESS', 'WARNING', 'ORDER');

CREATE TABLE "User" (
  "id" TEXT NOT NULL, "name" TEXT NOT NULL, "email" TEXT NOT NULL, "passwordHash" TEXT NOT NULL,
  "avatarUrl" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Category" (
  "id" TEXT NOT NULL, "name" TEXT NOT NULL, "description" TEXT, "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Brand" (
  "id" TEXT NOT NULL, "name" TEXT NOT NULL, "description" TEXT, "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Product" (
  "id" TEXT NOT NULL, "sku" TEXT NOT NULL, "name" TEXT NOT NULL, "description" TEXT, "price" DECIMAL(12,2) NOT NULL,
  "gender" "Gender" NOT NULL DEFAULT 'UNISEX', "stock" INTEGER NOT NULL DEFAULT 0, "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE',
  "imageUrl" TEXT, "imagePublicId" TEXT, "categoryId" TEXT NOT NULL, "brandId" TEXT NOT NULL, "archivedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ProductOption" ("id" TEXT NOT NULL, "name" TEXT NOT NULL, "productId" TEXT NOT NULL, CONSTRAINT "ProductOption_pkey" PRIMARY KEY ("id"));
CREATE TABLE "ProductOptionValue" ("id" TEXT NOT NULL, "value" TEXT NOT NULL, "optionId" TEXT NOT NULL, CONSTRAINT "ProductOptionValue_pkey" PRIMARY KEY ("id"));
CREATE TABLE "Membership" (
  "id" TEXT NOT NULL, "name" TEXT NOT NULL, "description" TEXT, "price" DECIMAL(12,2) NOT NULL, "benefits" TEXT[], "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Membership_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Customer" (
  "id" TEXT NOT NULL, "name" TEXT NOT NULL, "email" TEXT NOT NULL, "phone" TEXT, "avatarUrl" TEXT, "address" TEXT, "city" TEXT,
  "postalCode" TEXT, "membershipId" TEXT, "archivedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "LoyaltyTransaction" (
  "id" TEXT NOT NULL, "customerId" TEXT NOT NULL, "points" INTEGER NOT NULL, "reason" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "LoyaltyTransaction_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Sale" (
  "id" TEXT NOT NULL, "orderNumber" TEXT NOT NULL, "customerId" TEXT NOT NULL, "status" "SaleStatus" NOT NULL DEFAULT 'PENDING',
  "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID', "paymentMethod" "PaymentMethod" NOT NULL, "total" DECIMAL(12,2) NOT NULL,
  "shippingAddress" TEXT NOT NULL, "trackingId" TEXT, "notes" TEXT, "hiddenAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "SaleItem" (
  "id" TEXT NOT NULL, "saleId" TEXT NOT NULL, "productId" TEXT, "productName" TEXT NOT NULL, "sku" TEXT NOT NULL,
  "unitPrice" DECIMAL(12,2) NOT NULL, "quantity" INTEGER NOT NULL, "subtotal" DECIMAL(12,2) NOT NULL,
  CONSTRAINT "SaleItem_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "SaleStatusHistory" (
  "id" TEXT NOT NULL, "saleId" TEXT NOT NULL, "from" "SaleStatus", "to" "SaleStatus" NOT NULL, "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "SaleStatusHistory_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Discount" (
  "id" TEXT NOT NULL, "name" TEXT NOT NULL, "code" TEXT NOT NULL, "type" "DiscountType" NOT NULL, "value" DECIMAL(12,2) NOT NULL,
  "startsAt" TIMESTAMP(3), "endsAt" TIMESTAMP(3), "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Discount_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Notification" (
  "id" TEXT NOT NULL, "title" TEXT NOT NULL, "message" TEXT NOT NULL, "type" "NotificationType" NOT NULL DEFAULT 'INFO',
  "readAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "StoreSettings" (
  "id" TEXT NOT NULL DEFAULT 'default', "storeName" TEXT NOT NULL DEFAULT 'Tennis Star', "supportEmail" TEXT NOT NULL,
  "phone" TEXT, "address" TEXT, "orderPrefix" TEXT NOT NULL DEFAULT 'TS', "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StoreSettings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");
CREATE UNIQUE INDEX "Brand_name_key" ON "Brand"("name");
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");
CREATE INDEX "Product_name_idx" ON "Product"("name");
CREATE INDEX "Product_categoryId_brandId_status_idx" ON "Product"("categoryId", "brandId", "status");
CREATE UNIQUE INDEX "Membership_name_key" ON "Membership"("name");
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");
CREATE UNIQUE INDEX "Sale_orderNumber_key" ON "Sale"("orderNumber");
CREATE INDEX "Sale_status_createdAt_idx" ON "Sale"("status", "createdAt");
CREATE UNIQUE INDEX "Discount_code_key" ON "Discount"("code");

ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Product" ADD CONSTRAINT "Product_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProductOption" ADD CONSTRAINT "ProductOption_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductOptionValue" ADD CONSTRAINT "ProductOptionValue_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "ProductOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "LoyaltyTransaction" ADD CONSTRAINT "LoyaltyTransaction_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SaleItem" ADD CONSTRAINT "SaleItem_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SaleItem" ADD CONSTRAINT "SaleItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SaleStatusHistory" ADD CONSTRAINT "SaleStatusHistory_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE CASCADE ON UPDATE CASCADE;
