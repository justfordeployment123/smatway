"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Page, PageHeader, Card, Skeleton, ErrorState, EmptyState, StatusPill, SecondaryButton } from "@/app/_Components/ui";
import { SearchIcon, MapPinIcon } from "@/app/_Components/Icons";
import {
  listAdminRoutes, deactivateAdminRoute, activateAdminRoute, AdminRouteRow,
} from "@/lib/api";
import { adminCan, getAdminProfile } from "@/lib/auth";
import { ADMIN_PERMISSIONS } from "@/lib/permissions";
import { formatMoney } from "@/lib/format";

export default function RoutesPage() {
  const router = useRouter();
  const [rows, setRows] = useState<AdminRouteRow[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"" | "ACTIVE" | "INACTIVE" | "FULL">("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const canEdit = adminCan(getAdminProfile(), ADMIN_PERMISSIONS.ROUTES_EDIT);

  function load(reset = true) {
    if (reset) { setLoading(true); setRows([]); setNextCursor(null); } else { setLoadingMore(true); }
    setError(null);
    listAdminRoutes({
      search: search || undefined,
      status: status || undefined,
      cursor: reset ? undefined : nextCursor ?? undefined,
    })
      .then((res) => {
        setRows((prev) => (reset ? res.routes : [...prev, ...res.routes]));
        setNextCursor(res.nextCursor);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load routes"))
      .finally(() => { setLoading(false); setLoadingMore(false); });
  }

  useEffect(() => { load(true); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [status]);

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

  return (
    <Page className="space-y-6">
      <PageHeader kicker="Mobility" title="Routes" subtitle="Every transport listed on the platform." />

      <Card>
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
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as "" | "ACTIVE" | "INACTIVE" | "FULL")}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400"
          >
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="FULL">Full</option>
          </select>
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
                {rows.map((r) => (
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
