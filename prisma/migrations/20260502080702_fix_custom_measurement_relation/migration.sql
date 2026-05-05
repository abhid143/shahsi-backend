-- CreateTable
CREATE TABLE "CustomMeasurement" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "bust" DOUBLE PRECISION,
    "waist" DOUBLE PRECISION,
    "hips" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "hollowToFloor" DOUBLE PRECISION,
    "extraLength" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomMeasurement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomMeasurement_orderId_key" ON "CustomMeasurement"("orderId");

-- AddForeignKey
ALTER TABLE "CustomMeasurement" ADD CONSTRAINT "CustomMeasurement_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
