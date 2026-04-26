"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { getMyRoutes, deleteTransport, updateTransport } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { formatInUserTimezone } from "@/lib/timezone";
import {
  MapPinIcon, PlusIcon, CarIcon, ArrowRightIcon,
  TrashIcon, CalendarIcon, UsersIcon,
} from "@/app/dashboard/_Components/Icons";
import {
  Page, Reveal, PageHeader, EmptyState, SkeletonList, StatusPill,
  PrimaryButton, GhostButton, SurfaceCard, TabFilter, spring,
} from "@/app/dashboard/_Components/ui";

type RouteStatus = "ACTIVE" | "INACTIVE" | "FULL";

const statusTone: Record<string, "emerald" | "slate" | "orange"> = {
  ACTIVE: "emerald",
  INACTIVE: "slate",
  FULL: "orange",
};

// Lifecycle buckets keyed off maxReachDateTime — once a route's arrival
// window closes, it goes either to MAX_TIME_ENDED (no traveler ever booked)
// or DONE (had bookings). UPCOMING covers everything still relevant: not
// yet departed plus already in transit but not yet at destination.
type RouteBucket = "UPCOMING" | "MAX_TIME_ENDED" | "DONE";
const ROUTE_BUCKETS: readonly RouteBucket[] = ["UPCOMING", "MAX_TIME_ENDED", "DONE"] as const;
const ROUTE_BUCKET_LABELS: Record<RouteBucket, string> = {
  UPCOMING: "UPCOMING",
  MAX_TIME_ENDED: "MAX TIME ENDED",
  DONE: "COMPLETED",
};

function bucketOf(route: any, now: number): RouteBucket {
  const maxReach = new Date(route.maxReachDateTime).getTime();
  const stats = route.bookingStats ?? { pending: 0, confirmed: 0, inProgress: 0, completed: 0, cancelled: 0 };
  // "Active" = anything still in flight. PENDING / CONFIRMED / IN_PROGRESS
  // all count; COMPLETED + CANCELLED don't (the trip is over for that
  // booking). _count.bookings includes cancelled rows so we can't reuse
  // it for this check.
  const activeBookings = stats.pending + stats.confirmed + stats.inProgress;
  const everHadBooking = activeBookings + stats.completed > 0;

  // Time window closed → either DONE (someone actually rode) or
  // MAX_TIME_ENDED (window expired with no real bookings — purely
  // cancelled routes count as "no real bookings" because nobody traveled).
  if (maxReach <= now) {
    return everHadBooking ? "DONE" : "MAX_TIME_ENDED";
  }

  // Time still open but every booking is finished or was cancelled —
  // the route has effectively run its course early. Move it to DONE so
  // it doesn't keep cluttering Upcoming.
  if (activeBookings === 0 && stats.completed > 0) {
    return "DONE";
  }

  return "UPCOMING";
}

export default function TransporterRoutesPage() {
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [userCountry, setUserCountry] = useState<string | null>(null);
  const [bucket, setBucket] = useState<RouteBucket>("UPCOMING");
  // Inline edit for the group-ride fields. Holds the route currently being
  // edited; null means the modal is closed. We don't open a separate page
  // because there are only two fields — heavy navigation for that is overkill.
  const [editing, setEditing] = useState<any | null>(null);
  const [editMin, setEditMin] = useState("");
  const [editAuto, setEditAuto] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  function openEdit(route: any) {
    setEditing(route);
    setEditMin(String(route.minSeatsToConfirm ?? route.availableSeats ?? 1));
    setEditAuto(!!route.autoConfirmOnFill);
    setEditError(null);
  }

  async function saveEdit() {
    if (!editing) return;
    const cap = editing.availableSeats ?? 0;
    const min = parseInt(editMin, 10);
    if (Number.isNaN(min) || min < 1) {
      setEditError("Minimum seats must be at least 1");
      return;
    }
    if (min > cap) {
      setEditError(`Minimum can't exceed the capacity (${cap})`);
      return;
    }
    setEditSaving(true);
    setEditError(null);
    try {
      const updated = await updateTransport(editing.id, {
        minSeatsToConfirm: min,
        autoConfirmOnFill: editAuto,
      });
      setRoutes((rs) => rs.map((r) => (r.id === editing.id ? { ...r, ...updated } : r)));
      setEditing(null);
    } catch (e) {
      setEditError(e instanceof Error ? e.message : "Could not save");
    } finally {
      setEditSaving(false);
    }
  }

  useEffect(() => {
    getMyRoutes().then(setRoutes).finally(() => setLoading(false));
    // User's profile country drives the timezone for date display below —
    // failures are silent, falls back to the browser default.
    getCurrentUser().then((u) => setUserCountry(u?.country ?? null)).catch(() => {});
  }, []);

  // Listen for booking events broadcast by useChat. When a traveler books
  // (or cancels) one of this transporter's routes, refetch so the seat
  // count + group-ride filling meter update without a manual reload.
  useEffect(() => {
    const handler = (ev: Event) => {
      const detail = (ev as CustomEvent).detail;
      if (!detail) return;
      const t = detail.type as string;
      if (
        t === 'booking' ||
        t === 'booking_cancelled' ||
        t === 'booking_paid' ||
        t === 'booking_arrival_confirmed' ||
        t === 'booking_completion_requested'
      ) {
        getMyRoutes().then(setRoutes).catch(() => { /* network blip; silent */ });
      }
    };
    window.addEventListener('smatway:notification', handler);
    return () => window.removeEventListener('smatway:notification', handler);
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this route? All bookings will be cancelled.")) return;
    setDeleting(id);
    try {
      await deleteTransport(id);
      setRoutes((r) => r.filter((t) => t.id !== id));
    } finally {
      setDeleting(null);
    }
  }

  // Bucket the routes once and reuse for filter + counts so we never disagree
  // on what's in each tab.
  const now = Date.now();
  const counts: Record<RouteBucket, number> = { UPCOMING: 0, MAX_TIME_ENDED: 0, DONE: 0 };
  for (const r of routes) counts[bucketOf(r, now)] += 1;
  const visibleRoutes = routes.filter((r) => bucketOf(r, now) === bucket);

  const totalBookings = routes.reduce((s, r) => s + (r._count?.bookings || 0), 0);

  return (
    <Page>
      <PageHeader
        kicker={`${totalBookings} total ${totalBookings === 1 ? "booking" : "bookings"}`}
        title="Routes"
        subtitle="Each route is a scheduled trip travelers can book. Keep them fresh and retire routes that have passed."
        action={
          <PrimaryButton href="/dashboard/routes/add" icon={<PlusIcon className="w-4 h-4" />}>
            Create route
          </PrimaryButton>
        }
      />

      {!loading && routes.length > 0 && (
        <Reveal className="mb-6">
          <TabFilter<RouteBucket>
            tabs={ROUTE_BUCKETS}
            value={bucket}
            onChange={setBucket}
            counts={counts}
            formatLabel={(t) => ROUTE_BUCKET_LABELS[t]}
          />
        </Reveal>
      )}

      {loading ? (
        <SkeletonList count={4} />
      ) : routes.length === 0 ? (
        <EmptyState
          title="No routes yet"
          description="Create your first route to start accepting bookings from travelers."
          ctaLabel="Create route"
          ctaHref="/dashboard/routes/add"
          icon={<MapPinIcon className="w-6 h-6" />}
        />
      ) : visibleRoutes.length === 0 ? (
        <EmptyState
          title={
            bucket === "UPCOMING"
              ? "No upcoming routes"
              : bucket === "MAX_TIME_ENDED"
              ? "No expired routes without travelers"
              : "No completed routes yet"
          }
          description={
            bucket === "UPCOMING"
              ? "Create a new route to start accepting bookings from travelers."
              : bucket === "MAX_TIME_ENDED"
              ? "All your past trips had at least one traveler — nice."
              : "Once a route's window closes with bookings on it, it'll show up here."
          }
          ctaLabel={bucket === "UPCOMING" ? "Create route" : undefined}
          ctaHref={bucket === "UPCOMING" ? "/dashboard/routes/add" : undefined}
          icon={<MapPinIcon className="w-6 h-6" />}
        />
      ) : (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.04 } } }}
          className="grid grid-cols-1 gap-3"
        >
          {visibleRoutes.map((route) => {
            const dep = new Date(route.departureDateTime);
            const expired = new Date(route.maxReachDateTime) < new Date();
            const label =
              route.status === "INACTIVE"
                ? route.vehicle?.deleted
                  ? "Vehicle removed"
                  : expired
                  ? "Expired"
                  : "Inactive"
                : route.status;
            const bookings = route._count?.bookings ?? 0;
            const seats = route.availableSeats ?? 0;

            return (
              <SurfaceCard key={route.id}>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-3 sm:p-5">
                  {/* Image — shorter on mobile so the card overall is less tall. */}
                  <div className="sm:w-32 h-20 sm:h-24 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100 relative">
                    {route.vehicle?.imageUrl ? (
                      <img
                        src={route.vehicle.imageUrl}
                        alt={route.vehicle.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <CarIcon className="w-8 h-8" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Top row: badges on the left, price on the right. Wrapping
                        so a long status pill doesn't push price off-screen on
                        narrow phones. Title now gets the full row width below
                        because price isn't competing for it anymore. */}
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {route.status !== "ACTIVE" && (
                        <StatusPill tone={statusTone[route.status] ?? "slate"} dot={false}>
                          {label}
                        </StatusPill>
                      )}
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200">
                        {route.transportType}
                      </span>
                      <span className="ml-auto text-[14px] sm:text-[15px] font-semibold text-zinc-950 tabular-nums shrink-0">
                        ${Number(route.price).toFixed(2)}
                        <span className="text-[10px] font-normal text-slate-400 ml-0.5">/seat</span>
                      </span>
                    </div>

                    <h3 className="text-[15px] font-semibold text-zinc-950 flex items-center gap-2 flex-wrap">
                      <span>{route.departureCity}</span>
                      <ArrowRightIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span>{route.destinationCity}</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {route.departureCountry} → {route.destinationCountry}
                    </p>

                    {/* Meta row — date/time rendered in the user's profile-country
                        timezone so a Pakistan-based transporter sees Karachi time
                        even if their browser is in another zone. */}
                    <div className="flex items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 mt-2 flex-wrap">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                        {formatInUserTimezone(dep, userCountry, { dateStyle: "medium" })}
                        {" at "}
                        {formatInUserTimezone(dep, userCountry, { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <UsersIcon className="w-3.5 h-3.5 text-slate-400" />
                        {seats} seats left
                      </span>
                      <span className="font-medium text-emerald-700">
                        {bookings} {bookings === 1 ? "booking" : "bookings"}
                      </span>
                      {/* Group-ride pill — same shape as the traveler card.
                          Hides once the threshold is hit. */}
                      {(() => {
                        const min = route.minSeatsToConfirm as number | null | undefined;
                        const filled = (route.filledSeats as number | undefined) ?? 0;
                        if (!min || filled >= min) return null;
                        const pct = Math.min(100, Math.round((filled / min) * 100));
                        return (
                          <span
                            className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 pl-2 pr-2.5 py-1 text-[10px] font-semibold text-slate-700"
                            title={`Trip runs once ${min} seats are booked${route.autoConfirmOnFill ? " — auto-confirms" : ""}`}
                          >
                            <span className="relative inline-block w-7 h-1 rounded-full bg-slate-200 overflow-hidden">
                              <span
                                className="absolute inset-y-0 left-0 bg-slate-700 transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </span>
                            <span className="tabular-nums">{filled}/{min} filling</span>
                          </span>
                        );
                      })()}
                    </div>

                    {/* Buttons wrap on narrow phones so Delete never gets
                        clipped. Tighter top margin + gap on mobile. */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      <GhostButton
                        href={`/dashboard/routes/${route.id}/bookings`}
                        tone="emerald"
                      >
                        View bookings
                      </GhostButton>
                      {/* Edit hidden when the route only has 1 seat — the
                          threshold collapses to "1 of 1" and there's
                          nothing meaningful to configure. */}
                      {route.availableSeats > 1 && (
                        <GhostButton onClick={() => openEdit(route)}>
                          Edit group
                        </GhostButton>
                      )}
                      <GhostButton
                        onClick={() => handleDelete(route.id)}
                        disabled={deleting === route.id}
                        tone="red"
                        icon={<TrashIcon className="w-3.5 h-3.5" />}
                      >
                        {deleting === route.id ? "..." : "Delete"}
                      </GhostButton>
                    </div>
                  </div>
                </div>
              </SurfaceCard>
            );
          })}
        </motion.div>
      )}

      {/* Group-ride edit modal */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setEditing(null); }}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={spring}
              className="w-full max-w-md rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-slate-100">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Group ride</div>
                <h3 className="mt-1 text-lg font-semibold text-zinc-950">
                  {editing.departureCity} → {editing.destinationCity}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Capacity {editing.availableSeats} {editing.availableSeats === 1 ? "seat" : "seats"} · {editing.filledSeats ?? 0} filled
                </p>
              </div>
              <div className="px-6 py-5 space-y-4">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Minimum seats to fill
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={editing.availableSeats}
                    value={editMin}
                    onChange={(e) => setEditMin(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                  <p className="mt-1 text-[11px] text-slate-500">
                    Set to {editing.availableSeats} to require all seats filled before the trip runs.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <input
                    id="editAutoConfirm"
                    type="checkbox"
                    checked={editAuto}
                    onChange={(e) => setEditAuto(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/20"
                  />
                  <label htmlFor="editAutoConfirm" className="text-sm text-zinc-900 leading-snug">
                    Auto-confirm bookings once the minimum is reached
                    <span className="block text-[11px] text-slate-500 mt-0.5 font-normal">
                      Off = you confirm each booking yourself once the threshold is hit.
                    </span>
                  </label>
                </div>
                {editError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {editError}
                  </div>
                )}
              </div>
              <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  disabled={editSaving}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveEdit}
                  disabled={editSaving}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-zinc-950 text-white hover:bg-zinc-800 disabled:opacity-50"
                >
                  {editSaving ? "Saving…" : "Save"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Page>
  );
}
