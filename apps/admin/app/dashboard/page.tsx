"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Page,
  PageHeader,
  Card,
  Skeleton,
  ErrorState,
  StatusPill,
  Reveal,
} from "@/app/_Components/ui";
import {
  UsersIcon,
  MapPinIcon,
  BookOpenIcon,
  CashIcon,
  MegaphoneIcon,
  ArrowRightIcon,
} from "@/app/_Components/Icons";
import {
  ChartCard,
  ChartSummary,
  DeltaPill,
  PeriodSelector,
  Sparkline,
  BookingsTrendChart,
  RevenueLineChart,
  StatusDonut,
  TopRoutesBar,
} from "@/app/_Components/Charts";
import {
  getAdminOverview,
  AdminOverview,
  getAdminInsights,
  AdminInsights,
} from "@/lib/api";
import { formatMoney } from "@/lib/format";

export default function OverviewPage() {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [insights, setInsights] = useState<AdminInsights | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(14);
  // Loading flag specifically for the chart refetch — keeps the rest of the
  // page (KPIs, recent lists) from flickering when the user changes period.
  const [insightsLoading, setInsightsLoading] = useState(false);

  function loadAll() {
    setLoading(true);
    setError(null);
    Promise.all([getAdminOverview(), getAdminInsights(days)])
      .then(([o, i]) => {
        setOverview(o);
        setInsights(i);
      })
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Failed to load overview")
      )
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadAll();
    // Initial load only — subsequent period changes use the lighter
    // refetch path below. eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch only insights when the user toggles the period.
  useEffect(() => {
    if (loading) return;
    setInsightsLoading(true);
    getAdminInsights(days)
      .then(setInsights)
      .finally(() => setInsightsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  const dominantCurrency = pickDominantCurrency(insights);
  const revenueSeries = (insights?.series ?? []).map((d) => ({
    date: d.date,
    revenue: d.revenueByCurrency[dominantCurrency] ?? 0,
  }));

  // Roll-ups for chart-summary callouts.
  const totals = insights
    ? {
        bookings: insights.series.reduce((a, d) => a + d.bookings, 0),
        signups: insights.series.reduce((a, d) => a + d.signups, 0),
        paidBookings: insights.series.reduce((a, d) => a + d.paidBookings, 0),
        revenue: revenueSeries.reduce((a, d) => a + d.revenue, 0),
      }
    : null;
  const totalRoutesCreated = insights
    ? insights.series.reduce((a, d) => a + d.routesCreated, 0)
    : 0;
  const deltas = insights
    ? {
        bookings: pctDelta(totals?.bookings ?? 0, insights.prior.bookings),
        signups: pctDelta(totals?.signups ?? 0, insights.prior.signups),
        paidBookings: pctDelta(
          totals?.paidBookings ?? 0,
          insights.prior.paidBookings
        ),
        routesCreated: pctDelta(
          totalRoutesCreated,
          insights.prior.routesCreated
        ),
        revenue: pctDelta(
          totals?.revenue ?? 0,
          insights.prior.revenueByCurrency[dominantCurrency] ?? 0
        ),
      }
    : null;

  return (
    <Page className="space-y-6">
      <PageHeader
        kicker="Operations"
        title="Platform overview"
        subtitle="Live snapshot of users, routes, bookings, and revenue."
        action={<PeriodSelector value={days} onChange={setDays} />}
      />

      {error && <ErrorState message={error} onRetry={loadAll} />}

      {/* KPI Strip with embedded sparklines + deltas */}
      <Reveal>
        <KpiStrip
          loading={loading}
          stats={overview?.stats}
          insights={insights}
          deltas={deltas}
          days={days}
        />
      </Reveal>

      {/* Activity trend + status donut */}
      <Reveal delay={0.05}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ChartCard
            title="Activity trend"
            hint={`Bookings and signups · last ${days} days`}
            className="lg:col-span-2"
          >
            {loading || !insights ? (
              <SummarySkeleton />
            ) : (
              <ChartSummary
                items={[
                  {
                    label: "Bookings",
                    value: totals?.bookings ?? 0,
                    delta: deltas?.bookings,
                    tone: "emerald",
                  },
                  {
                    label: "Signups",
                    value: totals?.signups ?? 0,
                    delta: deltas?.signups,
                    tone: "blue",
                  },
                ]}
              />
            )}
            <ChartFrame
              loading={loading || !insights}
              refreshing={insightsLoading}
              height={260}
            >
              {insights && <BookingsTrendChart data={insights.series} />}
            </ChartFrame>
          </ChartCard>

          <ChartCard title="Booking status" hint="Across all bookings">
            <ChartFrame loading={loading} refreshing={false} height={260}>
              <StatusDonut data={insights?.statusBreakdown ?? []} />
            </ChartFrame>
          </ChartCard>
        </div>
      </Reveal>

      {/* Revenue + top routes */}
      <Reveal delay={0.1}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ChartCard
            title="Revenue"
            hint={`Paid bookings · last ${days} days`}
            className="lg:col-span-2"
          >
            {loading || !insights ? (
              <SummarySkeleton />
            ) : (
              <ChartSummary
                items={[
                  {
                    label: `Revenue (${dominantCurrency})`,
                    value: totals?.revenue ?? 0,
                    delta: deltas?.revenue,
                    tone: "violet",
                    formatter: (v) =>
                      formatMoney(Number(v), dominantCurrency),
                  },
                  {
                    label: "Paid bookings",
                    value: totals?.paidBookings ?? 0,
                    delta: deltas?.paidBookings,
                    tone: "emerald",
                  },
                ]}
              />
            )}
            <ChartFrame
              loading={loading || !insights}
              refreshing={insightsLoading}
              height={260}
            >
              {insights && (
                <RevenueLineChart
                  data={revenueSeries}
                  currency={dominantCurrency}
                />
              )}
            </ChartFrame>
          </ChartCard>

          <ChartCard title="Top routes" hint="By total bookings">
            <ChartFrame
              loading={loading || !insights}
              refreshing={insightsLoading}
              height={260}
            >
              <TopRoutesBar data={insights?.topRoutes ?? []} />
            </ChartFrame>
          </ChartCard>
        </div>
      </Reveal>

      {/* Quick links + secondary stats */}
      <Reveal delay={0.13}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <SecondaryTile
            loading={loading}
            label="Site feedback"
            value={overview?.stats.siteFeedback}
            href="/dashboard/feedback"
          />
          <SecondaryTile
            loading={loading}
            label="Trip reviews"
            value={overview?.stats.reviews}
            href="/dashboard/reviews"
          />
          <SecondaryTile
            loading={loading}
            label="Live announcements"
            value={overview?.stats.publishedAnnouncements}
            href="/dashboard/announcements"
            icon={<MegaphoneIcon className="w-4 h-4" />}
          />
          <Card className="!p-4">
            <p className="text-[10px] uppercase tracking-wide text-slate-500 font-medium mb-2">
              Quick links
            </p>
            <div className="flex flex-wrap gap-1.5">
              <Link
                href="/dashboard/announcements"
                className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100 transition-colors"
              >
                New announcement
              </Link>
              <Link
                href="/dashboard/admins"
                className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 ring-1 ring-slate-200 hover:bg-slate-200 transition-colors"
              >
                Manage admins
              </Link>
            </div>
          </Card>
        </div>
      </Reveal>

      {/* Recent activity */}
      <Reveal delay={0.18}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <SectionHead title="Recent signups" href="/dashboard/users" />
            {loading ? (
              <SkeletonList />
            ) : !overview || overview.recentSignups.length === 0 ? (
              <p className="text-sm text-slate-500">No signups yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {overview.recentSignups.map((u) => (
                  <li
                    key={u.id}
                    className="py-3 flex items-center justify-between"
                  >
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
                    <StatusPill
                      tone={
                        u.accountType === "TRANSPORTER" ? "blue" : "emerald"
                      }
                    >
                      {u.accountType ?? "—"}
                    </StatusPill>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <SectionHead title="Recent bookings" href="/dashboard/bookings" />
            {loading ? (
              <SkeletonList />
            ) : !overview || overview.recentBookings.length === 0 ? (
              <p className="text-sm text-slate-500">No bookings yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {overview.recentBookings.map((b) => (
                  <li
                    key={b.id}
                    className="py-3 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/dashboard/routes/${b.transport.id}`}
                        className="text-sm font-semibold text-zinc-950 truncate hover:text-emerald-700 block"
                      >
                        {b.transport.departureCity} →{" "}
                        {b.transport.destinationCity}
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
                        · {b.seatsBooked} seat
                        {b.seatsBooked === 1 ? "" : "s"}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-mono font-semibold text-zinc-950">
                        {formatMoney(b.totalPrice, b.transport.currency)}
                      </div>
                      <StatusPill tone={paymentTone(b.paymentStatus)}>
                        {b.paymentStatus}
                      </StatusPill>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </Reveal>
    </Page>
  );
}

// ─── KPI Strip ────────────────────────────────────────────────────────────────

const KPI_TONE: Record<string, string> = {
  emerald: "bg-emerald-50 text-emerald-600",
  blue: "bg-blue-50 text-blue-600",
  amber: "bg-amber-50 text-amber-600",
  rose: "bg-rose-50 text-rose-600",
};

type KpiTone = "emerald" | "blue" | "violet" | "rose" | "amber";

function KpiStrip({
  loading,
  stats,
  insights,
  deltas,
  days,
}: {
  loading: boolean;
  stats?: AdminOverview["stats"];
  insights: AdminInsights | null;
  deltas: {
    bookings: number | null;
    signups: number | null;
    paidBookings: number | null;
    routesCreated: number | null;
    revenue: number | null;
  } | null;
  days: number;
}) {
  // Sparkline series — reused from the insights timeseries so the tiles tell
  // the same story as the big charts.
  const bookingsSpark = (insights?.series ?? []).map((d) => ({
    value: d.bookings,
  }));
  const signupsSpark = (insights?.series ?? []).map((d) => ({
    value: d.signups,
  }));
  const paidSpark = (insights?.series ?? []).map((d) => ({
    value: d.paidBookings,
  }));
  const routesSpark = (insights?.series ?? []).map((d) => ({
    value: d.routesCreated,
  }));

  const tiles: Array<{
    label: string;
    value: number | undefined;
    sub?: string;
    icon: React.ReactNode;
    tone: KpiTone;
    spark?: Array<{ value: number }>;
    sparkTone?: KpiTone;
    delta?: number | null;
  }> = [
    {
      label: "Total users",
      value: stats?.totalUsers,
      sub: stats
        ? `${stats.travelers} travelers · ${stats.transporters} transporters`
        : undefined,
      icon: <UsersIcon className="w-4 h-4" />,
      tone: "emerald",
      spark: signupsSpark,
      sparkTone: "emerald",
      delta: deltas?.signups,
    },
    {
      label: "Active routes",
      value: stats?.activeRoutes,
      // Sparkline shows routes *created* per day in the window — a proxy for
      // route-creation activity. The header number stays the live ACTIVE
      // count (a state, not an event), which is why the totals don't add up
      // to the sparkline area.
      icon: <MapPinIcon className="w-4 h-4" />,
      tone: "blue",
      spark: routesSpark,
      sparkTone: "blue",
      delta: deltas?.routesCreated,
    },
    {
      label: "Total bookings",
      value: stats?.totalBookings,
      sub: stats
        ? `${stats.completedBookings} completed · ${stats.pendingBookings} pending`
        : undefined,
      icon: <BookOpenIcon className="w-4 h-4" />,
      tone: "amber",
      spark: bookingsSpark,
      sparkTone: "amber",
      delta: deltas?.bookings,
    },
    {
      label: "Paid bookings",
      value: stats?.paidBookings,
      icon: <CashIcon className="w-4 h-4" />,
      tone: "rose",
      spark: paidSpark,
      sparkTone: "rose",
      delta: deltas?.paidBookings,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 bg-white rounded-2xl border border-slate-200/70 overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      {tiles.map((t, i) => (
        <div
          key={t.label}
          className={`relative p-5 lg:p-6 ${
            i < 3 ? "lg:border-r lg:border-slate-100" : ""
          } ${i % 2 === 0 ? "border-r border-slate-100 lg:border-r" : ""} ${
            i < 2 ? "border-b border-slate-100 lg:border-b-0" : ""
          }`}
        >
          <div className="flex items-center gap-2 mb-3">
            <span
              className={`grid place-items-center w-7 h-7 rounded-lg ${
                KPI_TONE[t.tone] ?? KPI_TONE.emerald
              }`}
            >
              {t.icon}
            </span>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              {t.label}
            </p>
          </div>
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              {loading ? (
                <Skeleton className="h-7 w-20 mb-2" />
              ) : (
                <p className="text-[1.65rem] font-semibold tabular-nums tracking-tight text-zinc-950 leading-none">
                  {(t.value ?? 0).toLocaleString()}
                </p>
              )}
              {!loading && t.delta !== undefined && t.delta !== null && (
                <div className="mt-2">
                  <DeltaPill delta={t.delta} />
                  <span className="ml-1.5 text-[10px] text-slate-400">
                    vs prev {days}d
                  </span>
                </div>
              )}
            </div>
            {t.spark && !loading && (
              <div className="w-20 shrink-0">
                <Sparkline data={t.spark} tone={t.sparkTone} height={32} />
              </div>
            )}
          </div>
          {t.sub && !loading && (
            <p className="text-[11px] text-slate-400 mt-3 line-clamp-2">
              {t.sub}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Small helpers ────────────────────────────────────────────────────────────

// Wraps chart bodies with a fixed-height container so the chart never
// unmounts during a period refetch. Recharts' ResponsiveContainer caches
// its parent measurement at mount time — if we replace it with a Skeleton
// and then mount a fresh chart, the new chart often misses the dimensions
// of its container and draws nothing. Keeping the chart mounted under a
// translucent overlay avoids the remount and the "blank chart after period
// switch" bug.
function ChartFrame({
  loading,
  refreshing,
  height,
  children,
}: {
  loading: boolean;
  refreshing: boolean;
  height: number;
  children: React.ReactNode;
}) {
  if (loading) {
    return (
      <div
        className="rounded-lg bg-slate-100 animate-pulse mx-2"
        style={{ height }}
      />
    );
  }
  return (
    <div className="relative" style={{ minHeight: height }}>
      {children}
      {refreshing && (
        <div className="absolute inset-0 grid place-items-center bg-white/60 backdrop-blur-[2px] rounded-xl pointer-events-none">
          <span className="inline-flex items-center gap-2 text-[11px] font-medium text-slate-500 bg-white ring-1 ring-slate-200 rounded-full px-2.5 py-1 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Updating
          </span>
        </div>
      )}
    </div>
  );
}

function SummarySkeleton() {
  return (
    <div className="flex gap-7 px-3 pt-1 pb-4">
      {[1, 2].map((i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-7 w-24" />
        </div>
      ))}
    </div>
  );
}

function SecondaryTile({
  loading,
  label,
  value,
  href,
  icon,
}: {
  loading: boolean;
  label: string;
  value: number | undefined;
  href: string;
  icon?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-200/70 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:border-emerald-200 hover:shadow-[0_2px_8px_rgba(16,185,129,0.08)] transition-all"
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] uppercase tracking-wide text-slate-500 font-medium">
          {label}
        </p>
        <span className="text-slate-300 group-hover:text-emerald-500 transition-colors">
          {icon ?? <ArrowRightIcon className="w-3.5 h-3.5" />}
        </span>
      </div>
      {loading ? (
        <Skeleton className="h-6 w-16" />
      ) : (
        <p className="text-xl font-semibold tabular-nums text-zinc-950 leading-none">
          {(value ?? 0).toLocaleString()}
        </p>
      )}
    </Link>
  );
}

function SectionHead({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-base font-semibold text-zinc-950 tracking-tight">
        {title}
      </h2>
      <Link
        href={href}
        className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1"
      >
        View all
        <ArrowRightIcon className="w-3 h-3" />
      </Link>
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

function paymentTone(s: string): "emerald" | "yellow" | "red" | "slate" {
  if (s === "PAID") return "emerald";
  if (s === "PENDING") return "yellow";
  if (s === "FAILED") return "red";
  return "slate";
}

function pickDominantCurrency(insights: AdminInsights | null): string {
  if (!insights || insights.series.length === 0) return "USD";
  const totals = new Map<string, number>();
  for (const d of insights.series) {
    for (const [cur, val] of Object.entries(d.revenueByCurrency)) {
      totals.set(cur, (totals.get(cur) ?? 0) + val);
    }
  }
  // Fall back to the dominant prior-period currency so a quiet current
  // window still labels the chart with the operator's main currency.
  if (totals.size === 0) {
    const priorTotals = Object.entries(insights.prior.revenueByCurrency);
    if (priorTotals.length === 0) return "USD";
    return priorTotals.sort((a, b) => b[1] - a[1])[0][0];
  }
  return [...totals.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

function pctDelta(current: number, prior: number): number | null {
  // No prior data → can't compute a percentage delta. Return null so the
  // pill stays hidden rather than showing a misleading "+∞%". When both
  // are 0, return 0 so we still indicate "flat" instead of nothing.
  if (prior === 0) return current === 0 ? 0 : null;
  return Math.round(((current - prior) / prior) * 100);
}
