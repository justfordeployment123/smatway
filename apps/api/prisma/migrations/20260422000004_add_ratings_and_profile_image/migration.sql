-- Add COMPLETED status to BookingStatus enum
ALTER TYPE "BookingStatus" ADD VALUE 'COMPLETED';

-- Add profileImageUrl to User
ALTER TABLE "User" ADD COLUMN "profileImageUrl" TEXT;

-- Create Review table
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "travelerId" TEXT NOT NULL,
    "transporterId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- Create indexes on Review
CREATE INDEX "Review_transporterId_idx" ON "Review"("transporterId");
CREATE INDEX "Review_travelerId_idx" ON "Review"("travelerId");

-- Add unique constraint on bookingId (one review per booking)
ALTER TABLE "Review" ADD CONSTRAINT "Review_bookingId_key" UNIQUE("bookingId");

-- Add foreign key constraints
ALTER TABLE "Review" ADD CONSTRAINT "Review_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT "Review_travelerId_fkey" FOREIGN KEY ("travelerId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT "Review_transporterId_fkey" FOREIGN KEY ("transporterId") REFERENCES "User"("id") ON DELETE CASCADE;
