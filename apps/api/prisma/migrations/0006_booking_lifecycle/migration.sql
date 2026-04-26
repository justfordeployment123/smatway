-- Booking lifecycle: pickup verification + arrival confirmation
-- Adds the IN_PROGRESS status (between CONFIRMED and COMPLETED) for trips
-- that have started but not finished, plus the verification code traveler
-- shows the transporter at pickup, and the timestamps for each transition.

-- 1. Extend BookingStatus enum
ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'IN_PROGRESS' BEFORE 'CANCELLED';

-- 2. Add new columns to Booking
ALTER TABLE "Booking"
    ADD COLUMN "verificationCode" TEXT,
    ADD COLUMN "pickupVerifiedAt" TIMESTAMP(3),
    ADD COLUMN "arrivalConfirmedAt" TIMESTAMP(3);

-- Unique index on verificationCode (only meaningful for non-null values).
CREATE UNIQUE INDEX "Booking_verificationCode_key" ON "Booking"("verificationCode")
    WHERE "verificationCode" IS NOT NULL;
