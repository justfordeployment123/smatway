"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Page, PageHeader, Card, Skeleton, ErrorState, EmptyState, StatusPill, SecondaryButton } from "@/app/_Components/ui";
import { BookOpenIcon } from "@/app/_Components/Icons";
import { listAdminBookings, AdminBookingRow } from "@/lib/api";
import { formatMoney } from "@/lib/format";

const BOOKING_STATUSES = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"] as const;
const PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED"] as const;

export default function BookingsPage() {
  const [rows, setRows] = useState<AdminBookingRow[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<string>("");

  function load(reset = true) {
    if (reset) { setLoading(true); setRows([]); setNextCursor(null); } else { setLoadingMore(true); }
    setError(null);
    listAdminBookings({
      status: status || undefined,
      paymentStatus: paymentStatus || undefined,
      cursor: reset ? undefined : nextCursor ?? undefined,
    })
      .then((res) => {
        setRows((prev) => (reset ? res.bookings : [...prev, ...res.bookings]));
        setNextCursor(res.nextCursor);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load bookings"))
      .finally(() => { setLoading(false); setLoadingMore(false); });
  }

  useEffect(() => { load(true); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [status, paymentStatus]);

  return (
    <Page className="space-y-6">
      <PageHeader kicker="Trade" title="Bookings" subtitle="Every booking — pending, confirmed, completed, cancelled." />

      <Card>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm flex-1 focus:outline-none focus:border-emerald-400"
          >
            <option value="">All statuses</option>
            {BOOKING_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm flex-1 focus:outline-none focus:border-emerald-400"
          >
            <option value="">All payments</option>
            {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </Card>

      {error && <ErrorState message={error} onRetry={() => load(true)} />}

      <Card className="!p-0 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState icon={<BookOpenIcon />} title="No bookings match" description="Adjust the filters above or wait for new bookings to come in." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/50 text-[11px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold">Route</th>
                  <th className="text-left px-5 py-3 font-semibold">Traveler</th>
                  <th className="text-left px-5 py-3 font-semibold">Transporter</th>
                  <th className="text-left px-5 py-3 font-semibold">Status</th>
                  <th className="text-left px-5 py-3 font-semibold">Payment</th>
                  <th className="text-right px-5 py-3 font-semibold">Seats</th>
                  <th className="text-right px-5 py-3 font-semibold">Total</th>
                  <th className="text-right px-5 py-3 font-semibold">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-3">
                      <Link href={`/dashboard/routes/${b.transport.id}`} className="font-semibold text-zinc-950 hover:text-emerald-700">
                        {b.transport.departureCity} → {b.transport.destinationCity}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      {b.traveler ? (
                        <Link href={`/dashboard/users/${b.traveler.id}`} className="text-slate-700 hover:text-emerald-700">
                          {b.traveler.name || b.traveler.email}
                        </Link>
                      ) : "—"}
                    </td>
                    <td className="px-5 py-3">
                      {b.transport.transporter ? (
                        <Link href={`/dashboard/users/${b.transport.transporter.id}`} className="text-slate-700 hover:text-emerald-700">
                          {b.transport.transporter.name || "—"}
                        </Link>
                      ) : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <StatusPill tone={statusTone(b.status)}>{b.status}</StatusPill>
                    </td>
                    <td className="px-5 py-3">
                      <StatusPill tone={paymentTone(b.paymentStatus)}>{b.paymentStatus}</StatusPill>
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">{b.seatsBooked}</td>
                    <td className="px-5 py-3 text-right font-mono tabular-nums">{formatMoney(b.totalPrice, b.transport.currency)}</td>
                    <td className="px-5 py-3 text-right text-[11px] text-slate-500">
                      {new Date(b.createdAt).toLocaleDateString(undefined, { day: "2-digit", month: "short" })}
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

function statusTone(s: string): "emerald" | "yellow" | "red" | "slate" | "blue" {
  if (s === "COMPLETED") return "emerald";
  if (s === "CONFIRMED") return "blue";
  if (s === "PENDING") return "yellow";
  if (s === "CANCELLED") return "red";
  return "slate";
}
function paymentTone(s: string): "emerald" | "yellow" | "red" | "slate" {
  if (s === "PAID") return "emerald";
  if (s === "PENDING") return "yellow";
  if (s === "FAILED") return "red";
  return "slate";
}
