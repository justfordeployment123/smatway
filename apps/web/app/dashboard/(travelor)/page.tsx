"use client";

import { useState, useEffect } from "react";
import { searchTransports, createBooking } from "@/lib/api";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

const transportTypes = ["All Types", "CAR", "BUS", "VAN", "MINIBUS", "TRUCK"];

function EmptyIllustration() {
  return (
    <svg width="120" height="100" viewBox="0 0 184 152" xmlns="http://www.w3.org/2000/svg">
      <title>No results</title>
      <g fill="none" fillRule="evenodd">
        <g transform="translate(24 31.67)">
          <ellipse fillOpacity=".8" fill="#F5F5F7" cx="67.797" cy="106.89" rx="67.797" ry="12.668" />
          <path d="M122.034 69.674L98.109 40.229c-1.148-1.386-2.826-2.225-4.593-2.225h-51.44c-1.766 0-3.444.839-4.592 2.225L13.56 69.674v15.383h108.475V69.674z" fill="#AEB8C2" />
          <path d="M33.83 0h67.933a4 4 0 0 1 4 4v93.344a4 4 0 0 1-4 4H33.83a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4z" fill="#F5F5F7" />
          <path d="M121.813 105.032c-.775 3.071-3.497 5.36-6.735 5.36H20.515c-3.238 0-5.96-2.29-6.734-5.36a7.309 7.309 0 0 1-.222-1.79V69.675h26.318c2.907 0 5.25 2.448 5.25 5.42v.04c0 2.971 2.37 5.37 5.277 5.37h34.785c2.907 0 5.277-2.421 5.277-5.393V75.1c0-2.972 2.343-5.426 5.25-5.426h26.318v33.569c0 .617-.077 1.216-.221 1.789z" fill="#DCE0E6" />
        </g>
      </g>
    </svg>
  );
}

export default function SearchRidesPage() {
  const [depCountry, setDepCountry] = useState("");
  const [depCity, setDepCity] = useState("");
  const [destCountry, setDestCountry] = useState("");
  const [destCity, setDestCity] = useState("");
  const [transportType, setTransportType] = useState("All Types");
  const [date, setDate] = useState("");
  const [results, setResults] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const user = await getCurrentUser();
        if (user?.country) {
          setDepCountry(user.country);
          setDestCountry(user.country);
        }
        const today = new Date().toISOString().split('T')[0];
        setDate(today);
      } catch (e) {
        // User not loaded or unauthorized
      }
    })();
  }, []);

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-150";

  async function handleSearch() {
    setLoading(true);
    setError("");
    try {
      const data = await searchTransports({
        departureCountry: depCountry || undefined,
        departureCity: depCity || undefined,
        destinationCountry: destCountry || undefined,
        destinationCity: destCity || undefined,
        transportType: transportType !== "All Types" ? transportType : undefined,
        date: date || undefined,
      });
      setResults(data);
    } catch {
      setError("Failed to search routes. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900">Available Rides</h1>
        <p className="text-sm text-slate-400 mt-0.5">Search routes by location and transport type</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
        <h3 className="text-sm font-semibold text-zinc-900 mb-5">Search Routes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
          <div>
            <label className="text-sm font-medium text-zinc-900 mb-1.5 block">Departure Country</label>
            <input type="text" placeholder="e.g. Pakistan" value={depCountry} onChange={e => setDepCountry(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-900 mb-1.5 block">Departure City</label>
            <input type="text" placeholder="e.g. Lahore" value={depCity} onChange={e => setDepCity(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-900 mb-1.5 block">Destination Country</label>
            <input type="text" placeholder="e.g. Pakistan" value={destCountry} onChange={e => setDestCountry(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-900 mb-1.5 block">Destination City</label>
            <input type="text" placeholder="e.g. Islamabad" value={destCity} onChange={e => setDestCity(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-900 mb-1.5 block">Transport Type</label>
            <div className="relative">
              <select value={transportType} onChange={e => setTransportType(e.target.value)} className={`${inputClass} appearance-none pr-9 cursor-pointer`}>
                {transportTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
              </span>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-900 mb-1.5 block">Date (optional)</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClass} />
          </div>
        </div>
        {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
        <button
          type="button"
          onClick={handleSearch}
          disabled={loading}
          className="bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white text-sm font-semibold px-8 py-2.5 rounded-xl transition-all duration-150 active:scale-[0.98]"
        >
          {loading ? "Searching..." : "Search Routes"}
        </button>
      </div>

      {results === null ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <EmptyIllustration />
          <p className="text-sm font-medium text-zinc-900 mt-4">No routes yet</p>
          <p className="text-sm text-slate-400 max-w-xs mt-1">Enter your departure and destination above, then click &ldquo;Search Routes&rdquo; to find available rides.</p>
        </div>
      ) : results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <EmptyIllustration />
          <p className="text-sm font-medium text-zinc-900 mt-4">No routes found</p>
          <p className="text-sm text-slate-400 max-w-xs mt-1">Try adjusting your search criteria or check back later.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map(transport => (
            <TransportCard key={transport.id} transport={transport} />
          ))}
        </div>
      )}
    </div>
  );
}

function TransportCard({ transport }: { transport: any }) {
  const [booking, setBooking] = useState(false);
  const [seats, setSeats] = useState(1);
  const [booked, setBooked] = useState<any>(null);
  const [error, setError] = useState("");

  async function handleBook() {
    setBooking(true);
    setError("");
    try {
      const result = await createBooking({ transportId: transport.id, seatsBooked: seats });
      setBooked(result);
    } catch (e: any) {
      setError(e?.message || "Booking failed");
    } finally {
      setBooking(false);
    }
  }

  const dep = new Date(transport.departureDateTime);
  const maxReach = new Date(transport.maxReachDateTime);
  const vehicle = transport.vehicle;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          {vehicle?.imageUrl && (
            <div className="hidden sm:block sm:w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100">
              <img src={vehicle.imageUrl} alt={vehicle.name} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">{vehicle?.transportType || "UNKNOWN"}</span>
              <span className="text-xs text-slate-400">{vehicle?.model || "Unknown"} · {vehicle?.plateNumber || "N/A"}</span>
            </div>
            <h3 className="font-semibold text-zinc-900 text-sm">
              {transport.departureCity}, {transport.departureCountry} → {transport.destinationCity}, {transport.destinationCountry}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {dep.toLocaleDateString()} at {dep.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · {transport.availableSeats} seats left
            </p>
            <p className="text-xs text-slate-500">Reaches by: {maxReach.toLocaleDateString()} at {maxReach.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
            <p className="text-xs text-slate-500">{vehicle?.name} · Transporter: {transport.transporter?.name || "Unknown"}</p>
          </div>
          <div className="flex flex-col items-end gap-2 min-w-[140px]">
            <p className="text-lg font-bold text-zinc-900">${Number(transport.price).toFixed(2)}<span className="text-xs font-normal text-slate-400">/seat</span></p>
            {booked ? (
              <Link href={`/dashboard/traveler/booking/${booked.id}`} className="text-xs text-emerald-600 font-semibold underline">View Booking →</Link>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="number" min={1} max={transport.availableSeats} value={seats}
                  onChange={e => setSeats(Number(e.target.value))}
                  className="w-14 text-center rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                />
                <button
                  onClick={handleBook}
                  disabled={booking || transport.availableSeats === 0}
                  className="bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-all"
                >
                  {booking ? "..." : "Book"}
                </button>
              </div>
            )}
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
