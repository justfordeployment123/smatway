"use client";

import { useEffect, useState } from "react";
import {
  Page, PageHeader, Card, Skeleton, ErrorState, EmptyState,
  SecondaryButton, TabFilter,
} from "@/app/_Components/ui";
import { DateSelect } from "@/app/_Components/DateSelect";
import { ListIcon } from "@/app/_Components/Icons";
import { listAdminAuditLog, AdminAuditEntry } from "@/lib/api";

// Date range buckets — user spec: "today | this week (today + previous 6
// days) | month | custom (day | month | year)". WEEK / MONTH are *rolling*
// windows back from today, not calendar Mon→Sun / 1st→last like the
// bookings page. No ALL TIME option — would scan the full audit table
// every load and gets expensive fast. TODAY is the default landing.
const RANGE_TABS = ["TODAY", "WEEK", "MONTH", "CUSTOM"] as const;
type RangeTab = (typeof RANGE_TABS)[number];
const RANGE_LABELS: Record<RangeTab, string> = {
  TODAY: "TODAY",
  WEEK: "THIS WEEK",
  MONTH: "THIS MONTH",
  CUSTOM: "CUSTOM",
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

interface CustomDate { year?: number; month?: number; day?: number }

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

/**
 * Convert range + (optionally) custom date to ISO `from`/`to` boundaries.
 *
 *   TODAY  → 00:00 today                   → 00:00 tomorrow
 *   WEEK   → 00:00 (today − 6 days)        → 00:00 tomorrow   (= today + 6 prior = 7 days inclusive)
 *   MONTH  → 00:00 (today − 29 days)       → 00:00 tomorrow
 *   CUSTOM → year, year+month, or full date — partial selections honored
 *
 * No "all time" branch — the page never sends an unbounded query because
 * scanning the full audit table on every load would be expensive once the
 * platform has run for a while.
 */
function rangeBoundaries(r: RangeTab, custom?: CustomDate): { from?: string; to?: string } {
  if (r === "CUSTOM") {
    if (!custom?.year) return {};
    const y = custom.year;
    const hasMonth = custom.month != null;
    const hasDay = hasMonth && custom.day != null;
    const monthIdx = hasMonth ? custom.month! : 0;
    const dayIdx = hasDay ? custom.day! : 1;
    const from = new Date(y, monthIdx, dayIdx, 0, 0, 0, 0);
    // `lt` boundary so to/end-of-day overflow isn't an issue — we pass an
    // exclusive upper bound and let the backend filter on `< to`.
    const to = hasDay
      ? new Date(y, monthIdx, dayIdx + 1, 0, 0, 0, 0)
      : hasMonth
      ? new Date(y, monthIdx + 1, 1, 0, 0, 0, 0)
      : new Date(y + 1, 0, 1, 0, 0, 0, 0);
    return { from: from.toISOString(), to: to.toISOString() };
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const from = new Date(today);
  if (r === "WEEK") from.setDate(from.getDate() - 6);
  else if (r === "MONTH") from.setDate(from.getDate() - 29);
  return { from: from.toISOString(), to: tomorrow.toISOString() };
}

export default function AuditPage() {
  const [rows, setRows] = useState<AdminAuditEntry[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<RangeTab>("TODAY");
  const [custom, setCustom] = useState<CustomDate>({});

  // Wipe stored y/m/d when leaving CUSTOM so re-opening it later starts fresh
  // instead of silently re-applying yesterday's selection.
  useEffect(() => {
    if (range !== "CUSTOM" && (custom.year || custom.month != null || custom.day != null)) {
      setCustom({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  function load(reset = true) {
    if (reset) { setLoading(true); setRows([]); setNextCursor(null); } else { setLoadingMore(true); }
    setError(null);
    const { from, to } = rangeBoundaries(range, custom);
    listAdminAuditLog({
      cursor: reset ? undefined : nextCursor ?? undefined,
      limit: 50,
      from,
      to,
    })
      .then((res) => {
        setRows((prev) => (reset ? res.logs : [...prev, ...res.logs]));
        setNextCursor(res.nextCursor);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load audit log"))
      .finally(() => { setLoading(false); setLoadingMore(false); });
  }

  // Refetch from page 1 whenever the range or custom date changes.
  useEffect(() => { load(true); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [range, custom]);

  return (
    <Page className="space-y-6">
      <PageHeader
        kicker="Forensics"
        title="Audit log"
        subtitle="Append-only record of every admin write action — who did what, when, and from where."
      />

      <Card>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 mb-1.5">Date</p>
        <TabFilter<RangeTab>
          tabs={RANGE_TABS}
          value={range}
          onChange={setRange}
          formatLabel={(t) => RANGE_LABELS[t]}
        />
        {range === "CUSTOM" && <CustomDatePicker value={custom} onChange={setCustom} />}
      </Card>

      {error && <ErrorState message={error} onRetry={() => load(true)} />}

      <Card className="!p-0 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<ListIcon />}
            title="Nothing in that range"
            description="Try a wider range — switch to THIS WEEK / THIS MONTH or pick a custom date."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/50 text-[11px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold">When</th>
                  <th className="text-left px-5 py-3 font-semibold">Admin</th>
                  <th className="text-left px-5 py-3 font-semibold">Action</th>
                  <th className="text-left px-5 py-3 font-semibold">Target</th>
                  <th className="text-left px-5 py-3 font-semibold">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-3 text-[12px] text-slate-500 font-mono whitespace-nowrap">
                      {new Date(r.createdAt).toLocaleString(undefined, {
                        day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit",
                      })}
                    </td>
                    <td className="px-5 py-3">
                      <div className="font-semibold text-zinc-950">{r.adminLabel}</div>
                      {r.adminLabel === "ENV_SUPERADMIN" && (
                        <div className="text-[10px] text-amber-700">env bootstrap</div>
                      )}
                    </td>
                    <td className="px-5 py-3 font-mono text-emerald-700">{r.action}</td>
                    <td className="px-5 py-3 text-slate-700">
                      {r.targetType ? (
                        <>
                          <div className="text-sm">{r.targetType}</div>
                          {r.targetId && <div className="text-[10px] text-slate-400 font-mono truncate max-w-[200px]">{r.targetId}</div>}
                        </>
                      ) : "—"}
                    </td>
                    <td className="px-5 py-3 text-[11px] text-slate-500 font-mono">{r.ipAddress ?? "—"}</td>
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

// ─── Custom date picker ──────────────────────────────────────────────────────
// Three styled selects (Year / Month / Day). Identical UX to the bookings
// page picker — Year unlocks Month, Month unlocks Day. Day options clamp
// to the actual month length so picking Feb 31 isn't possible.
function CustomDatePicker({
  value,
  onChange,
}: {
  value: CustomDate;
  onChange: (next: CustomDate) => void;
}) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
  const dayCount = value.year != null && value.month != null
    ? daysInMonth(value.year, value.month)
    : 31;
  const days = Array.from({ length: dayCount }, (_, i) => i + 1);

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <DateSelect
        ariaLabel="Year"
        placeholder="Year"
        value={value.year}
        onChange={(v) => onChange({ ...value, year: v ?? undefined, month: v == null ? undefined : value.month, day: v == null ? undefined : value.day })}
        options={years.map((y) => ({ value: y, label: String(y) }))}
      />
      <DateSelect
        ariaLabel="Month"
        placeholder="Month"
        value={value.month}
        disabled={value.year == null}
        onChange={(v) => {
          const nextMonth = v ?? undefined;
          let nextDay = value.day;
          if (nextMonth != null && value.year != null && nextDay != null) {
            const max = daysInMonth(value.year, nextMonth);
            if (nextDay > max) nextDay = undefined;
          }
          onChange({ ...value, month: nextMonth, day: v == null ? undefined : nextDay });
        }}
        options={MONTH_NAMES.map((name, i) => ({ value: i, label: name }))}
      />
      <DateSelect
        ariaLabel="Day"
        placeholder="Day"
        value={value.day}
        disabled={value.month == null}
        onChange={(v) => onChange({ ...value, day: v ?? undefined })}
        options={days.map((d) => ({ value: d, label: String(d) }))}
      />
      {(value.year != null || value.month != null || value.day != null) && (
        <button
          type="button"
          onClick={() => onChange({})}
          className="text-[11px] font-semibold text-slate-500 hover:text-zinc-900 underline-offset-2 hover:underline"
        >
          Clear
        </button>
      )}
      <span className="ml-auto text-[11px] text-slate-400">
        {describeCustomRange(value)}
      </span>
    </div>
  );
}

function describeCustomRange(v: CustomDate): string {
  if (v.year == null) return "Pick a year to start.";
  if (v.month == null) return `All of ${v.year}`;
  const monthName = MONTH_NAMES[v.month];
  if (v.day == null) return `${monthName} ${v.year}`;
  return `${monthName} ${v.day}, ${v.year}`;
}

// DateSelect moved to @/app/_Components/DateSelect — shared with bookings + routes pages.
