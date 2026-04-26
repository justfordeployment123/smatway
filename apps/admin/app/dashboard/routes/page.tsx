"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Page, PageHeader, Card, Skeleton, ErrorState, EmptyState, StatusPill, SecondaryButton, TabFilter } from "@/app/_Components/ui";
import { DateSelect } from "@/app/_Components/DateSelect";
import { SearchIcon, MapPinIcon } from "@/app/_Components/Icons";
import {
  listAdminRoutes, deactivateAdminRoute, activateAdminRoute, AdminRouteRow,
} from "@/lib/api";
import { adminCan, getAdminProfile } from "@/lib/auth";
import { ADMIN_PERMISSIONS } from "@/lib/permissions";
import { formatMoney } from "@/lib/format";

const ROUTE_STATUS_TABS = ["", "ACTIVE", "INACTIVE", "FULL"] as const;
type RouteStatusTab = (typeof ROUTE_STATUS_TABS)[number];
const ROUTE_STATUS_LABELS: Record<RouteStatusTab, string> = {
  "": "ALL",
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  FULL: "FULL",
};

// Lifecycle buckets keyed off the route's max-reach time. MAX_TIME_ENDED is
// the "no traveler booked before the window closed" review bucket — admins
// use it to flag routes that flopped.
const ROUTE_BUCKET_TABS = ["", "UPCOMING", "MAX_TIME_ENDED", "DONE"] as const;
type RouteBucketTab = (typeof ROUTE_BUCKET_TABS)[number];
const ROUTE_BUCKET_LABELS: Record<RouteBucketTab, string> = {
  "": "ALL",
  UPCOMING: "UPCOMING",
  MAX_TIME_ENDED: "MAX TIME ENDED",
  DONE: "COMPLETED",
};

function bucketOf(route: AdminRouteRow, now: number): "UPCOMING" | "MAX_TIME_ENDED" | "DONE" {
  const maxReach = new Date(route.maxReachDateTime).getTime();
  if (maxReach > now) return "UPCOMING";
  return (route._count?.bookings ?? 0) === 0 ? "MAX_TIME_ENDED" : "DONE";
}

// Date range buckets — same set as the admin bookings page so the UX is
// consistent. Routes filter on `departureDateTime` (when the trip is) since
// "today / this week" is the meaningful window for trip-planning views.
const RANGE_TABS = ["", "TODAY", "WEEK", "MONTH", "CUSTOM"] as const;
type RangeTab = (typeof RANGE_TABS)[number];
const RANGE_LABELS: Record<RangeTab, string> = {
  "": "ALL TIME",
  TODAY: "TODAY",
  WEEK: "THIS WEEK",
  MONTH: "THIS MONTH",
  CUSTOM: "CUSTOM",
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

interface CustomDate { year?: number; month?: number; day?: number }

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

/**
 * Convert range + (optionally) custom date to ISO `from`/`to` boundaries.
 * Mirrors the bookings page WEEK = Mon→Sun calendar week, MONTH = 1st→last.
 * CUSTOM honors partial selections (year only, year+month, full y/m/d).
 */
function rangeBoundaries(r: RangeTab, custom?: CustomDate): { from?: string; to?: string } {
  if (r === "") return {};
  if (r === "CUSTOM") {
    if (!custom?.year) return {};
    const y = custom.year;
    const hasMonth = custom.month != null;
    const hasDay = hasMonth && custom.day != null;
    const monthIdx = hasMonth ? custom.month! : 0;
    const dayIdx = hasDay ? custom.day! : 1;
    const from = new Date(y, monthIdx, dayIdx, 0, 0, 0, 0);
    const to = hasDay
      ? new Date(y, monthIdx, dayIdx + 1, 0, 0, 0, 0)
      : hasMonth
      ? new Date(y, monthIdx + 1, 1, 0, 0, 0, 0)
      : new Date(y + 1, 0, 1, 0, 0, 0, 0);
    return { from: from.toISOString(), to: to.toISOString() };
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (r === "TODAY") {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return { from: today.toISOString(), to: tomorrow.toISOString() };
  }
  if (r === "WEEK") {
    const offsetToMonday = (today.getDay() + 6) % 7;
    const from = new Date(today);
    from.setDate(from.getDate() - offsetToMonday);
    const to = new Date(from);
    to.setDate(to.getDate() + 7);
    return { from: from.toISOString(), to: to.toISOString() };
  }
  if (r === "MONTH") {
    const from = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0);
    const to = new Date(today.getFullYear(), today.getMonth() + 1, 1, 0, 0, 0, 0);
    return { from: from.toISOString(), to: to.toISOString() };
  }
  return {};
}

export default function RoutesPage() {
  const router = useRouter();
  const [rows, setRows] = useState<AdminRouteRow[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<RouteStatusTab>("");
  const [bucket, setBucket] = useState<RouteBucketTab>("");
  const [range, setRange] = useState<RangeTab>("");
  const [custom, setCustom] = useState<CustomDate>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const canEdit = adminCan(getAdminProfile(), ADMIN_PERMISSIONS.ROUTES_EDIT);

  // Wipe stored y/m/d when leaving CUSTOM so re-opening it later starts fresh
  // instead of silently re-applying yesterday's selection.
  useEffect(() => {
    if (range !== "CUSTOM" && (custom.year || custom.month != null || custom.day != null)) {
      setCustom({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  function load(reset = true) {
    if (reset) { setLoading(true); setRows([]); setNextCursor(null); } else { setLoadingMore(true); }
    setError(null);
    const { from, to } = rangeBoundaries(range, custom);
    listAdminRoutes({
      search: search || undefined,
      status: status || undefined,
      from,
      to,
      cursor: reset ? undefined : nextCursor ?? undefined,
    })
      .then((res) => {
        setRows((prev) => (reset ? res.routes : [...prev, ...res.routes]));
        setNextCursor(res.nextCursor);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load routes"))
      .finally(() => { setLoading(false); setLoadingMore(false); });
  }

  useEffect(() => { load(true); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [status, range, custom]);

  async function toggle(r: AdminRouteRow) {
    setBusyId(r.id);
    try {
      if (r.status === "ACTIVE") {
        await deactivateAdminRoute(r.id);
        setRows((prev) => prev.map((x) => x.id === r.id ? { ...x, status: "INACTIVE" } : x));
      } else {
        await activateAdminRoute(r.id);
        setRows((prev) => prev.map((x) => x.id === r.id ? { ...x, status: "ACTIVE" } : x));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setBusyId(null);
    }
  }

  // Bucket filtering happens client-side over the loaded page since the
  // backend doesn't accept a date+booking-count predicate yet. Matches the
  // transporter-side bucket logic for consistency.
  const now = Date.now();
  const visibleRows = bucket === "" ? rows : rows.filter((r) => bucketOf(r, now) === bucket);

  return (
    <Page className="space-y-6">
      <PageHeader kicker="Mobility" title="Routes" subtitle="Every transport listed on the platform." />

      <Card className="space-y-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 mb-1.5">Status</p>
          <TabFilter<RouteStatusTab> tabs={ROUTE_STATUS_TABS} value={status} onChange={setStatus} formatLabel={(t) => ROUTE_STATUS_LABELS[t]} />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 mb-1.5">Stage</p>
          <TabFilter<RouteBucketTab> tabs={ROUTE_BUCKET_TABS} value={bucket} onChange={setBucket} formatLabel={(t) => ROUTE_BUCKET_LABELS[t]} />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 mb-1.5">Date</p>
          <TabFilter<RangeTab>
            tabs={RANGE_TABS}
            value={range}
            onChange={setRange}
            formatLabel={(t) => RANGE_LABELS[t]}
          />
          {range === "CUSTOM" && <CustomDatePicker value={custom} onChange={setCustom} />}
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <SearchIcon className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search by city or country…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") load(true); }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <SecondaryButton onClick={() => load(true)}>Search</SecondaryButton>
        </div>
      </Card>

      {error && <ErrorState message={error} onRetry={() => load(true)} />}

      <Card className="!p-0 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState icon={<MapPinIcon />} title="No routes yet" description="Routes posted by transporters will appear here." />
        ) : visibleRows.length === 0 ? (
          <EmptyState
            icon={<MapPinIcon />}
            title={
              bucket === "MAX_TIME_ENDED"
                ? "No expired routes without travelers"
                : bucket === "DONE"
                ? "No completed routes loaded"
                : bucket === "UPCOMING"
                ? "No upcoming routes loaded"
                : "No routes match"
            }
            description="Try a different filter, or load more rows below to widen the search."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/50 text-[11px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold">Route</th>
                  <th className="text-left px-5 py-3 font-semibold">Transporter</th>
                  <th className="text-left px-5 py-3 font-semibold">Status</th>
                  <th className="text-right px-5 py-3 font-semibold">Price</th>
                  <th className="text-right px-5 py-3 font-semibold">Seats</th>
                  <th className="text-right px-5 py-3 font-semibold">Bookings</th>
                  <th className="text-right px-5 py-3 font-semibold">Departs</th>
                  {canEdit && <th className="text-right px-5 py-3 font-semibold">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleRows.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => router.push(`/dashboard/routes/${r.id}`)}
                    className="hover:bg-slate-50/80 cursor-pointer"
                  >
                    <td className="px-5 py-3">
                      <div className="font-semibold text-zinc-950">{r.departureCity} → {r.destinationCity}</div>
                      <div className="text-[11px] text-slate-500">{r.departureCountry} → {r.destinationCountry}</div>
                    </td>
                    <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                      {r.transporter ? (
                        <Link href={`/dashboard/users/${r.transporter.id}`} className="text-sm text-zinc-900 hover:text-emerald-700">
                          {r.transporter.name || r.transporter.email}
                        </Link>
                      ) : <span className="text-sm">—</span>}
                      {r.vehicle ? (
                        <Link href={`/dashboard/vehicles/${r.vehicle.id}`} className="block text-[11px] text-slate-500 hover:text-emerald-700 truncate">
                          {r.vehicle.name}
                        </Link>
                      ) : null}
                    </td>
                    <td className="px-5 py-3">
                      <StatusPill tone={r.status === "ACTIVE" ? "emerald" : r.status === "FULL" ? "yellow" : "slate"}>
                        {r.status}
                      </StatusPill>
                    </td>
                    <td className="px-5 py-3 text-right font-mono tabular-nums">{formatMoney(r.price, r.currency)}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{r.availableSeats}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{r._count.bookings}</td>
                    <td className="px-5 py-3 text-right text-[11px] text-slate-500">
                      {new Date(r.departureDateTime).toLocaleDateString(undefined, { day: "2-digit", month: "short" })}
                    </td>
                    {canEdit && (
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); toggle(r); }}
                          disabled={busyId === r.id}
                          className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 disabled:opacity-60"
                        >
                          {busyId === r.id ? "…" : r.status === "ACTIVE" ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {nextCursor && (
        <div className="text-center">
          <SecondaryButton onClick={() => load(false)} disabled={loadingMore}>
            {loadingMore ? "Loading…" : "Load more"}
          </SecondaryButton>
        </div>
      )}
    </Page>
  );
}

// ─── Custom date picker ──────────────────────────────────────────────────────
// Three styled selects (Year / Month / Day). Year unlocks Month, Month
// unlocks Day. Day options clamp to month length so picking Feb 31 isn't
// possible. Identical to the bookings + audit pickers — kept inline here
// rather than extracted to a shared component for now since each page's
// rangeBoundaries() varies (departureDateTime here, createdAt elsewhere).
function CustomDatePicker({
  value,
  onChange,
}: {
  value: CustomDate;
  onChange: (next: CustomDate) => void;
}) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
  const dayCount = value.year != null && value.month != null
    ? daysInMonth(value.year, value.month)
    : 31;
  const days = Array.from({ length: dayCount }, (_, i) => i + 1);

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <DateSelect
        ariaLabel="Year"
        placeholder="Year"
        value={value.year}
        onChange={(v) => onChange({ ...value, year: v ?? undefined, month: v == null ? undefined : value.month, day: v == null ? undefined : value.day })}
        options={years.map((y) => ({ value: y, label: String(y) }))}
      />
      <DateSelect
        ariaLabel="Month"
        placeholder="Month"
        value={value.month}
        disabled={value.year == null}
        onChange={(v) => {
          const nextMonth = v ?? undefined;
          let nextDay = value.day;
          if (nextMonth != null && value.year != null && nextDay != null) {
            const max = daysInMonth(value.year, nextMonth);
            if (nextDay > max) nextDay = undefined;
          }
          onChange({ ...value, month: nextMonth, day: v == null ? undefined : nextDay });
        }}
        options={MONTH_NAMES.map((name, i) => ({ value: i, label: name }))}
      />
      <DateSelect
        ariaLabel="Day"
        placeholder="Day"
        value={value.day}
        disabled={value.month == null}
        onChange={(v) => onChange({ ...value, day: v ?? undefined })}
        options={days.map((d) => ({ value: d, label: String(d) }))}
      />
      {(value.year != null || value.month != null || value.day != null) && (
        <button
          type="button"
          onClick={() => onChange({})}
          className="text-[11px] font-semibold text-slate-500 hover:text-zinc-900 underline-offset-2 hover:underline"
        >
          Clear
        </button>
      )}
      <span className="ml-auto text-[11px] text-slate-400">
        {describeCustomRange(value)}
      </span>
    </div>
  );
}

function describeCustomRange(v: CustomDate): string {
  if (v.year == null) return "Pick a year to start.";
  if (v.month == null) return `All of ${v.year}`;
  const monthName = MONTH_NAMES[v.month];
  if (v.day == null) return `${monthName} ${v.year}`;
  return `${monthName} ${v.day}, ${v.year}`;
}

// DateSelect moved to @/app/_Components/DateSelect — shared with bookings + audit pages.
