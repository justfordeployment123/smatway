"use client";

// Chart primitives for the admin dashboard. Recharts under the hood with a
// premium-feeling skin: sparklines, big-number summaries with prior-period
// deltas, gradient fills, smooth curves, and value labels on bars. Each
// component is self-contained so the dashboard page just composes them.

import { ReactNode } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// ─── Tokens ──────────────────────────────────────────────────────────────────

const PALETTE = {
  emerald: "#10b981",
  emeraldDark: "#059669",
  blue: "#3b82f6",
  amber: "#f59e0b",
  rose: "#f43f5e",
  violet: "#8b5cf6",
  violetDark: "#7c3aed",
  slate: "#94a3b8",
} as const;

const STATUS_COLOR: Record<string, string> = {
  PENDING: PALETTE.amber,
  CONFIRMED: PALETTE.emerald,
  IN_PROGRESS: PALETTE.blue,
  COMPLETED: PALETTE.violet,
  CANCELLED: PALETTE.rose,
};

const TONE_TEXT: Record<string, string> = {
  emerald: "text-emerald-600",
  blue: "text-blue-600",
  violet: "text-violet-600",
  amber: "text-amber-600",
  rose: "text-rose-600",
};

const TONE_DOT: Record<string, string> = {
  emerald: "bg-emerald-500",
  blue: "bg-blue-500",
  violet: "bg-violet-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
};

// ─── Shared shell ────────────────────────────────────────────────────────────

export function ChartCard({
  title,
  hint,
  action,
  children,
  className = "",
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative rounded-2xl border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] overflow-hidden ${className}`}
    >
      {/* Soft top-fade for depth */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200/80 to-transparent pointer-events-none" />
      <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-2">
        <div className="min-w-0">
          <h3 className="text-[13px] font-semibold text-zinc-950 tracking-tight">
            {title}
          </h3>
          {hint && (
            <p className="text-[11px] text-slate-500 mt-0.5">{hint}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="px-2 pb-3">{children}</div>
    </div>
  );
}

// ─── Big-number summary ──────────────────────────────────────────────────────

export function ChartSummary({
  items,
}: {
  items: Array<{
    label: string;
    value: number | string;
    delta?: number | null;
    tone: "emerald" | "blue" | "violet" | "amber" | "rose";
    formatter?: (v: number | string) => string;
  }>;
}) {
  return (
    <div className="flex flex-wrap items-end gap-x-7 gap-y-3 px-3 pt-1 pb-4">
      {items.map((it) => (
        <div key={it.label} className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${TONE_DOT[it.tone]}`} />
            <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
              {it.label}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold tabular-nums tracking-tight text-zinc-950 leading-none">
              {it.formatter
                ? it.formatter(it.value)
                : typeof it.value === "number"
                ? it.value.toLocaleString()
                : it.value}
            </span>
            {it.delta !== undefined && it.delta !== null && (
              <DeltaPill delta={it.delta} />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function DeltaPill({ delta }: { delta: number }) {
  // `delta` is a percent integer. Treat exact 0 as a flat indicator instead
  // of a hollow positive — visually cleaner for new tenants on day 1.
  if (delta === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-slate-500 bg-slate-100 ring-1 ring-inset ring-slate-200 rounded-full px-1.5 py-0.5">
        — 0%
      </span>
    );
  }
  const positive = delta > 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[10px] font-semibold rounded-full px-1.5 py-0.5 ring-1 ring-inset ${
        positive
          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
          : "bg-rose-50 text-rose-700 ring-rose-200"
      }`}
    >
      <svg
        className={`w-2.5 h-2.5 ${positive ? "" : "rotate-180"}`}
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="2 7 6 3 10 7" />
      </svg>
      {positive ? "+" : ""}
      {delta}%
    </span>
  );
}

export function PeriodSelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const options = [7, 14, 30];
  return (
    <div className="inline-flex items-center bg-slate-100/80 rounded-lg p-0.5 gap-0.5">
      {options.map((o) => {
        const active = o === value;
        return (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-md transition-all ${
              active
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {o}D
          </button>
        );
      })}
    </div>
  );
}

// ─── Empty state + tooltip ───────────────────────────────────────────────────

function ChartEmpty({ message, height = 220 }: { message?: string; height?: number }) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center px-6"
      style={{ height }}
    >
      <div className="w-10 h-10 rounded-full bg-slate-50 ring-1 ring-slate-200 mb-3" />
      <p className="text-sm font-medium text-slate-600">No data yet</p>
      <p className="text-[11px] text-slate-400 mt-1">
        {message ?? "This chart will fill in as activity comes in."}
      </p>
    </div>
  );
}

type TooltipItem = {
  value?: number | string;
  name?: string | number;
  color?: string;
};

type CustomTooltipProps = {
  active?: boolean;
  payload?: TooltipItem[];
  label?: string | number;
  formatter?: (value: number, name: string) => string;
};

function CustomTooltip({ active, payload, label, formatter }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 backdrop-blur-md px-3 py-2 shadow-[0_8px_32px_rgba(15,23,42,0.12)]">
      {label !== undefined && (
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 mb-1.5">
          {label}
        </p>
      )}
      <div className="space-y-1">
        {payload.map((p: TooltipItem, i: number) => (
          <div key={i} className="flex items-center gap-2.5 text-xs">
            <span
              className="w-2 h-2 rounded-full ring-2"
              style={{
                background: p.color ?? PALETTE.slate,
                boxShadow: `0 0 0 2px ${(p.color ?? PALETTE.slate)}22`,
              }}
            />
            <span className="text-slate-500 capitalize">{String(p.name ?? "")}</span>
            <span className="ml-auto font-semibold tabular-nums text-zinc-950">
              {formatter
                ? formatter(Number(p.value ?? 0), String(p.name ?? ""))
                : Number(p.value ?? 0).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Sparkline (for KPI tiles) ───────────────────────────────────────────────

export function Sparkline({
  data,
  tone = "emerald",
  height = 36,
}: {
  data: Array<{ value: number }>;
  tone?: "emerald" | "blue" | "violet" | "rose" | "amber";
  height?: number;
}) {
  const total = data.reduce((acc, d) => acc + d.value, 0);
  const color =
    tone === "blue"
      ? PALETTE.blue
      : tone === "violet"
      ? PALETTE.violet
      : tone === "rose"
      ? PALETTE.rose
      : tone === "amber"
      ? PALETTE.amber
      : PALETTE.emerald;

  if (total === 0) {
    // A flat slate line is cleaner than a missing chart on a brand-new
    // tenant — communicates "tracking, just nothing yet".
    return (
      <div className="w-full" style={{ height }}>
        <div className="h-full w-full flex items-center">
          <div className="h-px w-full bg-slate-200" />
        </div>
      </div>
    );
  }

  // Compute a Y-domain that puts the baseline a hair above the bottom edge
  // (so a long stretch of 0s doesn't render as a 1px line glued to the
  // container floor) and gives the peak some headroom (so the spike doesn't
  // touch the top edge either). Without this, sparkline data of the shape
  // [0, 0, 0, ... , 12, 0] reads as a glitchy hairline rather than a curve.
  const max = data.reduce((m, d) => (d.value > m ? d.value : m), 0);
  const yMin = -Math.max(max * 0.08, 0.5);
  const yMax = max * 1.15 || 1;
  const id = `spark-${tone}`;
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer>
        <AreaChart
          data={data}
          margin={{ top: 4, right: 2, bottom: 2, left: 2 }}
        >
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.42} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis hide domain={[yMin, yMax]} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={`url(#${id})`}
            isAnimationActive={false}
            baseValue={0}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Trend: bookings + signups ───────────────────────────────────────────────

export function BookingsTrendChart({
  data,
}: {
  data: Array<{ date: string; bookings: number; signups: number }>;
}) {
  const totalActivity = data.reduce(
    (acc, d) => acc + d.bookings + d.signups,
    0
  );
  if (totalActivity === 0) return <ChartEmpty height={260} />;

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 28, right: 16, left: 0, bottom: 8 }}>
          <defs>
            <linearGradient id="gradBookings" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={PALETTE.emerald} stopOpacity={0.4} />
              <stop offset="60%" stopColor={PALETTE.emerald} stopOpacity={0.08} />
              <stop offset="100%" stopColor={PALETTE.emerald} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradSignups" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={PALETTE.blue} stopOpacity={0.32} />
              <stop offset="60%" stopColor={PALETTE.blue} stopOpacity={0.06} />
              <stop offset="100%" stopColor={PALETTE.blue} stopOpacity={0} />
            </linearGradient>
            <filter id="glowEmerald" x="-10%" y="-30%" width="120%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feFlood floodColor={PALETTE.emerald} floodOpacity="0.35" />
              <feComposite in2="blur" operator="in" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <CartesianGrid
            strokeDasharray="3 6"
            stroke="#e2e8f0"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            stroke={PALETTE.slate}
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tickFormatter={shortDate}
            interval="preserveStartEnd"
            minTickGap={20}
          />
          <YAxis
            stroke={PALETTE.slate}
            fontSize={10}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            width={28}
            domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.25)]}
          />
          <Tooltip
            content={<CustomTooltip />}
            labelFormatter={(v) => shortDate(String(v))}
            cursor={{ stroke: "#cbd5e1", strokeDasharray: "3 3" }}
          />
          <Area
            type="monotone"
            dataKey="signups"
            stroke={PALETTE.blue}
            strokeWidth={2}
            fill="url(#gradSignups)"
            activeDot={{ r: 5, fill: "white", stroke: PALETTE.blue, strokeWidth: 2 }}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="bookings"
            stroke={PALETTE.emerald}
            strokeWidth={2.5}
            fill="url(#gradBookings)"
            activeDot={{ r: 5, fill: "white", stroke: PALETTE.emerald, strokeWidth: 2.5 }}
            style={{ filter: "url(#glowEmerald)" }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Revenue line ────────────────────────────────────────────────────────────

export function RevenueLineChart({
  data,
  currency,
}: {
  data: Array<{ date: string; revenue: number }>;
  currency: string;
}) {
  const total = data.reduce((acc, d) => acc + d.revenue, 0);
  if (total === 0)
    return <ChartEmpty height={260} message="Paid bookings will trend here." />;

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 28, right: 16, left: 0, bottom: 8 }}>
          <defs>
            <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={PALETTE.violet} stopOpacity={0.4} />
              <stop offset="60%" stopColor={PALETTE.violet} stopOpacity={0.08} />
              <stop offset="100%" stopColor={PALETTE.violet} stopOpacity={0} />
            </linearGradient>
            <filter id="glowViolet" x="-10%" y="-30%" width="120%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feFlood floodColor={PALETTE.violet} floodOpacity="0.35" />
              <feComposite in2="blur" operator="in" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <CartesianGrid
            strokeDasharray="3 6"
            stroke="#e2e8f0"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            stroke={PALETTE.slate}
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tickFormatter={shortDate}
            interval="preserveStartEnd"
            minTickGap={20}
          />
          <YAxis
            stroke={PALETTE.slate}
            fontSize={10}
            tickLine={false}
            axisLine={false}
            width={48}
            tickFormatter={(v) => formatCompact(Number(v ?? 0))}
            domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.25)]}
          />
          <Tooltip
            content={
              <CustomTooltip
                formatter={(v) => `${currency} ${v.toLocaleString()}`}
              />
            }
            labelFormatter={(v) => shortDate(String(v))}
            cursor={{ stroke: "#cbd5e1", strokeDasharray: "3 3" }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke={PALETTE.violet}
            strokeWidth={2.5}
            fill="url(#gradRevenue)"
            activeDot={{ r: 5, fill: "white", stroke: PALETTE.violet, strokeWidth: 2.5 }}
            style={{ filter: "url(#glowViolet)" }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Status donut ────────────────────────────────────────────────────────────

export function StatusDonut({
  data,
}: {
  data: Array<{ status: string; count: number }>;
}) {
  const total = data.reduce((acc, d) => acc + d.count, 0);
  if (total === 0) return <ChartEmpty />;

  const ordered = [...data].sort((a, b) => b.count - a.count);

  return (
    <div className="flex flex-col px-4 pb-3 pt-1" style={{ minHeight: 260 }}>
      {/* Upper half: donut centred, expands to fill leftover height */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative w-[196px] h-[196px]">
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-slate-50 to-white ring-1 ring-slate-100/80 pointer-events-none" />
          <ResponsiveContainer>
            <PieChart>
              <defs>
                {ordered.map((d) => {
                  const c = STATUS_COLOR[d.status] ?? PALETTE.slate;
                  return (
                    <linearGradient
                      key={d.status}
                      id={`donut-${d.status}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor={c} stopOpacity={1} />
                      <stop offset="100%" stopColor={c} stopOpacity={0.78} />
                    </linearGradient>
                  );
                })}
              </defs>
              <Pie
                data={ordered}
                dataKey="count"
                nameKey="status"
                innerRadius={62}
                outerRadius={90}
                paddingAngle={3}
                stroke="white"
                strokeWidth={2}
                cornerRadius={4}
                isAnimationActive={false}
              >
                {ordered.map((d, i) => (
                  <Cell key={i} fill={`url(#donut-${d.status})`} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 grid place-items-center pointer-events-none">
            <div className="text-center">
              <p className="text-[9px] uppercase tracking-[0.12em] text-slate-400 font-semibold">
                Total
              </p>
              <p className="text-[1.75rem] font-semibold tabular-nums text-zinc-950 leading-none mt-1">
                {total.toLocaleString()}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">bookings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lower half: 2-col legend */}
      <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
        {ordered.map((d) => {
          const pct = total === 0 ? 0 : Math.round((d.count / total) * 100);
          return (
            <li key={d.status} className="flex items-center gap-2 text-xs min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-sm shrink-0"
                style={{
                  background: STATUS_COLOR[d.status] ?? PALETTE.slate,
                  boxShadow: `0 0 0 3px ${(STATUS_COLOR[d.status] ?? PALETTE.slate)}1a`,
                }}
              />
              <span className="text-slate-600 capitalize truncate flex-1">
                {d.status.toLowerCase().replace(/_/g, " ")}
              </span>
              <span className="shrink-0 flex items-center gap-1.5">
                <span className="font-semibold tabular-nums text-zinc-950">
                  {d.count}
                </span>
                <span className="text-[10px] text-slate-400 tabular-nums w-7 text-right">
                  {pct}%
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ─── Top routes (horizontal bars) ────────────────────────────────────────────

export function TopRoutesBar({
  data,
}: {
  data: Array<{
    transportId: string;
    departureCity: string;
    destinationCity: string;
    bookings: number;
  }>;
}) {
  if (data.length === 0)
    return <ChartEmpty message="Top-booked routes show up here." />;

  const max = data.reduce((m, d) => (d.bookings > m ? d.bookings : m), 0) || 1;

  return (
    <div className="px-4 pt-2 pb-3 space-y-3.5">
      {data.map((r) => {
        const pct = (r.bookings / max) * 100;
        const label = `${r.departureCity} → ${r.destinationCity}`;
        return (
          <div key={r.transportId} className="group space-y-1.5">
            {/* Label row: full route name + booking count */}
            <div className="flex items-center justify-between gap-2">
              <span
                className="text-[12px] font-medium text-slate-700 truncate"
                title={label}
              >
                {r.departureCity}
                <span className="text-slate-400 mx-1">→</span>
                {r.destinationCity}
              </span>
              <span className="text-[12px] font-semibold tabular-nums text-zinc-950 shrink-0">
                {r.bookings.toLocaleString()}
              </span>
            </div>
            {/* Full-width bar */}
            <div className="relative h-[7px] bg-slate-100 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 group-hover:from-emerald-500 group-hover:to-emerald-700 transition-all"
                style={{
                  width: `${Math.max(pct, 2)}%`,
                  boxShadow: "0 0 0 1px rgba(16,185,129,0.18) inset",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function shortDate(iso: string): string {
  if (!iso || iso.length < 10) return iso ?? "";
  const d = new Date(iso + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

export { TONE_TEXT, TONE_DOT };
