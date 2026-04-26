/**
 * Booking lifecycle is stored as a Prisma enum (PENDING / CONFIRMED /
 * IN_PROGRESS / COMPLETED / CANCELLED). The raw `IN_PROGRESS` reads badly in
 * UI — single point to map enum values to user-facing labels.
 *
 * "ON THE WAY" beats "IN TRANSIT" for non-technical readers — answers
 * "what's happening right now?" without borrowing logistics jargon.
 */
export function formatBookingStatus(status: string): string {
  if (status === "IN_PROGRESS") return "ON THE WAY";
  if (status === "IN_TRANSIT") return "ON THE WAY";
  return status;
}

/**
 * Mirror of apps/web/lib/bookingStatus.ts — derived stage that combines
 * Booking.status, paymentStatus, and Payout.status into a single user-facing
 * lifecycle bucket. Kept in sync manually since admin and web share no
 * package; only the helper is duplicated, not the rendering code.
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
  if (b.payout?.status === "RELEASED") return "RECEIVED";
  if (b.status === "COMPLETED") return "COMPLETED";
  if (b.status === "IN_PROGRESS") return "IN_TRANSIT";
  if (b.status === "CONFIRMED" && b.paymentStatus === "PAID") return "PAID";
  if (b.status === "CONFIRMED") return "CONFIRMED";
  return "PENDING";
}

export const STAGE_TONE: Record<BookingStage, "yellow" | "emerald" | "blue" | "orange" | "slate" | "red"> = {
  PENDING: "yellow",
  CONFIRMED: "emerald",
  PAID: "emerald",
  IN_TRANSIT: "orange",
  COMPLETED: "blue",
  RECEIVED: "emerald",
  CANCELLED: "red",
};

export function formatStageLabel(stage: BookingStage): string {
  if (stage === "IN_TRANSIT") return "ON THE WAY";
  return stage.replace(/_/g, " ");
}
