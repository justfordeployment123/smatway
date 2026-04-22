"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getMyBookings, cancelBooking, initChat, getMessages, sendMessage } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { useChat } from "@/hooks/useChat";
import io from "socket.io-client";
import { ClockIcon, CheckCircleIcon, MailIcon } from "@/app/dashboard/_Components/Icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  CONFIRMED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-red-50 text-red-600 border-red-200",
};

const paymentColors: Record<string, string> = {
  PENDING: "bg-slate-50 text-slate-500 border-slate-200",
  PAID: "bg-emerald-50 text-emerald-700 border-emerald-200",
  FAILED: "bg-red-50 text-red-600 border-red-200",
};

export default function MyBookingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "CONFIRMED" | "CANCELLED">("ALL");
  const [user, setUser] = useState<any>(null);
  const [chatBookingId, setChatBookingId] = useState<string | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const socketRef = useRef<any>(null);
  const autoOpenedRef = useRef(false);
  const { sendMessage: sendWSMessage, joinChat, leaveChat } = useChat(user?.id);

  useEffect(() => {
    if (chatId && user?.id) {
      if (!socketRef.current) {
        socketRef.current = io(process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3002', {
          query: { userId: user.id },
          reconnection: true,
        });
      }
      const socket = socketRef.current;

      setTimeout(() => {
        socket.emit('join-chat', { chatId });
      }, 100);

      const handleMessage = (message: any) => {
        setChatMessages(prev => [...prev, message]);
      };

      socket.on('message', handleMessage);

      return () => {
        socket.off('message', handleMessage);
      };
    }
  }, [chatId, user?.id]);

  useEffect(() => {
    Promise.all([
      getMyBookings(),
      getCurrentUser()
    ]).then(([bookingsData, userData]) => {
      setBookings(bookingsData);
      setUser(userData);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const bookingIdFromQuery = searchParams.get('openChatBooking');
    if (!bookingIdFromQuery || autoOpenedRef.current || loading) {
      return;
    }

    autoOpenedRef.current = true;
    openChat(bookingIdFromQuery).finally(() => {
      router.replace('/dashboard/my-bookings');
    });
  }, [searchParams, loading]);

  async function handleCancel(id: string) {
    if (!confirm("Cancel this booking?")) return;
    setCancelling(id);
    try {
      const updated = await cancelBooking(id);
      setBookings(bs => bs.map(b => b.id === id ? { ...b, status: updated.status } : b));
    } finally {
      setCancelling(null);
    }
  }

  async function openChat(bookingId: string) {
    setChatBookingId(bookingId);
    setChatLoading(true);
    try {
      const chat = await initChat(bookingId);
      setChatId(chat.id);
      const msgs = await getMessages(chat.id);
      setChatMessages(msgs);
    } catch (e) {
      console.error("Failed to load chat", e);
    } finally {
      setChatLoading(false);
    }
  }

  function closeChat() {
    if (chatId && socketRef.current) {
      socketRef.current.emit('leave-chat', { chatId });
    }
    setChatBookingId(null);
    setChatId(null);
    setMessageText("");
  }

  async function handleSendMessage() {
    if (!messageText.trim() || !chatId || !user?.id) return;
    setSendingMessage(true);
    try {
      if (socketRef.current) {
        socketRef.current.emit('message', { chatId, content: messageText, userId: user.id });
      }
      setMessageText("");
    } catch (e: any) {
      console.error("Failed to send message", e);
    } finally {
      setSendingMessage(false);
    }
  }

  const filteredBookings = filter === "ALL"
    ? bookings
    : bookings.filter(b => b.status === filter);

  const pendingCount = bookings.filter(b => b.status === "PENDING").length;
  const confirmedCount = bookings.filter(b => b.status === "CONFIRMED").length;
  const totalCount = bookings.length;

  const initial = user?.name?.charAt(0).toUpperCase() || "U";

  return (
    <div className="p-4 md:p-0">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-slate-900">My Bookings</h1>
        <p className="text-sm text-slate-600">Track your transport bookings</p>
      </div>

      {/* Stats Cards */}
      {!loading && bookings.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center space-x-3">
              <ClockIcon className="w-8 h-8 text-amber-600" />
              <div>
                <div className="text-2xl font-bold text-slate-900">{pendingCount}</div>
                <div className="text-sm text-slate-600">Pending</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center space-x-3">
              <CheckCircleIcon className="w-8 h-8 text-emerald-600" />
              <div>
                <div className="text-2xl font-bold text-slate-900">{confirmedCount}</div>
                <div className="text-sm text-slate-600">Confirmed</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center space-x-3">
              <MailIcon className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-slate-900">{totalCount}</div>
                <div className="text-sm text-slate-600">Total Bookings</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and User Info */}
      {!loading && bookings.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex gap-2 flex-wrap">
              {["ALL", "PENDING", "CONFIRMED", "CANCELLED"].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${filter === f
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                >
                  {f}
                </button>
              ))}
            </div>
            {user && (
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8 rounded-lg">
                  {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
                  <AvatarFallback className="rounded-lg bg-linear-to-br from-emerald-500 to-teal-600 text-white text-xs font-bold">
                    {initial}
                  </AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <div className="font-medium text-slate-900">{user.name || "User"}</div>
                  <div className="text-xs text-slate-500">Traveler</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-sm text-slate-400 py-10 text-center">Loading bookings...</div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
          <p className="text-sm font-medium text-zinc-900 mb-1">No bookings yet</p>
          <p className="text-sm text-slate-400 mb-4">Search for routes and book your first ride.</p>
          <Link href="/dashboard" className="inline-flex text-sm font-semibold text-emerald-600 underline">Search Routes →</Link>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
          <p className="text-sm font-medium text-zinc-900 mb-1">No {filter.toLowerCase()} bookings</p>
          <p className="text-sm text-slate-400">Try changing the filter to see other bookings.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map(booking => {
            const dep = new Date(booking.transport.departureDateTime);
            const vehicle = booking.transport.vehicle;
            return (
              <div key={booking.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    {vehicle?.imageUrl && (
                      <div className="hidden sm:block sm:w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100">
                        <img src={vehicle.imageUrl} alt={vehicle.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${statusColors[booking.status]}`}>{booking.status}</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${paymentColors[booking.paymentStatus]}`}>Payment: {booking.paymentStatus}</span>
                        {booking.paymentMethod && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{booking.paymentMethod}</span>
                        )}
                      </div>
                      <h3 className="font-semibold text-zinc-900 text-sm">
                        {booking.transport.departureCity}, {booking.transport.departureCountry} → {booking.transport.destinationCity}, {booking.transport.destinationCountry}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {dep.toLocaleDateString()} at {dep.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · {booking.transport.vehicleModel}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {booking.seatsBooked} seat{booking.seatsBooked > 1 ? "s" : ""} · Total: ${Number(booking.totalPrice).toFixed(2)}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">Ref: #{booking.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Link href={`/dashboard/traveler/booking/${booking.id}`} className="text-xs border border-slate-200 px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-50 transition-all">
                        Details
                      </Link>
                      {booking.status === "CONFIRMED" && (
                        <button
                          onClick={() => openChat(booking.id)}
                          className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-all"
                        >
                          Chat
                        </button>
                      )}
                      {booking.status !== "CANCELLED" && (
                        <button
                          onClick={() => handleCancel(booking.id)}
                          disabled={cancelling === booking.id}
                          className="text-xs border border-red-200 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all disabled:opacity-50"
                        >
                          {cancelling === booking.id ? "..." : "Cancel"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Chat Modal */}
      {chatBookingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-zinc-900">Chat</h3>
              <button onClick={closeChat} className="text-2xl text-slate-400 hover:text-slate-600">×</button>
            </div>
            {chatLoading ? (
              <div className="p-8 text-center text-slate-400">Loading...</div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                  {chatMessages.length === 0 ? (
                    <div className="text-center text-sm text-slate-400 mt-8">No messages yet. Start the conversation!</div>
                  ) : (
                    chatMessages.map((msg: any, i: number) => (
                      <div key={i} className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${msg.senderId === user?.id ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-900'}`}>
                          <p>{msg.content}</p>
                          <p className={`text-xs mt-1 ${msg.senderId === user?.id ? 'text-emerald-100' : 'text-slate-400'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-4 border-t border-slate-200 flex gap-2">
                  <input
                    type="text"
                    value={messageText}
                    onChange={e => setMessageText(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={sendingMessage || !messageText.trim()}
                    className="bg-emerald-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-all"
                  >
                    {sendingMessage ? "..." : "Send"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
