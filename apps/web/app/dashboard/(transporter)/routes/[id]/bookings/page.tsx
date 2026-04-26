"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getTransportBookings, confirmBooking, rejectBooking, requestBookingCompletion, initChat, getMessages, sendMessage } from "@/lib/api";
import Link from "next/link";
import { formatBookingStatus } from "@/lib/bookingStatus";
import { ProviderLogo } from "@/components/ProviderLogo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  CONFIRMED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  IN_PROGRESS: "bg-orange-50 text-orange-700 border-orange-200",
  COMPLETED: "bg-blue-50 text-blue-700 border-blue-200",
  CANCELLED: "bg-red-50 text-red-600 border-red-200",
};

export default function RouteBookingsPage() {
  const { id } = useParams<{ id: string }>();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [chatModal, setChatModal] = useState<{ bookingId: string; booking: any } | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    getTransportBookings(id).then(setBookings).catch(() => setError("Failed to load bookings")).finally(() => setLoading(false));
  }, [id]);

  async function handleConfirm(bookingId: string) {
    setActionInProgress(bookingId);
    try {
      await confirmBooking(bookingId);
      setBookings(bs => bs.map(b => b.id === bookingId ? { ...b, status: "CONFIRMED" } : b));
    } catch (e: any) {
      setError(e?.message || "Failed to confirm booking");
    } finally {
      setActionInProgress(null);
    }
  }

  async function handleReject(bookingId: string) {
    if (!confirm("Reject this booking?")) return;
    setActionInProgress(bookingId);
    try {
      await rejectBooking(bookingId);
      setBookings(bs => bs.map(b => b.id === bookingId ? { ...b, status: "CANCELLED" } : b));
    } catch (e: any) {
      setError(e?.message || "Failed to reject booking");
    } finally {
      setActionInProgress(null);
    }
  }

  async function handleComplete(bookingId: string) {
    // "Mark ride completed" — only flags it. The traveler has to confirm
    // arrival before the booking actually closes + the payout queues.
    if (!confirm("Mark this ride as completed? Your passenger will be asked to confirm arrival.")) return;
    setActionInProgress(bookingId);
    try {
      await requestBookingCompletion(bookingId);
      setBookings(bs => bs.map(b => b.id === bookingId ? { ...b, completionRequestedAt: new Date().toISOString() } : b));
    } catch (e: any) {
      setError(e?.message || "Failed to mark ride completed");
    } finally {
      setActionInProgress(null);
    }
  }

  async function openChat(booking: any) {
    setChatModal({ bookingId: booking.id, booking });
    try {
      const chat = await initChat(booking.id);
      setChatId(chat.id);
      const msgs = await getMessages(chat.id);
      setMessages(msgs);
    } catch (e: any) {
      setError(e?.message || "Failed to open chat");
    }
  }

  async function handleSendMessage() {
    if (!messageText.trim() || !chatId) return;
    setSendingMessage(true);
    try {
      const newMsg = await sendMessage(chatId, messageText);
      setMessages([...messages, newMsg]);
      setMessageText("");
    } catch (e: any) {
      setError(e?.message || "Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  }

  return (
    <div className="p-4 md:p-0">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/dashboard/routes" className="text-sm text-slate-400 hover:text-zinc-900 transition-colors">← Routes</Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Route Bookings</h1>
          <p className="text-sm text-slate-600">Travelers who booked this route</p>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-slate-400 py-10 text-center">Loading...</div>
      ) : error ? (
        <div className="text-sm text-red-500 py-10 text-center">{error}</div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
          <p className="text-sm font-medium text-zinc-900 mb-1">No bookings yet</p>
          <p className="text-sm text-slate-400">Share your route to attract travelers.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {error && <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>}
          {bookings.map(booking => (
            <div key={booking.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Traveler avatar — resolved presigned URL from the API.
                      Falls back to the initial in a slate gradient tile if
                      they haven't uploaded one. Smaller on mobile to claw
                      back vertical space. */}
                  <Avatar className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl shrink-0 ring-1 ring-slate-200">
                    {booking.traveler?.avatarUrl && (
                      <AvatarImage
                        src={booking.traveler.avatarUrl}
                        alt={booking.traveler.name || "Traveler"}
                        className="object-cover"
                      />
                    )}
                    <AvatarFallback className="rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 text-white text-xs font-semibold">
                      {(booking.traveler?.name || "U").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    {/* Pill inline with name on the same row — saves a whole
                        line vs the old layout where the pill sat alone above. */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-zinc-900 text-sm truncate">{booking.traveler?.name || "Unknown Traveler"}</p>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusColors[booking.status]}`}>{formatBookingStatus(booking.status)}</span>
                    </div>
                    {/* Email + phone are masked until the booking is paid
                        (mirrors the masking the traveler sees of the
                        transporter pre-payment). Show a single explanatory
                        line in that case so the row doesn't look broken. */}
                    {booking.traveler?.email || booking.traveler?.phoneNumber ? (
                      <p className="text-[11px] text-slate-500 truncate">
                        {[booking.traveler?.email, booking.traveler?.phoneNumber].filter(Boolean).join(" · ")}
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic">Contact unlocks after payment</p>
                    )}
                    {/* Single combined info line: seats · total · payment ·
                        ref. Was four separate lines before — collapses the
                        bottom of the card by ~40px on mobile. */}
                    <p className="text-[11px] text-slate-500 mt-1">
                      {booking.seatsBooked} seat{booking.seatsBooked > 1 ? "s" : ""}
                      {" · "}${Number(booking.totalPrice).toFixed(2)}
                      {" · "}<span className="text-slate-400">Pay {booking.paymentStatus}</span>
                      {booking.paymentMethod && (booking.paymentMethod === "PAYSTACK" || booking.paymentMethod === "FLUTTERWAVE") && (
                        <span className="inline-flex items-center gap-1 ml-1 align-middle">
                          <ProviderLogo provider={booking.paymentMethod} size={11} />
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      #{booking.id.slice(0, 8).toUpperCase()} · {new Date(booking.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex flex-row sm:flex-col sm:items-end gap-2 justify-end sm:justify-start">
                  {booking.status === "PENDING" && (
                    /* Match the main /dashboard/bookings styling: outlined-red
                       Reject on the left, filled-emerald Confirm on the right.
                       Same text-[11px] font-semibold rhythm too. */
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleReject(booking.id)}
                        disabled={actionInProgress === booking.id}
                        className="text-[11px] font-semibold border border-red-200 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all active:scale-[0.98] disabled:opacity-50"
                      >
                        {actionInProgress === booking.id ? "..." : "Reject"}
                      </button>
                      <button
                        onClick={() => handleConfirm(booking.id)}
                        disabled={actionInProgress === booking.id}
                        className="text-[11px] font-semibold bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-all active:scale-[0.98] disabled:opacity-50"
                      >
                        {actionInProgress === booking.id ? "..." : "Confirm"}
                      </button>
                    </div>
                  )}
                  {booking.status === "CONFIRMED" && (
                    <button
                      onClick={() => openChat(booking)}
                      className="bg-slate-500 hover:bg-slate-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Chat
                    </button>
                  )}
                  {/* Completion is only meaningful once pickup has been
                      verified (status IN_PROGRESS) — pre-pickup the trip
                      hasn't even started. Hide the button if the request
                      already went out (completionRequestedAt set). */}
                  {booking.status === "IN_PROGRESS" && !booking.completionRequestedAt && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleComplete(booking.id)}
                        disabled={actionInProgress === booking.id}
                        className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {actionInProgress === booking.id ? "..." : "Mark ride completed"}
                      </button>
                      <button
                        onClick={() => openChat(booking)}
                        className="bg-slate-500 hover:bg-slate-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Chat
                      </button>
                    </div>
                  )}
                  {booking.status === "IN_PROGRESS" && booking.completionRequestedAt && (
                    <span className="text-xs font-medium text-amber-700">
                      Awaiting traveler arrival confirmation
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chat Modal */}
      {chatModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-zinc-900">Chat with {chatModal.booking.traveler?.name}</h2>
                <p className="text-xs text-slate-500 mt-0.5">{chatModal.booking.traveler?.phoneNumber}</p>
              </div>
              <button onClick={() => { setChatModal(null); setChatId(null); setMessages([]); }} className="text-2xl text-slate-400">×</button>
            </div>

            {/* Messages */}
            <div className="p-4 h-64 overflow-y-auto space-y-2 bg-slate-50">
              {messages.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">Start the conversation</p>
              ) : (
                messages.map(msg => (
                  <div key={msg.id} className={`text-xs ${msg.senderId !== chatModal.booking.travelerId ? 'text-right' : ''}`}>
                    <p className="text-slate-500 mb-0.5">{msg.sender?.name}</p>
                    <div className={`inline-block max-w-xs px-3 py-1.5 rounded ${msg.senderId !== chatModal.booking.travelerId ? 'bg-zinc-900 text-white' : 'bg-white border border-slate-200'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-200 space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type message..."
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-zinc-900"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={sendingMessage || !messageText.trim()}
                  className="bg-zinc-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-zinc-800 disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
