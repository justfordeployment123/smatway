"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getBooking, requestBookingCompletion } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { formatBookingStatus } from "@/lib/bookingStatus";
import { ChatModal } from "@/app/dashboard/_Components/ChatModal";

export default function TransporterBookingDetailPage() {
  const params = useParams<{ id: string; bookingId: string }>();
  const { id, bookingId } = params;

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [completingBooking, setCompletingBooking] = useState(false);

  useEffect(() => {
    Promise.all([getBooking(bookingId), getCurrentUser()])
      .then(([b, u]) => { setBooking(b); setCurrentUser(u); })
      .catch(() => setError("Booking not found"))
      .finally(() => setLoading(false));
  }, [bookingId]);

  async function handleRequestCompletion() {
    // Two-party closeout: this only flags the trip as "ride ended". The
    // traveler still has to confirm arrival before the booking flips to
    // COMPLETED + payout queues. Stops a transporter from triggering their
    // own payout.
    if (!confirm("Mark this ride as completed? Your passenger will be asked to confirm arrival.")) return;
    setCompletingBooking(true);
    try {
      await requestBookingCompletion(bookingId);
      const fresh = await getBooking(bookingId);
      setBooking(fresh);
    } catch (e: any) {
      setError(e?.message || "Failed to mark ride completed");
    } finally {
      setCompletingBooking(false);
    }
  }

  if (loading) return <div className="text-sm text-slate-400 py-10 text-center">Loading...</div>;
  if (error || !booking) return <div className="text-sm text-red-500 py-10 text-center">{error || "Not found"}</div>;

  const dep = new Date(booking.transport.departureDateTime);

  return (
    <div className="max-w-2xl space-y-5">
      <div className="mb-2 flex items-center gap-2">
        <Link href={`/dashboard/(transporter)/routes/${id}/bookings`} className="text-sm text-slate-400 hover:text-zinc-900">← Bookings</Link>
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900">Booking #{bookingId.slice(0, 8).toUpperCase()}</h1>
      </div>

      {/* Booking Summary */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${booking.status === "PENDING" ? "bg-yellow-50 text-yellow-700 border-yellow-200" : booking.status === "CONFIRMED" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : booking.status === "IN_PROGRESS" ? "bg-orange-50 text-orange-700 border-orange-200" : booking.status === "CANCELLED" ? "bg-red-50 text-red-600 border-red-200" : "bg-blue-50 text-blue-700 border-blue-200"}`}>
            {formatBookingStatus(booking.status)}
          </span>
        </div>

        <h3 className="font-semibold text-zinc-900 mb-1">
          {booking.transport.departureCity} → {booking.transport.destinationCity}
        </h3>
        <p className="text-sm text-slate-500">
          {dep.toLocaleDateString()} at {dep.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>

        <div className="border-t border-slate-100 mt-4 pt-4">
          <p className="text-sm text-slate-600 mb-2">Traveler</p>
          <p className="font-semibold text-zinc-900">{booking.traveler?.name}</p>
          <p className="text-sm text-slate-500">{booking.traveler?.email}</p>
          <p className="text-sm text-emerald-600 font-semibold">{booking.traveler?.phoneNumber}</p>
        </div>

        <div className="border-t border-slate-100 mt-4 pt-4 flex justify-between">
          <div>
            <p className="text-xs text-slate-400">Seats</p>
            <p className="font-semibold text-zinc-900">{booking.seatsBooked}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Total</p>
            <p className="text-xl font-bold text-zinc-900">${Number(booking.totalPrice).toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      {booking.status === "PENDING" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <p className="text-xs text-slate-400 mb-3">Awaiting your confirmation</p>
          <button disabled className="w-full bg-slate-100 text-slate-400 text-sm font-semibold py-2.5 rounded-lg cursor-not-allowed">
            Confirm from booking list
          </button>
        </div>
      )}

      {/* Only after the pickup code has been verified (status IN_PROGRESS).
          Pre-pickup the closeout button doesn't make sense — the trip
          hasn't started yet. */}
      {booking.status === "IN_PROGRESS" && !booking.completionRequestedAt && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <p className="text-xs text-slate-400 mb-3">Mark the ride as completed when you've dropped your passenger off</p>
          <button
            onClick={handleRequestCompletion}
            disabled={completingBooking}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-lg disabled:opacity-50"
          >
            {completingBooking ? "Sending..." : "Mark ride completed"}
          </button>
        </div>
      )}
      {booking.status === "IN_PROGRESS" && booking.completionRequestedAt && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <p className="text-sm font-semibold text-amber-900">Awaiting traveler confirmation</p>
          <p className="text-xs text-amber-800 mt-1">
            We've notified your passenger. They close the trip with "I have arrived",
            which queues your payout.
          </p>
        </div>
      )}

      {/* Chat */}
      {(booking.status === "CONFIRMED" || booking.status === "IN_PROGRESS") && booking.paymentStatus === "PAID" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-zinc-900 mb-1">Chat with traveler</h3>
          <p className="text-xs text-slate-400 mb-4">Coordinate pickup and trip details</p>
          <button
            onClick={() => setShowChat(true)}
            className="w-full bg-zinc-900 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            Open chat
          </button>
        </div>
      )}
      {showChat && currentUser?.id && (
        <ChatModal
          bookingId={bookingId}
          currentUserId={currentUser.id}
          title="Chat with traveler"
          subtitle="Coordinate pickup and trip details"
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
}
