"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getTransportBookings } from "@/lib/api";
import Link from "next/link";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  CONFIRMED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-red-50 text-red-600 border-red-200",
};

export default function RouteBookingsPage() {
  const { id } = useParams<{ id: string }>();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getTransportBookings(id).then(setBookings).catch(() => setError("Failed to load bookings")).finally(() => setLoading(false));
  }, [id]);

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
          {bookings.map(booking => (
            <div key={booking.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${statusColors[booking.status]}`}>{booking.status}</span>
                  </div>
                  <p className="font-semibold text-zinc-900 text-sm">{booking.traveler?.name || "Unknown Traveler"}</p>
                  <p className="text-xs text-slate-500">{booking.traveler?.email} · {booking.traveler?.phoneNumber || "No phone"}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{booking.seatsBooked} seat{booking.seatsBooked > 1 ? "s" : ""} · ${Number(booking.totalPrice).toFixed(2)}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Ref: #{booking.id.slice(0, 8).toUpperCase()} · Booked {new Date(booking.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Payment</p>
                  <p className="text-sm font-semibold text-zinc-900">{booking.paymentStatus}</p>
                  {booking.paymentMethod && <p className="text-xs text-slate-500">{booking.paymentMethod}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
