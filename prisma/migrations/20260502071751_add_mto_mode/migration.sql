-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "mode" TEXT NOT NULL DEFAULT 'retail';

-- AlterTable
ALTER TABLE "Shipment" ALTER COLUMN "eventId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "FitFeedback" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "issueArea" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FitFeedback_pkey" PRIMARY KEY ("id")
);
