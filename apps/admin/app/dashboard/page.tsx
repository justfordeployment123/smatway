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

      {/* KPI grid — tighter gap on mobile (2 cols), generous on desktop (4 cols) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiTile loading={loading} label="Total users" value={data?.stats.totalUsers} icon={<UsersIcon />} sub={data ? `${data.stats.travelers} travelers · ${data.stats.transporters} transporters` : undefined} />
        <KpiTile loading={loading} label="Active routes" value={data?.stats.activeRoutes} icon={<MapPinIcon />} />
        <KpiTile loading={loading} label="Total bookings" value={data?.stats.totalBookings} icon={<BookOpenIcon />} sub={data ? `${data.stats.completedBookings} completed · ${data.stats.pendingBookings} pending` : undefined} />
        <KpiTile loading={loading} label="Paid bookings" value={data?.stats.paidBookings} icon={<CashIcon />} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiTile loading={loading} label="Site feedback" value={data?.stats.siteFeedback} icon={<MessageSquareIcon />} small />
        <KpiTile loading={loading} label="Trip reviews" value={data?.stats.reviews} icon={<MessageSquareIcon />} small />
        <KpiTile loading={loading} label="Live announcements" value={data?.stats.publishedAnnouncements} icon={<MegaphoneIcon />} small />
        <Card>
          <div className="text-[10px] sm:text-xs uppercase tracking-wide text-slate-500 font-medium leading-snug mb-2">Quick links</div>
          <div className="flex flex-wrap gap-1.5">
            <Link href="/dashboard/announcements" className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100 transition-colors">New announcement</Link>
            <Link href="/dashboard/admins" className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 ring-1 ring-slate-200 hover:bg-slate-200 transition-colors">Manage admins</Link>
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
                  <Link
                    href={`/dashboard/users/${u.id}`}
                    className="min-w-0 flex-1 group"
                  >
                    <div className="text-sm font-semibold text-zinc-950 truncate group-hover:text-emerald-700 transition-colors">
                      {u.name || u.email}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {u.email}
                      {u.country ? ` · ${u.country}` : ""}
                    </div>
                  </Link>
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
                    <Link
                      href={`/dashboard/routes/${b.transport.id}`}
                      className="text-sm font-semibold text-zinc-950 truncate hover:text-emerald-700 block"
                    >
                      {b.transport.departureCity} → {b.transport.destinationCity}
                    </Link>
                    <div className="text-[11px] text-slate-500 truncate">
                      {b.traveler ? (
                        <Link
                          href={`/dashboard/users/${b.traveler.id}`}
                          className="hover:text-emerald-700"
                        >
                          {b.traveler.name || "—"}
                        </Link>
                      ) : (
                        "—"
                      )}{" "}
                      · {b.seatsBooked} seat{b.seatsBooked === 1 ? "" : "s"}
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
    <Card>
      {/* Mobile-first layout: icon is small + at top-right, label + value
          + sub all flow on the left as a single column with full row width.
          The old layout split the tile in two columns and the icon ate
          enough space that "TOTAL USERS" couldn't fit on one line. */}
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="text-[10px] sm:text-xs uppercase tracking-wide text-slate-500 font-medium leading-snug min-w-0">
          {label}
        </div>
        <div className="grid h-7 w-7 sm:h-9 sm:w-9 place-items-center rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
          {icon}
        </div>
      </div>
      {loading ? (
        <Skeleton className="h-7 w-20" />
      ) : (
        <div className={`font-semibold tabular-nums text-zinc-950 ${small ? "text-xl" : "text-2xl"}`}>
          {(value ?? 0).toLocaleString()}
        </div>
      )}
      {/* `line-clamp-2` instead of `truncate` so "1 traveler · 2 transporters"
          wraps gracefully on a narrow tile instead of becoming "1 tr…". */}
      {sub && (
        <div className="text-[10px] sm:text-[11px] text-slate-400 mt-1 line-clamp-2">{sub}</div>
      )}
    </Card>
  );
}

function paymentTone(s: string): "emerald" | "yellow" | "red" | "slate" {
  if (s === "PAID") return "emerald";
  if (s === "PENDING") return "yellow";
  if (s === "FAILED") return "red";
  return "slate";
}
