"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  getBooking, confirmBooking, rejectBooking, requestBookingCompletion,
} from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import {
  CarIcon, CalendarIcon, UsersIcon, ArrowRightIcon,
  CreditCardIcon, PhoneIcon, MailIcon,
} from "@/app/dashboard/_Components/Icons";
import {
  Page, Reveal, PageHeader, StatusPill, SkeletonCard,
} from "@/app/dashboard/_Components/ui";
import { formatBookingStatus } from "@/lib/bookingStatus";
import { ChatModal } from "@/app/dashboard/_Components/ChatModal";

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    Promise.all([getBooking(id), getCurrentUser()])
      .then(([b, u]) => {
        setBooking(b);
        setCurrentUser(u);
      })
      .catch(() => setError("Booking not found"))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleConfirm() {
    setActionLoading(true);
    try {
      const updated = await confirmBooking(id);
      setBooking((b: any) => ({ ...b, status: updated.status }));
    } catch (e: any) {
      setError(e?.message || "Failed to confirm");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject() {
    if (!confirm("Reject this booking?")) return;
    setActionLoading(true);
    try {
      const updated = await rejectBooking(id);
      setBooking((b: any) => ({ ...b, status: updated.status }));
    } catch (e: any) {
      setError(e?.message || "Failed to reject");
    } finally {
      setActionLoading(false);
    }
  }

  /**
   * Two-party completion: transporter signals trip-ended, traveler still has
   * to confirm before status flips + payout fires. Stops a transporter from
   * unilaterally triggering their own payout.
   */
  async function handleRequestCompletion() {
    if (!confirm("Notify the traveler that the trip has ended? They'll get a prompt to confirm — that's what closes the trip and releases your payout.")) return;
    setActionLoading(true);
    try {
      const updated = await requestBookingCompletion(id);
      setBooking((b: any) => ({ ...b, completionRequestedAt: updated.completionRequestedAt }));
    } catch (e: any) {
      setError(e?.message || "Failed to send completion request");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <Page>
        <PageHeader title="Loading booking..." backHref="/dashboard/bookings" />
        <SkeletonCard />
      </Page>
    );
  }

  if (error || !booking) {
    return (
      <Page>
        <PageHeader title="Booking not found" backHref="/dashboard/bookings" />
        <div className="rounded-2xl border border-red-100 bg-red-50/60 p-6 text-sm text-red-700">
          {error || "This booking doesn't exist or you don't have access."}
        </div>
      </Page>
    );
  }

  const dep = new Date(booking.transport.departureDateTime);
  const traveler = booking.traveler;
  const vehicle = booking.transport?.vehicle;
  const tone =
    booking.status === "CONFIRMED" ? "emerald" :
    booking.status === "PENDING" ? "yellow" :
    booking.status === "IN_PROGRESS" ? "orange" :
    booking.status === "COMPLETED" ? "blue" : "red";

  return (
    <Page>
      <PageHeader
        backHref="/dashboard/bookings"
        kicker={`#${id.slice(0, 6).toUpperCase()}`}
        title={`${booking.transport.departureCity} → ${booking.transport.destinationCity}`}
        subtitle={`${dep.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} at ${dep.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main */}
        <Reveal className="lg:col-span-2 space-y-5">
          {/* Status + totals card */}
          <div className="relative rounded-2xl bg-white border border-slate-200/80 overflow-hidden">
            <div className="flex flex-col sm:flex-row gap-4 p-5">
              <div className="sm:w-28 h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                {vehicle?.imageUrl ? (
                  <img src={vehicle.imageUrl} alt={vehicle.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <CarIcon className="w-8 h-8" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <StatusPill tone={tone} dot={booking.status === "CONFIRMED" || booking.status === "PENDING" || booking.status === "IN_PROGRESS"}>
                    {formatBookingStatus(booking.status)}
                  </StatusPill>
                  <StatusPill tone={booking.paymentStatus === "PAID" ? "emerald" : "slate"}>
                    {booking.paymentStatus === "PAID" ? "Paid" : "Unpaid"}
                  </StatusPill>
                </div>
                <h3 className="text-[15px] font-semibold text-zinc-950 flex items-center gap-1.5 flex-wrap">
                  <span>{booking.transport.departureCity}</span>
                  <ArrowRightIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>{booking.transport.destinationCity}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {booking.transport.departureCountry} → {booking.transport.destinationCountry}
                </p>
                <div className="flex items-center gap-4 text-[11px] text-slate-500 mt-3 flex-wrap">
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
            </div>

            <div className="grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100">
              <MiniStat label="Seats" value={booking.seatsBooked} />
              <MiniStat label="Per seat" value={`$${(Number(booking.totalPrice) / booking.seatsBooked).toFixed(2)}`} />
              <MiniStat label="Total" value={`$${Number(booking.totalPrice).toFixed(2)}`} accent />
            </div>
          </div>

          {/* Actions */}
          {booking.status === "PENDING" && (
            <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-white border border-amber-100 p-5">
              <p className="text-[13px] font-semibold text-zinc-950 mb-1">Awaiting your review</p>
              <p className="text-[12px] text-slate-600 mb-4">
                Confirm to reserve the seat(s) or reject to release them back.
              </p>
              {error && <p className="text-xs text-red-600 mb-3">{error}</p>}
              <div className="flex gap-2">
                <button
                  onClick={handleConfirm}
                  disabled={actionLoading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2.5 rounded-xl disabled:opacity-50 transition-all active:scale-[0.98]"
                >
                  {actionLoading ? "..." : "Confirm booking"}
                </button>
                <button
                  onClick={handleReject}
                  disabled={actionLoading}
                  className="flex-1 border border-red-200 text-red-600 text-sm font-semibold py-2.5 rounded-xl hover:bg-red-50 disabled:opacity-50 transition-all active:scale-[0.98]"
                >
                  Reject
                </button>
              </div>
            </div>
          )}

          {booking.status === "IN_PROGRESS" && (
            booking.completionRequestedAt ? (
              <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5">
                <p className="text-[13px] font-semibold text-amber-900 mb-1">Awaiting traveler confirmation</p>
                <p className="text-[12px] text-amber-800">
                  We've notified your passenger that the trip has ended. As soon as
                  they confirm "I have arrived", the trip closes and your payout queues.
                </p>
                <p className="text-[10px] text-amber-700 mt-2">
                  Requested {new Date(booking.completionRequestedAt).toLocaleString()}
                </p>
              </div>
            ) : (
              <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-white border border-blue-100 p-5">
                <p className="text-[13px] font-semibold text-zinc-950 mb-1">Trip ended?</p>
                <p className="text-[12px] text-slate-600 mb-4">
                  Notify the traveler that the ride is over. They'll be prompted to
                  confirm — only then is the trip marked completed and your payout queued.
                </p>
                <button
                  onClick={handleRequestCompletion}
                  disabled={actionLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl disabled:opacity-50 transition-all active:scale-[0.98]"
                >
                  {actionLoading ? "Sending..." : "Mark ride completed"}
                </button>
              </div>
            )
          )}

          {/* Chat */}
          {booking.status === "CONFIRMED" && (
            <div className="rounded-2xl bg-white border border-slate-200/80 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="text-[13px] font-semibold text-zinc-950">Chat with traveler</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Coordinate pickup and trip details</p>
              </div>

              {booking.paymentStatus !== "PAID" ? (
                <div className="p-8 flex flex-col items-center text-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-zinc-800">Awaiting traveler payment</p>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">Chat opens automatically once the traveler completes payment.</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-amber-700 bg-amber-50 ring-1 ring-inset ring-amber-200 px-2.5 py-1.5 rounded-lg">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    Waiting for payment
                  </span>
                </div>
              ) : (
                <div className="p-5">
                  <button
                    onClick={() => setShowChat(true)}
                    className="w-full bg-zinc-950 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-zinc-800 active:scale-[0.98] transition-all"
                  >
                    Open chat
                  </button>
                </div>
              )}
            </div>
          )}
          {showChat && currentUser?.id && (
            <ChatModal
              bookingId={id}
              currentUserId={currentUser.id}
              title="Chat with traveler"
              subtitle="Coordinate pickup and trip details"
              onClose={() => setShowChat(false)}
            />
          )}
        </Reveal>

        {/* Sidebar */}
        <Reveal className="space-y-5">
          <div className="rounded-2xl bg-white border border-slate-200/80 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="text-[13px] font-semibold text-zinc-950">Traveler</h3>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                {/* Render the avatar image when present; fall back to the
                    initial in a gradient tile. The image is a presigned
                    S3 URL — server resolves keys before sending. */}
                {traveler?.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={traveler.avatarUrl}
                    alt={traveler.name || "Traveler"}
                    className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-200"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 text-white text-sm font-semibold flex items-center justify-center">
                    {traveler?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold text-zinc-950 truncate">
                    {traveler?.name || "Unknown"}
                  </p>
                  <p className="text-[11px] text-slate-500">Traveler</p>
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-100">
                {traveler?.email && (
                  <DetailRow icon={<MailIcon className="w-3.5 h-3.5" />} label="Email" value={traveler.email} />
                )}
                {traveler?.phoneNumber && (
                  <DetailRow icon={<PhoneIcon className="w-3.5 h-3.5" />} label="Phone" value={traveler.phoneNumber} accent />
                )}
                {/* Pre-payment, the API masks email + phone (mirrors the
                    contact masking the traveler sees of the transporter).
                    Show a note so the driver understands why contact
                    isn't visible yet rather than thinking it's broken. */}
                {!traveler?.email && !traveler?.phoneNumber && booking.paymentStatus !== "PAID" && (
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Contact details unlock once your passenger pays. For now use the in-app chat below.
                  </p>
                )}
              </div>
            </div>
          </div>

          {vehicle && (
            <div className="rounded-2xl bg-white border border-slate-200/80 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="text-[13px] font-semibold text-zinc-950">Vehicle</h3>
              </div>
              <div className="p-5 space-y-1">
                <p className="text-[14px] font-semibold text-zinc-950">{vehicle.name}</p>
                <p className="text-[12px] text-slate-500">
                  {vehicle.model} · Plate {vehicle.plateNumber}
                </p>
              </div>
            </div>
          )}
        </Reveal>
      </div>
    </Page>
  );
}

function MiniStat({ label, value, accent }: { label: string; value: any; accent?: boolean }) {
  return (
    <div className="p-4 text-center">
      <p className={`text-[16px] font-semibold tabular-nums ${accent ? "text-emerald-700" : "text-zinc-950"}`}>
        {value}
      </p>
      <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400 mt-1">{label}</p>
    </div>
  );
}

function DetailRow({ icon, label, value, accent }: { icon?: React.ReactNode; label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-slate-400">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{label}</p>
        <p className={`text-[13px] font-medium truncate ${accent ? "text-emerald-700" : "text-zinc-950"}`}>{value}</p>
      </div>
    </div>
  );
}
