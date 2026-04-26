"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createTransport, getMyVehicles, getMyRoutes } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { toLocalDateTimeInput, addDays } from "@/lib/dateInput";
import { CarIcon, ChevronDownIcon } from "@/app/dashboard/_Components/Icons";

// Routes can't be scheduled further than this many days out — keeps the
// schedule fresh and the listings page from filling up with far-future trips.
const MAX_DAYS_AHEAD = 3;

type RouteForm = {
  departureCountry: string;
  departureCity: string;
  destinationCountry: string;
  destinationCity: string;
  price: string;
  currency: string;
  availableSeats: string;
  departureDateTime: string;
  maxReachDateTime: string;
  vehicleId: string;
  // Group-ride threshold. Empty string = "no minimum, behaves like a
  // single booking confirms one seat" (legacy). When set, traveler payments
  // are gated until this many seats fill across the route.
  minSeatsToConfirm: string;
  autoConfirmOnFill: boolean;
};

export default function AddRoutePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [error, setError] = useState("");
  const [vehicles, setVehicles] = useState<any[]>([]);
  // Active-route pre-check. The backend enforces "one active route per
  // transporter" but the UI surfaces it up-front so the transporter
  // doesn't fill the whole form just to get rejected on submit.
  const [activeRoute, setActiveRoute] = useState<any | null>(null);
  const [activeRouteLoading, setActiveRouteLoading] = useState(true);
  const [form, setForm] = useState<RouteForm>({
    departureCountry: "",
    departureCity: "",
    destinationCountry: "",
    destinationCity: "",
    price: "",
    currency: "",
    availableSeats: "",
    departureDateTime: "",
    maxReachDateTime: "",
    vehicleId: "",
    minSeatsToConfirm: "",
    autoConfirmOnFill: false,
  });

  useEffect(() => {
    (async () => {
      try {
        const user = await getCurrentUser();
        const country = user?.country;
        const pref = user?.preferredCurrency;
        setForm(f => ({
          ...f,
          departureCountry: country ?? f.departureCountry,
          destinationCountry: country ?? f.destinationCountry,
          currency: pref ?? f.currency,
        }));
      } catch (e) {
        // User not loaded
      }
      // Local-time formatting — `toISOString()` would default the inputs to
      // UTC time, which displays as the wrong wall-clock day for any user
      // east or west of UTC.
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      setForm(f => ({
        ...f,
        departureDateTime: toLocalDateTimeInput(now),
        maxReachDateTime: toLocalDateTimeInput(tomorrow),
      }));
      getMyVehicles().then(setVehicles).catch(() => setError("Failed to load vehicles")).finally(() => setVehiclesLoading(false));
      // Same active-route rule the backend enforces: status=ACTIVE,
      // maxReach > now, and at least one non-finished booking (or no
      // bookings at all = "still hoping for one"). If found, the form
      // is replaced with a banner pointing at it.
      getMyRoutes()
        .then((routes) => {
          const now = Date.now();
          const stillActive = routes.find((r: any) => {
            if (r.status !== "ACTIVE") return false;
            if (new Date(r.maxReachDateTime).getTime() <= now) return false;
            const bs = r.bookingStats ?? { pending: 0, confirmed: 0, inProgress: 0, completed: 0 };
            const liveCount = bs.pending + bs.confirmed + bs.inProgress;
            // Open route with no bookings is still "active" — they're
            // hoping for one. Only call it inactive once every booking
            // has finished.
            const hasAnyBooking = liveCount + bs.completed > 0;
            if (!hasAnyBooking) return true;
            return liveCount > 0;
          });
          setActiveRoute(stillActive ?? null);
        })
        .catch(() => { /* silent — backend still enforces */ })
        .finally(() => setActiveRouteLoading(false));
    })();
  }, []);

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-150";

  function set<K extends keyof RouteForm>(field: K, value: RouteForm[K]) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    // Re-check the 7-day cap in JS — `max=` on the input is enforced by the
    // browser but a transporter who edits the value through devtools could
    // bypass it; this catches that path before we hit the API.
    const departureMs = new Date(form.departureDateTime).getTime();
    const cutoffMs = addDays(new Date(), MAX_DAYS_AHEAD).getTime();
    if (departureMs > cutoffMs) {
      setError(`Departure must be within the next ${MAX_DAYS_AHEAD} days.`);
      return;
    }
    // Group-ride threshold default: empty input → minSeatsToConfirm equals
    // capacity, i.e. behaves exactly like the no-group-ride model (the
    // threshold is only "met" when the bus is 100% full, which is the
    // safest default for a transporter who doesn't engage with the new
    // field). Validation: min must be ≥ 1 and ≤ capacity.
    const capacity = parseInt(form.availableSeats);
    let minSeatsToConfirm = form.minSeatsToConfirm.trim()
      ? parseInt(form.minSeatsToConfirm.trim())
      : capacity;
    if (Number.isNaN(minSeatsToConfirm) || minSeatsToConfirm < 1) {
      setError("Minimum seats must be at least 1");
      return;
    }
    if (minSeatsToConfirm > capacity) {
      setError("Minimum seats can't be more than the route capacity");
      return;
    }

    setLoading(true);
    try {
      await createTransport({
        departureCountry: form.departureCountry,
        departureCity: form.departureCity,
        destinationCountry: form.destinationCountry,
        destinationCity: form.destinationCity,
        price: parseFloat(form.price),
        currency: form.currency || undefined,
        availableSeats: capacity,
        departureDateTime: form.departureDateTime,
        maxReachDateTime: form.maxReachDateTime,
        vehicleId: form.vehicleId,
        minSeatsToConfirm,
        autoConfirmOnFill: form.autoConfirmOnFill,
      });
      router.push("/dashboard/routes");
    } catch (e: any) {
      setError(e?.message || "Failed to create route");
    } finally {
      setLoading(false);
    }
  }

  if (vehiclesLoading || activeRouteLoading) {
    return (
      <div className="max-w-2xl">
        <div className="mb-6">
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900">Add New Route</h1>
        </div>
        <div className="text-sm text-slate-400 py-10 text-center">Loading…</div>
      </div>
    );
  }

  // One-active-route lock: when the transporter already has a route in
  // flight, replace the whole form with a banner pointing at it. Saves
  // them filling out a form just to be rejected on submit, and matches
  // the backend's enforcement.
  if (activeRoute) {
    const when = new Date(activeRoute.maxReachDateTime).toLocaleString();
    return (
      <div className="max-w-2xl">
        <div className="mb-6">
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900">Add New Route</h1>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
          <p className="text-sm font-semibold text-amber-900">
            You already have an active route
          </p>
          <p className="text-[13px] text-amber-800 mt-1.5 leading-relaxed">
            <span className="font-semibold">{activeRoute.departureCity} → {activeRoute.destinationCity}</span>
            {" — runs until "}{when}.{" "}
            Wait for it to finish or delete it before creating another.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/dashboard/routes"
              className="text-[12px] font-semibold bg-amber-900 text-white px-4 py-2 rounded-xl hover:bg-amber-950 active:scale-[0.98] transition-all"
            >
              View my routes →
            </Link>
            <Link
              href={`/dashboard/routes/${activeRoute.id}/bookings`}
              className="text-[12px] font-semibold border border-amber-300 text-amber-900 px-4 py-2 rounded-xl hover:bg-amber-100 active:scale-[0.98] transition-all"
            >
              See bookings on this route
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="max-w-2xl">
        <div className="mb-6">
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900">Add New Route</h1>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> You need to add at least one vehicle before creating routes.{" "}
            <a href="/dashboard/vehicles/add" className="underline font-semibold">Add a vehicle first</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900">Add New Route</h1>
        <p className="text-sm text-slate-400 mt-0.5">List your transport route for travelers to book</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 mb-4">Route Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-zinc-900 mb-1.5 block">Departure Country</label>
              <input required type="text" placeholder="e.g. Pakistan" value={form.departureCountry} onChange={e => set("departureCountry", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-900 mb-1.5 block">Departure City</label>
              <input required type="text" placeholder="e.g. Lahore" value={form.departureCity} onChange={e => set("departureCity", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-900 mb-1.5 block">Destination Country</label>
              <input required type="text" placeholder="e.g. Pakistan" value={form.destinationCountry} onChange={e => set("destinationCountry", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-900 mb-1.5 block">Destination City</label>
              <input required type="text" placeholder="e.g. Islamabad" value={form.destinationCity} onChange={e => set("destinationCity", e.target.value)} className={inputClass} />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-zinc-900 mb-4">Vehicle & Pricing</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-zinc-900 mb-1.5 block">Select Vehicle</label>
              <VehiclePicker
                vehicles={vehicles}
                value={form.vehicleId}
                onChange={(id) => set("vehicleId", id)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-900 mb-1.5 block">Available Seats</label>
              <input required type="number" min={1} placeholder="e.g. 12" value={form.availableSeats} onChange={e => set("availableSeats", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-900 mb-1.5 block">
                Price per Seat{form.currency ? ` (${form.currency})` : ""}
              </label>
              <input required type="number" min={0} step="0.01" placeholder={`e.g. ${form.currency === "NGN" ? "12500" : "15.00"}`} value={form.price} onChange={e => set("price", e.target.value)} className={inputClass} />
              <p className="mt-1 text-[11px] text-slate-500">
                Routes are priced in your profile currency ({form.currency || "set on your profile page"}). Change it from <a href="/dashboard/profile" className="underline font-semibold">Profile</a> if you need a different one.
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-900 mb-1.5 block">Departure Date & Time</label>
              {/* Browsers honour `min`/`max` on datetime-local — they grey out
                  picker entries past the limit and reject form submits with
                  out-of-range values. Recomputed on every render so the
                  upper bound stays correct as time passes during the session. */}
              <DateTimeField
                required
                min={toLocalDateTimeInput(new Date())}
                max={toLocalDateTimeInput(addDays(new Date(), MAX_DAYS_AHEAD))}
                value={form.departureDateTime}
                onChange={(v) => set("departureDateTime", v)}
              />
              <p className="mt-1 text-[11px] text-slate-500">
                Routes can only be scheduled up to {MAX_DAYS_AHEAD} days from now. For trips further out, create the route closer to the departure date.
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-900 mb-1.5 block">Max Reach Date & Time</label>
              <DateTimeField
                required
                min={form.departureDateTime || toLocalDateTimeInput(new Date())}
                max={toLocalDateTimeInput(addDays(new Date(), MAX_DAYS_AHEAD + 1))}
                value={form.maxReachDateTime}
                onChange={(v) => set("maxReachDateTime", v)}
              />
            </div>
          </div>
        </div>

        {/* Group ride — only meaningful for routes with more than one
            seat. With capacity = 1 the threshold collapses to "1 of 1"
            and there's nothing to configure, so the section is hidden
            until the transporter sets a real capacity above. */}
        {parseInt(form.availableSeats || "0") > 1 && (
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 mb-1">Group ride</h3>
          <p className="text-[12px] text-slate-500 mb-4">
            Optional. Set a minimum number of seats the trip needs to fill before payment opens for travelers. Leave blank to require all seats — the trip then behaves like a single-booking-per-confirm flow.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-zinc-900 mb-1.5 block">
                Minimum seats to fill
              </label>
              <input
                type="number"
                min={1}
                max={form.availableSeats ? parseInt(form.availableSeats) : undefined}
                placeholder={form.availableSeats || "e.g. 8"}
                value={form.minSeatsToConfirm}
                onChange={e => set("minSeatsToConfirm", e.target.value)}
                className={inputClass}
              />
              <p className="mt-1 text-[11px] text-slate-500">
                {form.availableSeats
                  ? `Up to ${form.availableSeats}. Blank = require all ${form.availableSeats}.`
                  : "Set Available Seats above first."}
              </p>
            </div>
            <div className="flex items-start gap-2 pt-7">
              <input
                id="autoConfirmOnFill"
                type="checkbox"
                checked={form.autoConfirmOnFill}
                onChange={e => set("autoConfirmOnFill", e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/20"
              />
              <label htmlFor="autoConfirmOnFill" className="text-sm text-zinc-900 leading-snug">
                Auto-confirm bookings once the minimum is reached.
                <span className="block text-[11px] text-slate-500 mt-0.5 font-normal">
                  When off, you'll still confirm each booking yourself once the minimum is hit.
                </span>
              </label>
            </div>
          </div>
        </div>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all duration-150">
            {loading ? "Creating..." : "Create Route"}
          </button>
          <button type="button" onClick={() => router.back()} className="border border-slate-200 text-zinc-700 text-sm font-medium px-6 py-2.5 rounded-xl hover:bg-slate-50 transition-all duration-150">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

/**
 * Wraps `<input type="datetime-local">` so the field has:
 *   - identical layout across instances (no native indicator size drift
 *     between Departure / Max Reach on the same screen),
 *   - a tappable calendar button that calls `showPicker()` — on iOS Safari
 *     and a few Android browsers the inline native indicator doesn't
 *     reliably open the picker, so we need our own affordance,
 *   - the entire input acting as a tap target via `showPicker()` on click,
 *     which is what users actually expect on mobile.
 *
 * The native indicator is hidden via the `[&::-webkit-calendar-picker-indicator]`
 * arbitrary variant so we don't end up with two icons stacked.
 */
function DateTimeField({
  value,
  onChange,
  min,
  max,
  required,
}: {
  value: string;
  onChange: (v: string) => void;
  min?: string;
  max?: string;
  required?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  function openPicker() {
    const el = ref.current;
    if (!el) return;
    // Modern browsers (Chrome 99+, Firefox 101+, Safari 16+) expose
    // showPicker(). On older Safari this is undefined — fall back to focus,
    // which on iOS at least pops the wheel picker.
    if (typeof el.showPicker === "function") {
      try { el.showPicker(); return; } catch { /* user activation missing — fallthrough */ }
    }
    el.focus();
  }
  return (
    <div className="relative">
      <input
        ref={ref}
        required={required}
        type="datetime-local"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onClick={openPicker}
        className="w-full rounded-xl border border-slate-200 bg-white pl-3 pr-11 py-2.5 text-[13px] sm:text-sm text-zinc-900 tabular-nums cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-150 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
      />
      <button
        type="button"
        onClick={openPicker}
        aria-label="Open date picker"
        tabIndex={-1}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-lg text-emerald-600 hover:bg-emerald-50 active:bg-emerald-100 transition-colors"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      </button>
    </div>
  );
}

/**
 * Custom vehicle picker — beats the native <select> because it can show
 * the vehicle's image and metadata side-by-side, which is what the
 * transporter actually scans for ("the white van", "the black sedan").
 * Click outside to close, hidden <input required> mirrors the value so
 * the surrounding form's native validation still kicks in.
 */
function VehiclePicker({
  vehicles,
  value,
  onChange,
}: {
  vehicles: any[];
  value: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = vehicles.find((v) => v.id === value);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("mousedown", onDocClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDocClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      {/* Hidden input keeps the parent form's `required` validation
          working — the visible button isn't a form control. */}
      <input
        type="text"
        required
        value={value}
        onChange={() => { /* read-only; updated via the picker */ }}
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
      />
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-left flex items-center gap-3 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
      >
        {selected ? (
          <>
            <VehicleThumb vehicle={selected} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-zinc-900 truncate">
                {selected.name}
                <span className="ml-1.5 text-[11px] font-normal text-slate-500">{selected.model}</span>
              </div>
              <div className="text-[11px] text-slate-500 truncate">
                {selected.transportType} · {selected.plateNumber}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
              <CarIcon className="w-5 h-5" />
            </div>
            <span className="flex-1 text-sm text-slate-400">Choose a vehicle…</span>
          </>
        )}
        <ChevronDownIcon className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-20 left-0 right-0 mt-1.5 rounded-xl border border-slate-200 bg-white shadow-xl ring-1 ring-black/5 overflow-hidden max-h-72 overflow-y-auto">
          {vehicles.length === 0 ? (
            <div className="px-3 py-4 text-center text-sm text-slate-400">No vehicles yet</div>
          ) : (
            vehicles.map((v) => {
              const isSelected = v.id === value;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => { onChange(v.id); setOpen(false); }}
                  className={`w-full px-3 py-2.5 text-left flex items-center gap-3 hover:bg-slate-50 transition-colors ${
                    isSelected ? "bg-emerald-50/60" : ""
                  }`}
                >
                  <VehicleThumb vehicle={v} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-zinc-900 truncate">
                      {v.name}
                      <span className="ml-1.5 text-[11px] font-normal text-slate-500">{v.model}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {v.transportType} · {v.plateNumber}
                    </div>
                  </div>
                  {isSelected && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 shrink-0">
                      Selected
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

function VehicleThumb({ vehicle }: { vehicle: any }) {
  return (
    <div className="w-10 h-10 rounded-lg bg-slate-100 ring-1 ring-slate-200 overflow-hidden shrink-0">
      {vehicle?.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={vehicle.imageUrl} alt={vehicle.name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-slate-400">
          <CarIcon className="w-5 h-5" />
        </div>
      )}
    </div>
  );
}
