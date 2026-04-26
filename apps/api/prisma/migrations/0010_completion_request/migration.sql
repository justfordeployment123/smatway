-- Two-party completion: transporter pre-flags the trip as ended, then the
-- traveler accepts to actually mark it COMPLETED. This column tracks the
-- transporter's flag; arrivalConfirmedAt + status=COMPLETED still carry the
-- traveler's confirmation. Existing rows leave it null (no migration of data).

ALTER TABLE "Booking" ADD COLUMN "completionRequestedAt" TIMESTAMP(3);
