"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getBooking, confirmBooking, rejectBooking, completeBooking, initChat, getMessages, sendMessage } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import io from "socket.io-client";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  CONFIRMED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-red-50 text-red-600 border-red-200",
  COMPLETED: "bg-blue-50 text-blue-700 border-blue-200",
};

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const socketRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([getBooking(id), getCurrentUser()])
      .then(([b, u]) => { setBooking(b); setCurrentUser(u); })
      .catch(() => setError("Booking not found"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (booking?.status === "CONFIRMED") initializeChat();
  }, [booking?.status]);

  useEffect(() => {
    if (!chatId || !currentUser?.id) return;
    const socket = io(process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3002", {
      query: { userId: currentUser.id },
      reconnection: true,
    });
    socketRef.current = socket;
    socket.emit("join-chat", { chatId });
    socket.on("message", (msg: any) => setMessages(prev => [...prev, msg]));
    return () => { socket.off("message"); socket.disconnect(); };
  }, [chatId, currentUser?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function initializeChat() {
    setChatLoading(true);
    try {
      const chat = await initChat(id);
      setChatId(chat.id);
      const msgs = await getMessages(chat.id);
      setMessages(msgs);
    } catch {
      // Chat not yet available
    } finally {
      setChatLoading(false);
    }
  }

  async function handleSendMessage() {
    if (!messageText.trim() || !chatId || !currentUser?.id) return;
    setSendingMessage(true);
    try {
      socketRef.current?.emit("message", { chatId, content: messageText, userId: currentUser.id });
      setMessageText("");
    } finally {
      setSendingMessage(false);
    }
  }

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

  async function handleComplete() {
    if (!confirm("Mark this booking as completed?")) return;
    setActionLoading(true);
    try {
      const updated = await completeBooking(id);
      setBooking((b: any) => ({ ...b, status: updated.status }));
    } catch (e: any) {
      setError(e?.message || "Failed to complete");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) return <div className="text-sm text-slate-400 py-10 text-center">Loading...</div>;
  if (error || !booking) return <div className="text-sm text-red-500 py-10 text-center">{error || "Not found"}</div>;

  const dep = new Date(booking.transport.departureDateTime);
  const traveler = booking.traveler;
  const vehicle = booking.transport?.vehicle;

  return (
    <div className="p-4 md:p-0 max-w-2xl space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/dashboard/bookings" className="text-sm text-slate-400 hover:text-zinc-900">← Bookings</Link>
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
          Booking #{id.slice(0, 8).toUpperCase()}
        </h1>
      </div>

      {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">{error}</p>}

      {/* Summary */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${statusColors[booking.status] || ""}`}>
            {booking.status}
          </span>
        </div>

        <div className="flex gap-4">
          {vehicle?.imageUrl && (
            <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100">
              <img src={vehicle.imageUrl} alt={vehicle.name} className="w-full h-full object-cover" />
            </div>
          )}
          <div>
            <h3 className="font-semibold text-zinc-900">
              {booking.transport.departureCity}, {booking.transport.departureCountry}
              {" → "}
              {booking.transport.destinationCity}, {booking.transport.destinationCountry}
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">
              {dep.toLocaleDateString()} at {dep.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
            {vehicle && (
              <p className="text-xs text-slate-400 mt-0.5">{vehicle.name} · {vehicle.plateNumber}</p>
            )}
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <p className="text-xs font-medium text-slate-400 mb-2">TRAVELER</p>
          <p className="font-semibold text-zinc-900">{traveler?.name || "Unknown"}</p>
          <p className="text-sm text-slate-500">{traveler?.email}</p>
          {traveler?.phoneNumber && (
            <p className="text-sm text-emerald-600 font-semibold">{traveler.phoneNumber}</p>
          )}
        </div>

        <div className="border-t border-slate-100 pt-4 flex justify-between">
          <div>
            <p className="text-xs text-slate-400">Seats booked</p>
            <p className="font-semibold text-zinc-900">{booking.seatsBooked}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Payment</p>
            <p className="font-semibold text-zinc-900">{booking.paymentStatus}</p>
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
          <p className="text-xs text-slate-400 mb-3">This booking is awaiting your confirmation</p>
          <div className="flex gap-3">
            <button
              onClick={handleConfirm}
              disabled={actionLoading}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2.5 rounded-lg disabled:opacity-50 transition-all"
            >
              {actionLoading ? "..." : "Confirm"}
            </button>
            <button
              onClick={handleReject}
              disabled={actionLoading}
              className="flex-1 border border-red-200 text-red-600 text-sm font-semibold py-2.5 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-all"
            >
              {actionLoading ? "..." : "Reject"}
            </button>
          </div>
        </div>
      )}

      {booking.status === "CONFIRMED" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <p className="text-xs text-slate-400 mb-3">Mark as complete when the trip finishes</p>
          <button
            onClick={handleComplete}
            disabled={actionLoading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-lg disabled:opacity-50 transition-all"
          >
            {actionLoading ? "Completing..." : "Complete Booking"}
          </button>
        </div>
      )}

      {/* Chat */}
      {booking.status === "CONFIRMED" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-zinc-900 mb-1">Chat with Traveler</h3>
          <p className="text-xs text-slate-400 mb-4">Coordinate trip details directly</p>

          {chatLoading ? (
            <div className="text-sm text-slate-400 text-center py-6">Loading chat...</div>
          ) : chatId ? (
            <div className="space-y-3">
              <div className="bg-slate-50 rounded-lg p-3 h-64 overflow-y-auto space-y-2">
                {messages.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">No messages yet. Start the conversation!</p>
                ) : (
                  messages.map((msg, i) => (
                    <div key={msg.id ?? i} className={`flex ${msg.senderId === currentUser?.id ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${msg.senderId === currentUser?.id ? "bg-emerald-600 text-white" : "bg-white border border-slate-200 text-slate-900"}`}>
                        <p>{msg.content}</p>
                        <p className={`text-xs mt-1 ${msg.senderId === currentUser?.id ? "text-emerald-100" : "text-slate-400"}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  onKeyPress={e => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={sendingMessage || !messageText.trim()}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-all"
                >
                  {sendingMessage ? "..." : "Send"}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={initializeChat}
              className="w-full bg-zinc-900 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-zinc-800"
            >
              Start Chat
            </button>
          )}
        </div>
      )}
    </div>
  );
}
