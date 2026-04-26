"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Page, PageHeader, EmptyState } from "@/app/dashboard/_Components/ui";
import { CarIcon as CashIcon } from "@/app/dashboard/_Components/Icons";
import { getMyPayouts, MyPayout } from "@/lib/api";

const STATUS_TONE: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-800 ring-amber-200",
  PROCESSING: "bg-blue-50 text-blue-800 ring-blue-200",
  RELEASED: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  FAILED: "bg-red-50 text-red-800 ring-red-200",
};

const STATUS_DESCRIPTION: Record<string, string> = {
  PENDING: "Awaiting release by our finance team.",
  PROCESSING: "Sent — funds typically arrive within 1 business day.",
  RELEASED: "Funds confirmed in your bank account.",
  FAILED: "Transfer didn't go through. We'll retry automatically.",
};

function fmtMoney(n: string | number, c: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: c,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(typeof n === "string" ? parseFloat(n) : n);
  } catch {
    return `${c} ${n}`;
  }
}

export default function MyPayoutsPage() {
  const [payouts, setPayouts] = useState<MyPayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMyPayouts()
      .then((r) => setPayouts(r.payouts))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load payouts"))
      .finally(() => setLoading(false));
  }, []);

  // Total released, in default currency only (multi-currency aggregation
  // would need conversion rates which we don't have on the client).
  const totalsByCurrency = payouts
    .filter((p) => p.status === "RELEASED")
    .reduce<Record<string, number>>((acc, p) => {
      const v = typeof p.netAmount === "string" ? parseFloat(p.netAmount) : p.netAmount;
      acc[p.currency] = (acc[p.currency] ?? 0) + v;
      return acc;
    }, {});

  return (
    <Page>
      <PageHeader
        kicker="Earnings"
        title="My payouts"
        subtitle="Money owed to you per completed trip, with status of each transfer to your bank."
      />

      {/* Summary card */}
      <div className="rounded-2xl border border-slate-200/70 bg-white p-5 mb-6">
        <div className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold">
          Total released to you
        </div>
        {Object.keys(totalsByCurrency).length === 0 ? (
          <div className="mt-1 text-lg text-slate-400">No payouts released yet</div>
        ) : (
          <div className="mt-1 flex flex-wrap gap-x-6 gap-y-1">
            {Object.entries(totalsByCurrency).map(([cur, total]) => (
              <div key={cur} className="text-2xl font-semibold tabular-nums text-zinc-950">
                {fmtMoney(total, cur)}
              </div>
            ))}
          </div>
        )}
        <Link
          href="/dashboard/payout-settings"
          className="mt-3 inline-block text-xs font-semibold text-emerald-700 hover:text-emerald-900"
        >
          Manage payout account →
        </Link>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : payouts.length === 0 ? (
        <EmptyState
          title="No payouts yet"
          description="Once travelers confirm arrival on completed trips, payouts show up here."
          icon={<CashIcon className="w-6 h-6" />}
        />
      ) : (
        <div className="space-y-3">
          {payouts.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-zinc-950 truncate">
                    {p.booking.transport.departureCity} → {p.booking.transport.destinationCity}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    Booking · {p.bookingId.slice(0, 8)}
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${STATUS_TONE[p.status] || STATUS_TONE.PENDING}`}
                >
                  {p.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-slate-500">Trip total</div>
                  <div className="font-mono tabular-nums text-zinc-700">{fmtMoney(p.grossAmount, p.currency)}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-slate-500">Platform fee</div>
                  <div className="font-mono tabular-nums text-slate-500">−{fmtMoney(p.commissionAmount, p.currency)}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-slate-500">Your payout</div>
                  <div className="font-mono tabular-nums font-semibold text-emerald-700">{fmtMoney(p.netAmount, p.currency)}</div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed">
                {STATUS_DESCRIPTION[p.status]}
                {p.status === "FAILED" && p.failureReason && (
                  <span className="block mt-1 text-red-700">Reason: {p.failureReason}</span>
                )}
                <span className="block mt-1 text-slate-400">
                  {p.status === "RELEASED" && p.releasedAt
                    ? `Released ${new Date(p.releasedAt).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })}`
                    : `Created ${new Date(p.createdAt).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })}`}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Page>
  );
}
