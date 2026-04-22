"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getBooking, cancelBooking, updatePaymentMethod, createReview } from "@/lib/api";

const paymentMethods = [
  {
    id: "PAYSTACK",
    name: "Paystack",
    description: "Pay with card, bank transfer, or USSD",
    icon: "💳",
    available: false,
  },
  {
    id: "FLUTTERWAVE",
    name: "Flutterwave",
    description: "Pay with card, mobile money, or bank",
    icon: "🌊",
    available: false,
  },
  {
    id: "MPAISA",
    name: "MPaisa",
    description: "Pay with mobile wallet",
    icon: "📱",
    available: false,
  },
];

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  CONFIRMED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-red-50 text-red-600 border-red-200",
};

const paymentStatusColors: Record<string, string> = {
  PENDING: "bg-slate-50 text-slate-500 border-slate-200",
  PAID: "bg-emerald-50 text-emerald-700 border-emerald-200",
  FAILED: "bg-red-50 text-red-600 border-red-200",
};

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [savingMethod, setSavingMethod] = useState(false);
  const [error, setError] = useState("");
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    getBooking(id).then(setBooking).catch(() => setError("Booking not found")).finally(() => setLoading(false));
  }, [id]);

  async function handleCancel() {
    if (!confirm("Cancel this booking?")) return;
    setCancelling(true);
    try {
      const updated = await cancelBooking(id);
      setBooking((b: any) => ({ ...b, status: updated.status }));
    } catch (e: any) {
      setError(e?.message || "Failed to cancel booking");
    } finally {
      setCancelling(false);
    }
  }

  async function handleSelectPayment(method: string) {
    setSelectedMethod(method);
    setSavingMethod(true);
    try {
      await updatePaymentMethod(id, method);
      setBooking((b: any) => ({ ...b, paymentMethod: method }));
    } catch {
      // silent fail — selection saved locally
    } finally {
      setSavingMethod(false);
    }
  }

  async function handleSubmitReview() {
    setSubmittingReview(true);
    try {
      await createReview(id, rating, feedback || undefined);
      setReviewSubmitted(true);
      setFeedback("");
      setRating(5);
    } catch (e: any) {
      setError(e?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  }

  if (loading) return <div className="text-sm text-slate-400 py-10 text-center">Loading booking...</div>;
  if (error || !booking) return <div className="text-sm text-red-500 py-10 text-center">{error || "Booking not found"}</div>;

  const dep = new Date(booking.transport.departureDateTime);
  const isCancelled = booking.status === "CANCELLED";

  return (
    <div className="max-w-2xl space-y-5">
      <div className="mb-2">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900">Booking Details</h1>
        <p className="text-sm text-slate-400 mt-0.5">Booking #{id.slice(0, 8).toUpperCase()}</p>
      </div>

      {/* Booking Summary */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${statusColors[booking.status]}`}>{booking.status}</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${paymentStatusColors[booking.paymentStatus]}`}>Payment: {booking.paymentStatus}</span>
        </div>

        <h3 className="font-semibold text-zinc-900 mb-1">
          {booking.transport.departureCity}, {booking.transport.departureCountry} → {booking.transport.destinationCity}, {booking.transport.destinationCountry}
        </h3>
        <p className="text-sm text-slate-500">
          {dep.toLocaleDateString()} at {dep.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
        <p className="text-sm text-slate-500">{booking.transport.vehicleModel} · {booking.transport.vehiclePlateNumber} · {booking.transport.transportType}</p>
        <p className="text-sm text-slate-500 mt-1">Transporter: {booking.transport.transporter?.name || "Unknown"} · {booking.transport.transporter?.phoneNumber || ""}</p>

        <div className="border-t border-slate-100 mt-4 pt-4 flex justify-between">
          <div>
            <p className="text-xs text-slate-400">Seats booked</p>
            <p className="font-semibold text-zinc-900">{booking.seatsBooked}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Total</p>
            <p className="text-xl font-bold text-zinc-900">${Number(booking.totalPrice).toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      {!isCancelled && booking.paymentStatus !== "PAID" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-zinc-900 mb-1">Select Payment Method</h3>
          <p className="text-xs text-slate-400 mb-4">Payment integration coming soon. Select your preferred method.</p>

          <div className="space-y-3">
            {paymentMethods.map(method => {
              const isSelected = (selectedMethod || booking.paymentMethod) === method.id;
              return (
                <button
                  key={method.id}
                  onClick={() => handleSelectPayment(method.id)}
                  disabled={savingMethod}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                    isSelected
                      ? "border-zinc-900 bg-zinc-50"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <span className="text-2xl">{method.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-zinc-900">{method.name}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">Coming Soon</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{method.description}</p>
                  </div>
                  {isSelected && (
                    <svg className="w-5 h-5 text-zinc-900 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>

          <button
            disabled
            className="mt-4 w-full bg-slate-100 text-slate-400 text-sm font-semibold py-3 rounded-xl cursor-not-allowed"
          >
            Proceed to Payment — Coming Soon
          </button>
        </div>
      )}

      {/* Cancel */}
      {!isCancelled && booking.status !== "COMPLETED" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-zinc-900 mb-1">Cancel Booking</h3>
          <p className="text-xs text-slate-400 mb-3">Cancelling will release your seats back to the pool.</p>
          {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="border border-red-200 text-red-600 text-sm font-medium px-4 py-2 rounded-xl hover:bg-red-50 transition-all disabled:opacity-50"
          >
            {cancelling ? "Cancelling..." : "Cancel Booking"}
          </button>
        </div>
      )}

      {/* Review Form */}
      {booking.status === "COMPLETED" && !reviewSubmitted && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-zinc-900 mb-1">Rate Your Experience</h3>
          <p className="text-xs text-slate-400 mb-4">Help other travelers by rating your transporter</p>

          {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

          <div className="mb-4">
            <label className="text-sm text-slate-600 mb-2 block">Your Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-3xl transition-transform ${rating >= star ? "text-yellow-400" : "text-slate-300"} hover:scale-110`}
                >
                  ★
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-2">{rating} star{rating !== 1 ? "s" : ""}</p>
          </div>

          <div className="mb-4">
            <label className="text-sm text-slate-600 mb-2 block">Feedback (Optional)</label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your experience with this transporter..."
              maxLength={500}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-zinc-900 placeholder-slate-400 focus:outline-none focus:border-zinc-900 resize-none"
              rows={3}
            />
            <p className="text-xs text-slate-400 mt-1">{feedback.length}/500</p>
          </div>

          <button
            onClick={handleSubmitReview}
            disabled={submittingReview}
            className="w-full bg-zinc-900 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            {submittingReview ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      )}

      {/* Review Submitted Confirmation */}
      {booking.status === "COMPLETED" && reviewSubmitted && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
          <p className="text-sm font-semibold text-emerald-700">✓ Thank you for your feedback!</p>
          <p className="text-xs text-emerald-600 mt-1">Your review has been submitted successfully.</p>
        </div>
      )}
    </div>
  );
}
