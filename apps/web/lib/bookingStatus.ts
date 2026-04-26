/**
 * Booking lifecycle is stored as a Prisma enum (PENDING / CONFIRMED /
 * IN_PROGRESS / COMPLETED / CANCELLED). The raw `IN_PROGRESS` reads badly in
 * UI — single point to map enum values to user-facing labels.
 *
 * "ON THE WAY" beats "IN TRANSIT" for non-technical readers — it answers the
 * question "what's happening right now?" rather than borrowing logistics
 * jargon.
 */
export function formatBookingStatus(status: string): string {
  if (status === "IN_PROGRESS") return "ON THE WAY";
  if (status === "IN_TRANSIT") return "ON THE WAY";
  return status;
}

/**
 * Derived stage that combines Booking.status, Booking.paymentStatus and the
 * Payout's release status into a single user-facing lifecycle bucket.
 *
 *   PENDING    → traveler booked, transporter hasn't confirmed
 *   CONFIRMED  → transporter accepted, traveler hasn't paid yet
 *   PAID       → payment cleared, awaiting pickup verification
 *   IN_TRANSIT → transporter scanned the pickup code (status IN_PROGRESS)
 *   COMPLETED  → traveler confirmed arrival, payout queued / processing
 *   RECEIVED   → transporter's payout actually landed (PayoutStatus.RELEASED)
 *   CANCELLED  → cancelled at any point
 *
 * RECEIVED only appears in the transporter view — the API does not include
 * `payout` for traveler responses, so it'll never resolve there.
 */
export type BookingStage =
  | "PENDING"
  | "CONFIRMED"
  | "PAID"
  | "IN_TRANSIT"
  | "COMPLETED"
  | "RECEIVED"
  | "CANCELLED";

interface BookingStageInput {
  status: string;
  paymentStatus?: string;
  payout?: { status?: string | null } | null;
}

export function deriveBookingStage(b: BookingStageInput): BookingStage {
  if (b.status === "CANCELLED") return "CANCELLED";
  // RECEIVED beats COMPLETED — only flip into it once the payout is actually
  // in the transporter's bank, otherwise stay on COMPLETED.
  if (b.payout?.status === "RELEASED") return "RECEIVED";
  if (b.status === "COMPLETED") return "COMPLETED";
  if (b.status === "IN_PROGRESS") return "IN_TRANSIT";
  if (b.status === "CONFIRMED" && b.paymentStatus === "PAID") return "PAID";
  if (b.status === "CONFIRMED") return "CONFIRMED";
  return "PENDING";
}

/** Tailwind tone (matches StatusPill) per derived stage. */
export const STAGE_TONE: Record<BookingStage, "yellow" | "emerald" | "blue" | "orange" | "slate" | "red"> = {
  PENDING: "yellow",
  CONFIRMED: "emerald",
  PAID: "emerald",
  IN_TRANSIT: "orange",
  COMPLETED: "blue",
  RECEIVED: "emerald",
  CANCELLED: "red",
};

/** Human label for the derived stage (used by tabs and pills alike). */
export function formatStageLabel(stage: BookingStage): string {
  if (stage === "IN_TRANSIT") return "ON THE WAY";
  return stage.replace(/_/g, " ");
}
