-- Group-ride threshold: a route can declare a minimum number of seats it needs
-- filled before the trip "runs" (payment unlocks for the travelers, optionally
-- auto-confirming all pending bookings).
--
-- minSeatsToConfirm: nullable; null means no threshold. Backfilled to the
-- route's *original capacity* for existing rows so they keep behaving exactly
-- like before — the threshold can only ever be hit when the route is 100%
-- full, so it never spuriously gates pay on legacy routes.
--
-- autoConfirmOnFill: when true, the threshold-met trigger flips every PENDING
-- booking on the route to CONFIRMED in one shot. Defaults false.

ALTER TABLE "Transport" ADD COLUMN "minSeatsToConfirm" INTEGER;
ALTER TABLE "Transport" ADD COLUMN "autoConfirmOnFill" BOOLEAN NOT NULL DEFAULT false;

-- Backfill: original capacity = current availableSeats + sum of seatsBooked
-- across every non-cancelled booking on the route. CANCELLED bookings already
-- returned their seats to availableSeats via the cancel handler, so we don't
-- count them.
UPDATE "Transport" t
SET "minSeatsToConfirm" = t."availableSeats" + COALESCE((
  SELECT SUM(b."seatsBooked")::INTEGER
  FROM "Booking" b
  WHERE b."transportId" = t."id"
    AND b."status" != 'CANCELLED'
), 0);
