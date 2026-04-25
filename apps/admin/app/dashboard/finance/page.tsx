"use client";

import { useEffect, useState } from "react";
import { Page, PageHeader, Card, Skeleton, ErrorState } from "@/app/_Components/ui";
import { CashIcon } from "@/app/_Components/Icons";
import {
  getAdminFinanceSummary, getAdminTopTransporters,
  AdminFinanceSummary, AdminTopTransporter,
} from "@/lib/api";
import { formatMoney } from "@/lib/format";

export default function FinancePage() {
  const [summary, setSummary] = useState<AdminFinanceSummary | null>(null);
  const [top, setTop] = useState<AdminTopTransporter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    setError(null);
    Promise.all([getAdminFinanceSummary(), getAdminTopTransporters(10)])
      .then(([s, t]) => { setSummary(s); setTop(t.transporters); })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load finance"))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  return (
    <Page className="space-y-6">
      <PageHeader
        kicker="Finance"
        title="Cash & revenue"
        subtitle="Aggregate gross revenue across currencies, plus the transporters driving the most volume."
      />

      {error && <ErrorState message={error} onRetry={load} />}

      {/* Top-line counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Tile loading={loading} label="Total bookings" value={summary?.totalBookings} />
        <Tile loading={loading} label="Pending payments" value={summary?.pendingPayments} tone="yellow" />
        <Tile loading={loading} label="Failed payments" value={summary?.failedPayments} tone="red" />
        <Tile loading={loading} label="Currencies live" value={summary?.currencies.length} />
      </div>

      {/* Per-currency revenue */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CashIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-zinc-900">Gross revenue by currency</h2>
            <p className="text-xs text-slate-500">Sums of paid bookings, denominated in their original currency.</p>
          </div>
        </div>
        {loading ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : !summary || summary.currencies.length === 0 ? (
          <p className="text-sm text-slate-500">No paid bookings yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[11px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="text-left py-2 font-semibold">Currency</th>
                  <th className="text-right py-2 font-semibold">Paid gross</th>
                  <th className="text-right py-2 font-semibold">Paid bookings</th>
                  <th className="text-right py-2 font-semibold">Completed gross</th>
                  <th className="text-right py-2 font-semibold">Completed bookings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {summary.currencies.map((c) => (
                  <tr key={c.currency}>
                    <td className="py-3 font-mono font-semibold">{c.currency}</td>
                    <td className="py-3 text-right tabular-nums font-semibold">{formatMoney(c.paidGross, c.currency)}</td>
                    <td className="py-3 text-right tabular-nums">{c.paidBookings}</td>
                    <td className="py-3 text-right tabular-nums">{formatMoney(c.completedGross, c.currency)}</td>
                    <td className="py-3 text-right tabular-nums">{c.completedBookings}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Top transporters */}
      <Card>
        <h2 className="text-base font-semibold text-zinc-900 mb-1">Top transporters</h2>
        <p className="text-xs text-slate-500 mb-4">By paid bookings count.</p>
        {loading ? (
          <div className="space-y-3">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : top.length === 0 ? (
          <p className="text-sm text-slate-500">No paid bookings yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {top.map((t) => (
              <li key={t.transporterId} className="py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-semibold text-zinc-950 truncate">{t.name || t.email}</div>
                  <div className="text-[11px] text-slate-500 truncate">{t.email}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-semibold text-zinc-950 tabular-nums">{t.bookings} bookings</div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {Object.entries(t.byCurrency).map(([c, v]) => formatMoney(v as number, c)).join(" · ")}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </Page>
  );
}

function Tile({
  label, value, loading, tone = "default",
}: { label: string; value?: number; loading: boolean; tone?: "default" | "yellow" | "red" }) {
  const colorMap: Record<string, string> = {
    default: "text-zinc-950",
    yellow: "text-amber-700",
    red: "text-red-700",
  };
  return (
    <Card>
      <div className="text-xs uppercase tracking-wide text-slate-500 font-medium">{label}</div>
      {loading ? (
        <Skeleton className="h-7 w-20 mt-2" />
      ) : (
        <div className={`mt-1 text-2xl font-semibold tabular-nums ${colorMap[tone]}`}>{(value ?? 0).toLocaleString()}</div>
      )}
    </Card>
  );
}
