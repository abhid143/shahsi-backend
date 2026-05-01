/*
  Warnings:

  - Added the required column `chest` to the `ProductVariant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fitType` to the `ProductVariant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `length` to the `ProductVariant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `waist` to the `ProductVariant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "chest" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "fitType" TEXT NOT NULL,
ADD COLUMN     "length" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "waist" DOUBLE PRECISION NOT NULL;

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "height" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION,
    "chest" DOUBLE PRECISION,
    "waist" DOUBLE PRECISION,
    "bodyType" TEXT,
    "fitPreference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");
