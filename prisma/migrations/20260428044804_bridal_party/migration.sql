-- CreateTable
CREATE TABLE "BridalPartyEvent" (
    "id" TEXT NOT NULL,
    "organizerUserId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BridalPartyEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BridalPartyMember" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'invited',

    CONSTRAINT "BridalPartyMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BridalPartySelection" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'selected',

    CONSTRAINT "BridalPartySelection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BridalPartyPayment" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',

    CONSTRAINT "BridalPartyPayment_pkey" PRIMARY KEY ("id")
);
