/*
  Warnings:

  - You are about to drop the column `variantId` on the `CartItem` table. All the data in the column will be lost.
  - You are about to drop the column `variantId` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `mode` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the `CustomMeasurement` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CustomMeasurement" DROP CONSTRAINT "CustomMeasurement_orderId_fkey";

-- AlterTable
ALTER TABLE "CartItem" DROP COLUMN "variantId";

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "variantId";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "mode";

-- DropTable
DROP TABLE "CustomMeasurement";
