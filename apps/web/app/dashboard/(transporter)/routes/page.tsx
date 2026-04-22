"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMyRoutes, deleteTransport, getTransportBookings } from "@/lib/api";

const statusColors: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  INACTIVE: "bg-slate-50 text-slate-500 border-slate-200",
  FULL: "bg-orange-50 text-orange-600 border-orange-200",
};

export default function TransporterRoutesPage() {
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    getMyRoutes().then(setRoutes).finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this route? All bookings will be cancelled.")) return;
    setDeleting(id);
    try {
      await deleteTransport(id);
      setRoutes(r => r.filter(t => t.id !== id));
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="p-4 md:p-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">My Routes</h1>
          <p className="text-sm md:text-base text-slate-600">Manage your transportation routes</p>
        </div>
        <Link
          href="/dashboard/routes/add"
          className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-all w-full sm:w-auto justify-center"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Route
        </Link>
      </div>

      {loading ? (
        <div className="text-sm text-slate-400 py-10 text-center">Loading routes...</div>
      ) : routes.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
          <p className="text-sm font-medium text-zinc-900 mb-1">No routes yet</p>
          <p className="text-sm text-slate-400 mb-4">Add your first route to start accepting bookings.</p>
          <Link href="/dashboard/routes/add" className="inline-flex text-sm font-semibold text-emerald-600 underline">Add Route →</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {routes.map(route => {
            const dep = new Date(route.departureDateTime);
            return (
              <div key={route.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    {route.vehicle?.imageUrl && (
                      <div className="hidden sm:block sm:w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100">
                        <img src={route.vehicle.imageUrl} alt={route.vehicle.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${statusColors[route.status]}`}>
                        {route.status === "INACTIVE"
                          ? (route.vehicle?.deleted ? "Vehicle Deleted" : new Date(route.maxReachDateTime) < new Date() ? "Expired" : "Inactive")
                          : route.status}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{route.transportType}</span>
                    </div>
                    <h3 className="font-semibold text-zinc-900 text-sm">
                      {route.departureCity}, {route.departureCountry} → {route.destinationCity}, {route.destinationCountry}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {dep.toLocaleDateString()} at {dep.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · {route.vehicleModel} · {route.vehiclePlateNumber}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      ${Number(route.price).toFixed(2)}/seat · {route.availableSeats} seats left · {route._count?.bookings ?? 0} bookings
                    </p>
                  </div>
                    <div className="flex gap-2">
                      <Link href={`/dashboard/routes/${route.id}/bookings`} className="text-xs border border-slate-200 px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-50 transition-all">
                        Bookings
                      </Link>
                      <button
                        onClick={() => handleDelete(route.id)}
                        disabled={deleting === route.id}
                        className="text-xs border border-red-200 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all disabled:opacity-50"
                      >
                        {deleting === route.id ? "..." : "Delete"}
                      </button>
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
