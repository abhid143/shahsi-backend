-- AlterTable
ALTER TABLE "BridalPartyMember" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "preference" TEXT,
ADD COLUMN     "size" TEXT;
