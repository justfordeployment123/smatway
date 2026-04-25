"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Page, PageHeader, Card, Skeleton, ErrorState, StatusPill } from "@/app/_Components/ui";
import { UsersIcon, MapPinIcon, BookOpenIcon, CashIcon, MessageSquareIcon, MegaphoneIcon } from "@/app/_Components/Icons";
import { getAdminOverview, AdminOverview } from "@/lib/api";
import { formatMoney } from "@/lib/format";

export default function OverviewPage() {
  const [data, setData] = useState<AdminOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    setError(null);
    getAdminOverview()
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load overview"))
      .finally(() => setLoading(false));
  }
  useEffect(() => {
    load();
  }, []);

  return (
    <Page className="space-y-8">
      <PageHeader
        kicker="Operations"
        title="Platform overview"
        subtitle="Live snapshot of users, routes, bookings, and feedback. Numbers are pulled directly from the database."
      />

      {error && <ErrorState message={error} onRetry={load} />}

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiTile loading={loading} label="Total users" value={data?.stats.totalUsers} icon={<UsersIcon />} sub={data ? `${data.stats.travelers} travelers · ${data.stats.transporters} transporters` : undefined} />
        <KpiTile loading={loading} label="Active routes" value={data?.stats.activeRoutes} icon={<MapPinIcon />} />
        <KpiTile loading={loading} label="Total bookings" value={data?.stats.totalBookings} icon={<BookOpenIcon />} sub={data ? `${data.stats.completedBookings} completed · ${data.stats.pendingBookings} pending` : undefined} />
        <KpiTile loading={loading} label="Paid bookings" value={data?.stats.paidBookings} icon={<CashIcon />} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiTile loading={loading} label="Site feedback" value={data?.stats.siteFeedback} icon={<MessageSquareIcon />} small />
        <KpiTile loading={loading} label="Trip reviews" value={data?.stats.reviews} icon={<MessageSquareIcon />} small />
        <KpiTile loading={loading} label="Live announcements" value={data?.stats.publishedAnnouncements} icon={<MegaphoneIcon />} small />
        <Card className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500 font-medium">Quick links</div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Link href="/dashboard/announcements" className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">New announcement</Link>
              <Link href="/dashboard/admins" className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 ring-1 ring-slate-200">Manage admins</Link>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-zinc-900">Recent signups</h2>
            <Link href="/dashboard/users" className="text-xs text-emerald-700 hover:text-emerald-900 font-medium">View all →</Link>
          </div>
          {loading ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : !data || data.recentSignups.length === 0 ? (
            <p className="text-sm text-slate-500">No signups yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {data.recentSignups.map((u) => (
                <li key={u.id} className="py-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-zinc-950 truncate">{u.name || u.email}</div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {u.email}
                      {u.country ? ` · ${u.country}` : ""}
                    </div>
                  </div>
                  <StatusPill tone={u.accountType === "TRANSPORTER" ? "blue" : "emerald"}>
                    {u.accountType ?? "—"}
                  </StatusPill>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-zinc-900">Recent bookings</h2>
            <Link href="/dashboard/bookings" className="text-xs text-emerald-700 hover:text-emerald-900 font-medium">View all →</Link>
          </div>
          {loading ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : !data || data.recentBookings.length === 0 ? (
            <p className="text-sm text-slate-500">No bookings yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {data.recentBookings.map((b) => (
                <li key={b.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-zinc-950 truncate">
                      {b.transport.departureCity} → {b.transport.destinationCity}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {b.traveler?.name || "—"} · {b.seatsBooked} seat{b.seatsBooked === 1 ? "" : "s"}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-mono font-semibold text-zinc-950">
                      {formatMoney(b.totalPrice, b.transport.currency)}
                    </div>
                    <StatusPill tone={paymentTone(b.paymentStatus)}>{b.paymentStatus}</StatusPill>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </Page>
  );
}

function KpiTile({
  loading,
  label,
  value,
  icon,
  sub,
  small,
}: {
  loading: boolean;
  label: string;
  value: number | undefined;
  icon: React.ReactNode;
  sub?: string;
  small?: boolean;
}) {
  return (
    <Card className={small ? "" : ""}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-wide text-slate-500 font-medium">{label}</div>
          {loading ? (
            <Skeleton className="h-7 w-20 mt-2" />
          ) : (
            <div className={`mt-1 font-semibold tabular-nums text-zinc-950 ${small ? "text-xl" : "text-2xl"}`}>
              {(value ?? 0).toLocaleString()}
            </div>
          )}
          {sub && <div className="text-[11px] text-slate-400 mt-1 truncate">{sub}</div>}
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
          {icon}
        </div>
      </div>
    </Card>
  );
}

function paymentTone(s: string): "emerald" | "yellow" | "red" | "slate" {
  if (s === "PAID") return "emerald";
  if (s === "PENDING") return "yellow";
  if (s === "FAILED") return "red";
  return "slate";
}
