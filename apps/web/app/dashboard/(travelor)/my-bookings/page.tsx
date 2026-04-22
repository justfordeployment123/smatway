"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMyBookings, cancelBooking } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
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
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "CONFIRMED" | "CANCELLED">("ALL");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      getMyBookings(),
      getCurrentUser()
    ]).then(([bookingsData, userData]) => {
      setBookings(bookingsData);
      setUser(userData);
    }).finally(() => setLoading(false));
  }, []);

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
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    filter === f
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
    </div>
  );
}
