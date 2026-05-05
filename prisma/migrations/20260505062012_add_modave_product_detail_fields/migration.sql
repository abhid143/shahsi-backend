-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "availabilityLabel" TEXT,
ADD COLUMN     "availabilityStatus" TEXT NOT NULL DEFAULT 'in_stock',
ADD COLUMN     "careInstructions" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "categories" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "compareAtPrice" DOUBLE PRECISION,
ADD COLUMN     "discountPercent" INTEGER,
ADD COLUMN     "estimatedDomestic" TEXT,
ADD COLUMN     "estimatedInternational" TEXT,
ADD COLUMN     "isFinalSale" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lowStockThreshold" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "paymentMethods" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "pickupAvailable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pickupReadyIn" TEXT,
ADD COLUMN     "rating" DOUBLE PRECISION,
ADD COLUMN     "returnText" TEXT,
ADD COLUMN     "returnWindowDays" INTEGER,
ADD COLUMN     "review1Count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "review2Count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "review3Count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "review4Count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "review5Count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "reviewCount" INTEGER,
ADD COLUMN     "reviewsAverage" DOUBLE PRECISION,
ADD COLUMN     "reviewsTotal" INTEGER,
ADD COLUMN     "shortDescription" TEXT,
ADD COLUMN     "sizeGuideUnit" TEXT NOT NULL DEFAULT 'inches',
ADD COLUMN     "soldHoursWindow" INTEGER,
ADD COLUMN     "soldInLastHours" INTEGER,
ADD COLUMN     "storeAddress" TEXT,
ADD COLUMN     "storeLocation" TEXT,
ADD COLUMN     "storeName" TEXT,
ADD COLUMN     "storePickupAvailable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tabCompositionCare" TEXT,
ADD COLUMN     "tabDescription" TEXT,
ADD COLUMN     "tabReturnPolicies" TEXT,
ADD COLUMN     "tabShippingReturns" TEXT,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "vendor" TEXT,
ADD COLUMN     "viewingNow" INTEGER;

-- AlterTable
ALTER TABLE "ProductImage" ADD COLUMN     "colorName" TEXT,
ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "color" TEXT,
ADD COLUMN     "isAvailable" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "ProductColor" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hex" TEXT,
    "imageUrl" TEXT,
    "isSelected" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductColor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductReview" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "title" TEXT,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "author" TEXT,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductRelatedProduct" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "relatedProductId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductRelatedProduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductColor_productId_idx" ON "ProductColor"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductColor_productId_name_key" ON "ProductColor"("productId", "name");

-- CreateIndex
CREATE INDEX "ProductReview_productId_idx" ON "ProductReview"("productId");

-- CreateIndex
CREATE INDEX "ProductReview_rating_idx" ON "ProductReview"("rating");

-- CreateIndex
CREATE INDEX "ProductRelatedProduct_productId_idx" ON "ProductRelatedProduct"("productId");

-- CreateIndex
CREATE INDEX "ProductRelatedProduct_relatedProductId_idx" ON "ProductRelatedProduct"("relatedProductId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductRelatedProduct_productId_relatedProductId_key" ON "ProductRelatedProduct"("productId", "relatedProductId");

-- CreateIndex
CREATE INDEX "ProductImage_productId_idx" ON "ProductImage"("productId");

-- CreateIndex
CREATE INDEX "ProductImage_position_idx" ON "ProductImage"("position");

-- CreateIndex
CREATE INDEX "ProductVariant_productId_idx" ON "ProductVariant"("productId");

-- CreateIndex
CREATE INDEX "ProductVariant_color_idx" ON "ProductVariant"("color");

-- CreateIndex
CREATE INDEX "ProductVariant_size_idx" ON "ProductVariant"("size");

-- AddForeignKey
ALTER TABLE "ProductColor" ADD CONSTRAINT "ProductColor_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductReview" ADD CONSTRAINT "ProductReview_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductRelatedProduct" ADD CONSTRAINT "ProductRelatedProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductRelatedProduct" ADD CONSTRAINT "ProductRelatedProduct_relatedProductId_fkey" FOREIGN KEY ("relatedProductId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
