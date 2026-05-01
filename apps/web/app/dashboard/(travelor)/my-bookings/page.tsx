"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { getMyBookings, cancelBooking } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BookOpenIcon, CarIcon, CalendarIcon, UsersIcon,
  ArrowRightIcon,
} from "@/app/dashboard/_Components/Icons";
import { ChatModal } from "@/app/dashboard/_Components/ChatModal";
import {
  Page, Reveal, PageHeader, EmptyState, SkeletonList, StatusPill,
  TabFilter, SurfaceCard,
} from "@/app/dashboard/_Components/ui";
import {
  deriveBookingStage, BookingStage, STAGE_TONE, formatStageLabel,
} from "@/lib/bookingStatus";
import {
  DATE_RANGE_TABS, DATE_RANGE_LABELS, isInDateRange, type DateRange,
} from "@/lib/dateRange";

// Traveler-facing lifecycle. Same stages as transporter EXCEPT no RECEIVED —
// payouts are the transporter's concern, not the traveler's.
type TravelerStage = Exclude<BookingStage, "RECEIVED">;
type Filter = "ALL" | TravelerStage;
const FILTERS: readonly Filter[] = [
  "ALL", "PENDING", "CONFIRMED", "PAID", "IN_TRANSIT", "COMPLETED", "CANCELLED",
] as const;

export default function MyBookingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("ALL");
  // Default to "this week" so the page lands on the most relevant slice —
  // upcoming + recent trips, not a flood of historical noise.
  const [dateRange, setDateRange] = useState<DateRange>("WEEK");
  const [user, setUser] = useState<any>(null);

  const [chatBookingId, setChatBookingId] = useState<string | null>(null);
  const autoOpenedRef = useRef(false);

  useEffect(() => {
    Promise.all([getMyBookings(), getCurrentUser()])
      .then(([b, u]) => {
        setBookings(b);
        setUser(u);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const id = searchParams.get("openChatBooking");
    if (!id || autoOpenedRef.current || loading) return;
    autoOpenedRef.current = true;
    setChatBookingId(id);
    router.replace("/dashboard/my-bookings");
  }, [searchParams, loading]);

  async function handleCancel(id: string) {
    if (!confirm("Cancel this booking?")) return;
    setCancelling(id);
    try {
      const updated = await cancelBooking(id);
      setBookings((bs) => bs.map((b) => (b.id === id ? { ...b, status: updated.status } : b)));
    } finally {
      setCancelling(null);
    }
  }

  // Stage drives both filter + pill. RECEIVED can't appear here because the
  // traveler API never returns the payout relation, so deriveBookingStage
  // never yields RECEIVED.
  const stageOf = (b: any): TravelerStage => deriveBookingStage(b) as TravelerStage;
  // Date range narrows first, then the stage tab. Stage counts are scoped to
  // the date range too so they don't lie about how many trips a stage tab
  // would actually show.
  const inRange = bookings.filter((b) => isInDateRange(b.transport.departureDateTime, dateRange));
  const filtered = filter === "ALL" ? inRange : inRange.filter((b) => stageOf(b) === filter);

  const counts: Record<Filter, number> = {
    ALL: inRange.length,
    PENDING: 0,
    CONFIRMED: 0,
    PAID: 0,
    IN_TRANSIT: 0,
    COMPLETED: 0,
    CANCELLED: 0,
  };
  for (const b of inRange) {
    const s = stageOf(b);
    if (s in counts) counts[s as Filter] += 1;
  }

  return (
    <Page>
      <PageHeader
        kicker={`${bookings.length} ${bookings.length === 1 ? "trip" : "trips"}`}
        title="My bookings"
        subtitle="Track your upcoming trips, chat with your transporter, or cancel a booking."
      />

      {!loading && bookings.length > 0 && (
        <Reveal className="mb-6 space-y-3">
          <TabFilter<DateRange>
            tabs={DATE_RANGE_TABS}
            value={dateRange}
            onChange={setDateRange}
            formatLabel={(t) => DATE_RANGE_LABELS[t]}
          />
          <TabFilter<Filter>
            tabs={FILTERS}
            value={filter}
            onChange={setFilter}
            counts={counts}
            formatLabel={(t) => (t === "ALL" ? "ALL" : formatStageLabel(t as BookingStage))}
          />
        </Reveal>
      )}

      {loading ? (
        <SkeletonList count={3} />
      ) : bookings.length === 0 ? (
        <EmptyState
          title="No bookings yet"
          description="Search for available routes and book your first ride with a verified transporter."
          ctaLabel="Search routes"
          ctaHref="/dashboard"
          icon={<BookOpenIcon className="w-6 h-6" />}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={
            inRange.length === 0
              ? `No bookings ${dateRange === "TODAY" ? "today" : dateRange === "WEEK" ? "this week" : "this month"}`
              : `No ${filter.toLowerCase()} bookings ${dateRange === "TODAY" ? "today" : dateRange === "WEEK" ? "this week" : "this month"}`
          }
          description="Try a different date range or status filter to see other bookings."
        />
      ) : (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.04 } } }}
          className="grid grid-cols-1 gap-3"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                cancelling={cancelling === booking.id}
                onCancel={() => handleCancel(booking.id)}
                onChat={() => setChatBookingId(booking.id)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {chatBookingId && user?.id && (
        <ChatModal
          bookingId={chatBookingId}
          currentUserId={user.id}
          title="Message transporter"
          subtitle="Confirm pickup or ask any questions"
          onClose={() => setChatBookingId(null)}
        />
      )}
    </Page>
  );
}

// ─── Booking card ─────────────────────────────────────────────────────────────
function BookingCard({
  booking, cancelling, onCancel, onChat,
}: {
  booking: any;
  cancelling: boolean;
  onCancel: () => void;
  onChat: () => void;
}) {
  const dep = new Date(booking.transport.departureDateTime);
  const vehicle = booking.transport.vehicle;
  const stage = deriveBookingStage(booking);
  const livePulse = stage === "PENDING" || stage === "CONFIRMED" || stage === "PAID" || stage === "IN_TRANSIT";

  return (
    <SurfaceCard>
      <div className="p-5">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="sm:w-28 h-24 sm:h-24 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100">
            {vehicle?.imageUrl ? (
              <img src={vehicle.imageUrl} alt={vehicle.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300">
                <CarIcon className="w-8 h-8" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <StatusPill tone={STAGE_TONE[stage]} dot={livePulse}>
                {formatStageLabel(stage)}
              </StatusPill>
              {/* Show payment-failed separately so the user knows to retry —
                  the derived stage falls back to PENDING for a failed payment
                  which alone wouldn't surface that nuance. */}
              {booking.paymentStatus === "FAILED" && (
                <StatusPill tone="red">Payment failed</StatusPill>
              )}
              <span className="text-[10px] text-slate-400 font-mono">
                #{booking.id.slice(0, 6).toUpperCase()}
              </span>
            </div>

            <h3 className="text-[15px] font-semibold text-zinc-950 flex items-center gap-1.5 flex-wrap">
              <span>{booking.transport.departureCity}</span>
              <ArrowRightIcon className="w-3.5 h-3.5 text-slate-400" />
              <span>{booking.transport.destinationCity}</span>
            </h3>

            <div className="flex items-center gap-4 text-[11px] text-slate-500 mt-2 flex-wrap">
              <span className="inline-flex items-center gap-1">
                <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                {dep.toLocaleDateString()} · {dep.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
              <span className="inline-flex items-center gap-1">
                <UsersIcon className="w-3.5 h-3.5 text-slate-400" />
                {booking.seatsBooked} {booking.seatsBooked === 1 ? "seat" : "seats"}
              </span>
            </div>
          </div>

          <div className="flex flex-row sm:flex-col items-end justify-between gap-3 sm:min-w-[140px]">
            <p className="text-[18px] font-semibold text-zinc-950 tabular-nums">
              ${Number(booking.totalPrice).toFixed(2)}
            </p>
            <div className="flex gap-1.5 flex-wrap justify-end">
              {/* Both states route to the booking-detail hub — payment kickoff,
                  ticket/QR, arrival confirmation, and review all live there.
                  If the route is still filling, the CTA label downgrades from
                  "Pay now" to a softer "Trip filling X/Y" so the traveler
                  isn't promised a pay flow that won't actually open yet. */}
              {booking.paymentStatus !== "PAID" && booking.status !== "CANCELLED" && booking.status !== "COMPLETED" && (() => {
                const min = booking.transport?.minSeatsToConfirm as number | null | undefined;
                const filled = (booking.transport?.filledSeats as number | undefined) ?? 0;
                const filling = !!min && filled < min && booking.status === "PENDING";
                if (filling) {
                  return (
                    <Link
                      href={`/dashboard/traveler/booking/${booking.id}`}
                      className="text-[11px] font-semibold bg-amber-50 text-amber-800 ring-1 ring-amber-200 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-all active:scale-[0.98]"
                    >
                      Trip filling {filled}/{min}
                    </Link>
                  );
                }
                return (
                  <Link
                    href={`/dashboard/traveler/booking/${booking.id}`}
                    className="text-[11px] font-semibold bg-zinc-950 text-white px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition-all active:scale-[0.98]"
                  >
                    {booking.paymentStatus === "FAILED" ? "Retry payment" : "Pay now"}
                  </Link>
                );
              })()}
              {booking.paymentStatus === "PAID" && booking.status !== "CANCELLED" && (
                <Link
                  href={`/dashboard/traveler/booking/${booking.id}`}
                  className="text-[11px] font-semibold bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-all active:scale-[0.98]"
                >
                  {booking.status === "COMPLETED" ? "View ticket" : "Show ticket"}
                </Link>
              )}
              {/* Chat is gated server-side on paymentStatus = PAID. Hide the
                  button pre-payment so it doesn't bounce off a 400 error. */}
              {booking.paymentStatus === "PAID" && booking.status !== "CANCELLED" && (
                <button
                  onClick={onChat}
                  className="text-[11px] font-semibold border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-all active:scale-[0.98]"
                >
                  Chat
                </button>
              )}
              {booking.status !== "CANCELLED" && booking.status !== "COMPLETED" && booking.status !== "IN_PROGRESS" && (
                <button
                  onClick={onCancel}
                  disabled={cancelling}
                  className="text-[11px] font-semibold border border-red-200 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {cancelling ? "..." : "Cancel"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </SurfaceCard>
  );
}

