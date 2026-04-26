"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  CarIcon, MapPinIcon, UsersIcon, CreditCardIcon,
  ArrowRightIcon, PlusIcon, BookOpenIcon, MegaphoneIcon, ClockIcon,
  CheckCircleIcon, StarIcon, SparklesIcon, TrendingUpIcon,
} from "@/app/dashboard/_Components/Icons";
import {
  Page, Reveal, PageHeader, StatStrip, EmptyState, Skeleton,
  PrimaryButton, StatusPill, spring,
} from "@/app/dashboard/_Components/ui";
import {
  getMyVehicles, getMyRoutes, getTransportBookings, getMyPayouts,
  getMyInsights,
  type MyPayout, type TransporterInsights,
} from "@/lib/api";
import { formatBookingStatus } from "@/lib/bookingStatus";
import { formatPrice } from "@/lib/currencies";
import {
  ChartCard, ChartSummary, PeriodSelector,
  BookingsTrendChart, RevenueLineChart, StatusDonut, TopRoutesBar,
} from "@/app/dashboard/_Components/Charts";

export default function TransporterDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<MyPayout[]>([]);
  const [insights, setInsights] = useState<TransporterInsights | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [days, setDays] = useState(14);

  useEffect(() => {
    Promise.all([
      getMyVehicles(),
      getMyRoutes(),
      getTransportBookings(),
      // Payouts → drives the real earnings number. Soft-fail so a 4xx here
      // doesn't blank out the whole dashboard for a transporter who hasn't
      // configured their payout account yet.
      getMyPayouts().catch(() => ({ payouts: [] })),
      getMyInsights(14).catch(() => null),
    ])
      .then(([v, r, b, p, i]) => {
        setVehicles(v || []);
        setRoutes(r || []);
        setBookings(b || []);
        setPayouts(p?.payouts ?? []);
        setInsights(i);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Refetch insights when the user toggles the period — keeps the rest of
  // the dashboard from flickering since vehicles/routes/payouts don't depend
  // on the time window.
  useEffect(() => {
    if (loading) return;
    setInsightsLoading(true);
    getMyInsights(days)
      .then(setInsights)
      .catch(() => {})
      .finally(() => setInsightsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  const activeRoutes = routes.filter((r) => r.status === "ACTIVE").length;
  const pendingBookings = bookings.filter((b) => b.status === "PENDING").length;
  const confirmedBookings = bookings.filter((b) => b.status === "CONFIRMED").length;
  const completedBookings = bookings.filter((b) => b.status === "COMPLETED").length;

  // Earnings = transporter's NET take-home from the Payout table — same source
  // the Earnings page reads. Released = money confirmed in the bank. We pick
  // the largest-net currency to display in the tile (a transporter with mixed
  // NGN + USD trips usually skews heavily to one); the Earnings page itself
  // breaks down per currency.
  const releasedByCurrency = new Map<string, number>();
  for (const p of payouts) {
    if (p.status !== "RELEASED") continue;
    const cur = p.currency || "USD";
    releasedByCurrency.set(cur, (releasedByCurrency.get(cur) ?? 0) + Number(p.netAmount));
  }
  const dominantCurrency = [...releasedByCurrency.entries()].sort((a, b) => b[1] - a[1])[0];
  const releasedAmount = dominantCurrency?.[1] ?? 0;
  const releasedCurrency = dominantCurrency?.[0] ?? "USD";
  const otherCurrencies = releasedByCurrency.size - (dominantCurrency ? 1 : 0);
  const earningsHint =
    completedBookings === 0
      ? "no completed trips yet"
      : otherCurrencies > 0
      ? `+ ${otherCurrencies} other currency${otherCurrencies === 1 ? "" : "s"}`
      : `${completedBookings} completed`;

  const isEmpty = !loading && vehicles.length === 0 && routes.length === 0;
  const recentBookings = bookings.slice(0, 4);

  // Pick the dominant earnings currency across the time-series (falls back
  // to the StatStrip's dominant currency for the empty-window case).
  const earningsTotalsByCur = new Map<string, number>();
  if (insights) {
    for (const d of insights.series) {
      for (const [cur, val] of Object.entries(d.earningsByCurrency)) {
        earningsTotalsByCur.set(cur, (earningsTotalsByCur.get(cur) ?? 0) + val);
      }
    }
  }
  const insightsCurrency =
    [...earningsTotalsByCur.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ??
    releasedCurrency;
  const earningsSeries = (insights?.series ?? []).map((d) => ({
    date: d.date,
    revenue: d.earningsByCurrency[insightsCurrency] ?? 0,
  }));
  const totalEarnings = earningsSeries.reduce((a, d) => a + d.revenue, 0);
  const totalBookings = (insights?.series ?? []).reduce(
    (a, d) => a + d.bookings,
    0,
  );
  const totalCompleted = (insights?.series ?? []).reduce(
    (a, d) => a + d.completedBookings,
    0,
  );
  const totalPaid = (insights?.series ?? []).reduce(
    (a, d) => a + d.paidBookings,
    0,
  );
  const deltas = insights
    ? {
        bookings: pctDelta(totalBookings, insights.prior.bookings),
        completed: pctDelta(totalCompleted, insights.prior.completedBookings),
        paid: pctDelta(totalPaid, insights.prior.paidBookings),
        earnings: pctDelta(
          totalEarnings,
          insights.prior.earningsByCurrency[insightsCurrency] ?? 0,
        ),
      }
    : null;
  // Adapt the BookingsTrendChart's expected `signups` series — we don't
  // surface signups to a transporter, so we feed it `completedBookings`
  // (a meaningful second line for them) and rename via the summary chips.
  const trendSeries = (insights?.series ?? []).map((d) => ({
    date: d.date,
    bookings: d.bookings,
    signups: d.completedBookings,
  }));

  return (
    <Page>
      <PageHeader
        kicker="Dashboard"
        title="Welcome back"
        subtitle="A quick look at your fleet, routes, and activity from today."
        action={
          <div className="flex items-center gap-2">
            <PeriodSelector value={days} onChange={setDays} />
            <PrimaryButton href="/dashboard/routes/add" icon={<PlusIcon className="w-4 h-4" />}>
              New route
            </PrimaryButton>
          </div>
        }
      />

      {/* Stat strip */}
      <Reveal className="mb-8">
        {loading ? (
          <StatsSkeleton />
        ) : (
          <StatStrip
            stats={[
              {
                label: "Fleet",
                value: vehicles.length,
                hint: vehicles.length === 1 ? "vehicle" : "vehicles",
                icon: <CarIcon className="w-4 h-4" />,
                tone: "emerald",
              },
              {
                label: "Active routes",
                value: activeRoutes,
                hint: `of ${routes.length} total`,
                icon: <MapPinIcon className="w-4 h-4" />,
                tone: "blue",
              },
              {
                label: "Pending bookings",
                value: pendingBookings,
                hint: pendingBookings > 0 ? "need review" : "all caught up",
                icon: <ClockIcon className="w-4 h-4" />,
                tone: "amber",
              },
              {
                // Transporter's net earnings — sum of RELEASED payouts in
                // their dominant currency. Mirrors what the Earnings page
                // shows ("Total released to you"), so the two never disagree.
                label: "Released earnings",
                value: formatPrice(releasedAmount, releasedCurrency),
                hint: earningsHint,
                icon: <CreditCardIcon className="w-4 h-4" />,
                tone: "rose",
              },
            ]}
          />
        )}
      </Reveal>

      {isEmpty && (
        <Reveal className="mb-8">
          <GettingStarted />
        </Reveal>
      )}

      {/* Insights: charts only render once the transporter has any routes /
          bookings — otherwise the empty hero (GettingStarted) is the focus. */}
      {!isEmpty && (
        <>
          <Reveal className="mb-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <ChartCard
                title="Activity trend"
                hint={`Bookings and completed trips · last ${days} days`}
                className="lg:col-span-2"
              >
                {loading || !insights ? (
                  <SummarySkeleton />
                ) : (
                  <ChartSummary
                    items={[
                      {
                        label: "Bookings",
                        value: totalBookings,
                        delta: deltas?.bookings,
                        tone: "emerald",
                      },
                      {
                        label: "Completed",
                        value: totalCompleted,
                        delta: deltas?.completed,
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
                  {insights && <BookingsTrendChart data={trendSeries} />}
                </ChartFrame>
              </ChartCard>

              <ChartCard title="Booking status" hint="Across your bookings">
                <ChartFrame
                  loading={loading || !insights}
                  refreshing={false}
                  height={260}
                >
                  {insights && (
                    <StatusDonut data={insights.statusBreakdown} />
                  )}
                </ChartFrame>
              </ChartCard>
            </div>
          </Reveal>

          <Reveal className="mb-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <ChartCard
                title="Earnings"
                hint={`Released payouts · last ${days} days`}
                className="lg:col-span-2"
              >
                {loading || !insights ? (
                  <SummarySkeleton />
                ) : (
                  <ChartSummary
                    items={[
                      {
                        label: `Earnings (${insightsCurrency})`,
                        value: totalEarnings,
                        delta: deltas?.earnings,
                        tone: "violet",
                        formatter: (v) => formatPrice(Number(v), insightsCurrency),
                      },
                      {
                        label: "Paid bookings",
                        value: totalPaid,
                        delta: deltas?.paid,
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
                      data={earningsSeries}
                      currency={insightsCurrency}
                    />
                  )}
                </ChartFrame>
              </ChartCard>

              <ChartCard title="Top routes" hint="Your most booked">
                <ChartFrame
                  loading={loading || !insights}
                  refreshing={insightsLoading}
                  height={200}
                >
                  {insights && <TopRoutesBar data={insights.topRoutes} />}
                </ChartFrame>
              </ChartCard>
            </div>
          </Reveal>
        </>
      )}

      {!isEmpty && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent bookings */}
          <Reveal className="lg:col-span-2">
            <SectionShell
              title="Recent bookings"
              hint="Latest activity across your routes"
              action={
                <Link
                  href="/dashboard/bookings"
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
                >
                  View all
                  <ArrowRightIcon className="w-3 h-3" />
                </Link>
              }
            >
              {loading ? (
                <div className="divide-y divide-slate-100">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-5 py-4">
                      <Skeleton className="w-9 h-9 rounded-full" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3 w-3/5" />
                        <Skeleton className="h-2.5 w-2/5" />
                      </div>
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : recentBookings.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <p className="text-sm text-slate-500">No bookings yet.</p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {recentBookings.map((booking) => {
                    const dep = new Date(booking.transport.departureDateTime);
                    const traveler = booking.user;
                    const initial = traveler?.name?.charAt(0).toUpperCase() || "U";
                    return (
                      <motion.li
                        key={booking.id}
                        whileHover={{ x: 2 }}
                        transition={spring}
                      >
                        <Link
                          href={`/dashboard/bookings/${booking.id}`}
                          className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/70 transition-colors"
                        >
                          {traveler?.avatarUrl ? (
                            <img
                              src={traveler.avatarUrl}
                              alt={traveler.name || "Traveler"}
                              className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-900 to-slate-600 text-white flex items-center justify-center text-xs font-semibold shrink-0">
                              {initial}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-zinc-950 truncate">
                              {booking.transport.departureCity} → {booking.transport.destinationCity}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                              {traveler?.name || "Traveler"} · {dep.toLocaleDateString()} · {booking.seatsBooked}{" "}
                              {booking.seatsBooked === 1 ? "seat" : "seats"}
                            </p>
                          </div>
                          <StatusPill
                            tone={
                              booking.status === "CONFIRMED"
                                ? "emerald"
                                : booking.status === "PENDING"
                                ? "yellow"
                                : booking.status === "IN_PROGRESS"
                                ? "orange"
                                : booking.status === "COMPLETED"
                                ? "blue"
                                : "red"
                            }
                            dot={booking.status === "PENDING" || booking.status === "CONFIRMED" || booking.status === "IN_PROGRESS"}
                          >
                            {formatBookingStatus(booking.status)}
                          </StatusPill>
                        </Link>
                      </motion.li>
                    );
                  })}
                </ul>
              )}
            </SectionShell>
          </Reveal>

          {/* Quick actions */}
          <Reveal>
            <SectionShell title="Quick actions" hint="One click away">
              <ul className="divide-y divide-slate-100">
                {quickActions.map((action) => (
                  <li key={action.href}>
                    <motion.div whileHover={{ x: 2 }} transition={spring}>
                      <Link
                        href={action.href}
                        className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/70 transition-colors group"
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${action.tone}`}>
                          {action.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-zinc-950">{action.title}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{action.description}</p>
                        </div>
                        <ArrowRightIcon className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                      </Link>
                    </motion.div>
                  </li>
                ))}
              </ul>
            </SectionShell>
          </Reveal>

          {/* Performance snapshot */}
          <Reveal className="lg:col-span-3">
            <SectionShell title="Activity snapshot" hint="Your recent traction">
              <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                <SnapshotTile icon={<CheckCircleIcon className="w-4 h-4 text-emerald-600" />} label="Completed rides" value={completedBookings} />
                <SnapshotTile icon={<ClockIcon className="w-4 h-4 text-amber-600" />} label="Awaiting action" value={pendingBookings} />
                <SnapshotTile icon={<UsersIcon className="w-4 h-4 text-blue-600" />} label="Confirmed now" value={confirmedBookings} />
                <SnapshotTile icon={<TrendingUpIcon className="w-4 h-4 text-rose-600" />} label="Total bookings" value={bookings.length} />
              </div>
            </SectionShell>
          </Reveal>
        </div>
      )}
    </Page>
  );
}

// ─── Getting Started (empty state) ────────────────────────────────────────────
function GettingStarted() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-emerald-950 text-white p-8 md:p-12">
      {/* Ambient glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl" />

      <div className="relative max-w-2xl">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-300 bg-emerald-500/10 ring-1 ring-emerald-400/20 rounded-full px-2.5 py-1 mb-5">
          <SparklesIcon className="w-3 h-3" />
          Getting started
        </div>
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-3">
          Let's get your fleet moving.
        </h2>
        <p className="text-sm text-slate-300 mb-7 max-w-md">
          Add your first vehicle, then create a route and you're ready to accept bookings from travelers in minutes.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/dashboard/vehicles/add"
            className="inline-flex items-center gap-2 bg-white text-zinc-950 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-100 active:scale-[0.98] transition-all"
          >
            <CarIcon className="w-4 h-4" />
            Add your first vehicle
          </Link>
          <Link
            href="/dashboard/routes/add"
            className="inline-flex items-center gap-2 bg-white/10 ring-1 ring-white/15 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/20 transition-all"
          >
            <MapPinIcon className="w-4 h-4" />
            Create a route
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Section Shell ────────────────────────────────────────────────────────────
function SectionShell({
  title,
  hint,
  action,
  children,
}: {
  title: string;
  hint?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200/80 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div>
          <h3 className="text-[13px] font-semibold text-zinc-950 tracking-tight">{title}</h3>
          {hint && <p className="text-[11px] text-slate-500 mt-0.5">{hint}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

// ─── Snapshot Tile ────────────────────────────────────────────────────────────
function SnapshotTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) {
  return (
    <div className="p-5">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{label}</p>
      </div>
      <p className="text-xl md:text-2xl font-semibold text-zinc-950 tabular-nums tracking-tight">{value}</p>
    </div>
  );
}

// ─── Chart helpers ───────────────────────────────────────────────────────────

function pctDelta(current: number, prior: number): number | null {
  if (prior === 0) return current === 0 ? 0 : null;
  return Math.round(((current - prior) / prior) * 100);
}

// Mirror of admin's ChartFrame — keeps the Recharts container mounted
// across data refetches so the chart never goes blank during a period
// switch (Recharts' ResponsiveContainer caches its parent measurement at
// mount and a fresh remount often draws zero-sized).
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

// ─── Skeleton for stat strip ──────────────────────────────────────────────────
function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
      {[...Array(4)].map((_, i) => (
        <div key={i} className={`p-5 lg:p-6 ${i < 3 ? "border-r border-slate-100" : ""} ${i < 2 ? "border-b lg:border-b-0" : ""}`}>
          <Skeleton className="h-3 w-16 mb-3" />
          <Skeleton className="h-8 w-20 mb-2" />
          <Skeleton className="h-3 w-24" />
        </div>
      ))}
    </div>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const quickActions = [
  {
    href: "/dashboard/vehicles/add",
    title: "Add a vehicle",
    description: "Register a new vehicle to your fleet",
    icon: <CarIcon className="w-4 h-4 text-emerald-700" />,
    tone: "bg-emerald-50",
  },
  {
    href: "/dashboard/routes/add",
    title: "Create a route",
    description: "Schedule a new trip for travelers",
    icon: <MapPinIcon className="w-4 h-4 text-blue-700" />,
    tone: "bg-blue-50",
  },
  {
    href: "/dashboard/bookings",
    title: "Review bookings",
    description: "Approve or reject pending requests",
    icon: <BookOpenIcon className="w-4 h-4 text-amber-700" />,
    tone: "bg-amber-50",
  },
  {
    href: "/dashboard/t-announcements",
    title: "Post announcement",
    description: "Share updates with passengers",
    icon: <MegaphoneIcon className="w-4 h-4 text-rose-700" />,
    tone: "bg-rose-50",
  },
];
