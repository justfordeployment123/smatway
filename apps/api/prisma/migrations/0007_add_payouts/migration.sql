-- Payouts: platform→transporter money transfers triggered on arrival.
-- One Payout per Booking. Tracks the commission split + Paystack transfer state.

-- 1. Enum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'PROCESSING', 'RELEASED', 'FAILED');

-- 2. Bank fields on User (transporter-only, but lives on User to keep one identity model)
ALTER TABLE "User"
    ADD COLUMN "bankCode" TEXT,
    ADD COLUMN "bankAccountNumber" TEXT,
    ADD COLUMN "bankAccountName" TEXT,
    ADD COLUMN "paystackRecipientCode" TEXT;

CREATE UNIQUE INDEX "User_paystackRecipientCode_key" ON "User"("paystackRecipientCode")
    WHERE "paystackRecipientCode" IS NOT NULL;

-- 3. Payout table
CREATE TABLE "Payout" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "transporterId" TEXT NOT NULL,
    "grossAmount" DECIMAL(10,2) NOT NULL,
    "commissionRate" DECIMAL(5,4) NOT NULL,
    "commissionAmount" DECIMAL(10,2) NOT NULL,
    "netAmount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "paystackRecipientCode" TEXT,
    "paystackTransferCode" TEXT,
    "paystackTransferReference" TEXT,
    "rawResponse" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "releasedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "failureReason" TEXT,

    CONSTRAINT "Payout_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Payout_bookingId_key" ON "Payout"("bookingId");
CREATE UNIQUE INDEX "Payout_paystackTransferReference_key" ON "Payout"("paystackTransferReference")
    WHERE "paystackTransferReference" IS NOT NULL;
CREATE INDEX "Payout_transporterId_idx" ON "Payout"("transporterId");
CREATE INDEX "Payout_status_idx" ON "Payout"("status");
CREATE INDEX "Payout_createdAt_idx" ON "Payout"("createdAt");

ALTER TABLE "Payout" ADD CONSTRAINT "Payout_bookingId_fkey"
    FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_transporterId_fkey"
    FOREIGN KEY ("transporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
