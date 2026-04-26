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
            <h2 className="text-base font-semibold text-zinc-900">Revenue by currency</h2>
            <p className="text-xs text-slate-500">
              Gross is what customers paid. <span className="text-emerald-700 font-semibold">Platform revenue</span> is the commission the platform actually keeps after sending transporter payouts.
            </p>
          </div>
        </div>
        {loading ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : !summary || summary.currencies.length === 0 ? (
          <p className="text-sm text-slate-500">No paid bookings yet.</p>
        ) : (
          <>
            {/* Mobile: each currency rendered as a card with a 2-col grid of
                stats. The 6-column table doesn't fit on a phone — squeezing
                the columns made the headers wrap on top of each other. */}
            <div className="md:hidden space-y-3">
              {summary.currencies.map((c) => (
                <div key={c.currency} className="rounded-xl border border-slate-200 bg-slate-50/40 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono font-bold text-zinc-950">{c.currency}</span>
                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-wide text-emerald-700 font-semibold">Platform revenue</div>
                      <div className="text-base font-mono font-semibold text-emerald-700 tabular-nums">
                        {formatMoney(c.completedCommission, c.currency)}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-y-2 gap-x-3 text-sm">
                    <div>
                      <div className="text-[10px] uppercase tracking-wide text-slate-500 font-medium">Paid gross</div>
                      <div className="font-semibold tabular-nums">{formatMoney(c.paidGross, c.currency)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wide text-slate-500 font-medium">Paid bookings</div>
                      <div className="tabular-nums">{c.paidBookings}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wide text-slate-500 font-medium">Completed gross</div>
                      <div className="tabular-nums text-slate-600">{formatMoney(c.completedGross, c.currency)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wide text-slate-500 font-medium">Completed bookings</div>
                      <div className="tabular-nums text-slate-600">{c.completedBookings}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: keep the existing wide table. min-w guards against
                future column adds squeezing things on smaller laptops. */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead className="text-[11px] uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="text-left py-2 font-semibold whitespace-nowrap">Currency</th>
                    <th className="text-right py-2 font-semibold whitespace-nowrap">Paid gross</th>
                    <th className="text-right py-2 font-semibold whitespace-nowrap">Paid bookings</th>
                    <th className="text-right py-2 font-semibold whitespace-nowrap">Completed gross</th>
                    <th className="text-right py-2 font-semibold whitespace-nowrap">Completed bookings</th>
                    <th className="text-right py-2 font-semibold text-emerald-700 whitespace-nowrap">Platform revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {summary.currencies.map((c) => (
                    <tr key={c.currency}>
                      <td className="py-3 font-mono font-semibold">{c.currency}</td>
                      <td className="py-3 text-right tabular-nums font-semibold">{formatMoney(c.paidGross, c.currency)}</td>
                      <td className="py-3 text-right tabular-nums">{c.paidBookings}</td>
                      <td className="py-3 text-right tabular-nums text-slate-500">{formatMoney(c.completedGross, c.currency)}</td>
                      <td className="py-3 text-right tabular-nums text-slate-500">{c.completedBookings}</td>
                      <td className="py-3 text-right tabular-nums font-mono font-semibold text-emerald-700">
                        {formatMoney(c.completedCommission, c.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
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
