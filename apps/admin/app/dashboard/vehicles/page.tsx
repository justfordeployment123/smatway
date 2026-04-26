"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Page, PageHeader, Card, Skeleton, ErrorState, EmptyState, StatusPill, SecondaryButton, TabFilter } from "@/app/_Components/ui";
import { SearchIcon, CarIcon } from "@/app/_Components/Icons";
import { listAdminVehicles, AdminVehicleRow } from "@/lib/api";

const TYPE_TABS = ["", "CAR", "BUS", "VAN", "MINIBUS", "TRUCK"] as const;
type TypeTab = (typeof TYPE_TABS)[number];
const TYPE_LABELS: Record<TypeTab, string> = {
  "": "ALL",
  CAR: "CAR",
  BUS: "BUS",
  VAN: "VAN",
  MINIBUS: "MINIBUS",
  TRUCK: "TRUCK",
};

export default function VehiclesPage() {
  const router = useRouter();
  const [rows, setRows] = useState<AdminVehicleRow[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [transportType, setTransportType] = useState<TypeTab>("");

  function load(reset = true) {
    if (reset) { setLoading(true); setRows([]); setNextCursor(null); } else { setLoadingMore(true); }
    setError(null);
    listAdminVehicles({
      search: search || undefined,
      transportType: transportType || undefined,
      cursor: reset ? undefined : nextCursor ?? undefined,
    })
      .then((res) => {
        setRows((prev) => (reset ? res.vehicles : [...prev, ...res.vehicles]));
        setNextCursor(res.nextCursor);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load vehicles"))
      .finally(() => { setLoading(false); setLoadingMore(false); });
  }

  useEffect(() => { load(true); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [transportType]);

  return (
    <Page className="space-y-6">
      <PageHeader kicker="Fleet" title="Vehicles" subtitle="Every vehicle registered by transporters on the platform." />

      <Card className="space-y-3">
        <TabFilter<TypeTab> tabs={TYPE_TABS} value={transportType} onChange={setTransportType} formatLabel={(t) => TYPE_LABELS[t]} />
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <SearchIcon className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search by name, model, or plate…"
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
            {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState icon={<CarIcon />} title="No vehicles match" description="Vehicles registered by transporters will show up here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/50 text-[11px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold">Vehicle</th>
                  <th className="text-left px-5 py-3 font-semibold">Plate</th>
                  <th className="text-left px-5 py-3 font-semibold">Type</th>
                  <th className="text-left px-5 py-3 font-semibold">Transporter</th>
                  <th className="text-right px-5 py-3 font-semibold">Routes</th>
                  <th className="text-right px-5 py-3 font-semibold">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((v) => (
                  <tr
                    key={v.id}
                    onClick={() => router.push(`/dashboard/vehicles/${v.id}`)}
                    className="hover:bg-slate-50/80 cursor-pointer"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-10 rounded-lg overflow-hidden bg-slate-100 ring-1 ring-slate-200/70 flex items-center justify-center shrink-0">
                          {v.imageUrl ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={v.imageUrl} alt={v.name} className="w-full h-full object-cover" />
                          ) : (
                            <CarIcon className="w-4 h-4 text-slate-300" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-zinc-950 truncate">{v.name}</div>
                          <div className="text-[11px] text-slate-500 truncate">{v.model}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="font-mono text-[12px] tracking-wider text-zinc-700">{v.plateNumber}</span>
                    </td>
                    <td className="px-5 py-3">
                      <StatusPill tone="slate">{v.transportType}</StatusPill>
                    </td>
                    <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                      {v.transporter ? (
                        <Link href={`/dashboard/users/${v.transporter.id}`} className="block hover:text-emerald-700">
                          <div className="text-sm truncate">{v.transporter.name || "—"}</div>
                          <div className="text-[11px] text-slate-500 truncate">{v.transporter.email}</div>
                        </Link>
                      ) : <span className="text-sm">—</span>}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">{v._count.transports}</td>
                    <td className="px-5 py-3 text-right text-[11px] text-slate-500">
                      {new Date(v.createdAt).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
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
