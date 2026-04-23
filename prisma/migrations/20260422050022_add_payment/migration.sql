-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "paymentId" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING';
