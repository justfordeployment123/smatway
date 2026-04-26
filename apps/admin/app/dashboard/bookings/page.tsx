"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Page, PageHeader, Card, Skeleton, ErrorState, EmptyState, StatusPill, SecondaryButton, TabFilter } from "@/app/_Components/ui";
import { DateSelect } from "@/app/_Components/DateSelect";
import { BookOpenIcon } from "@/app/_Components/Icons";
import { listAdminBookings, getAdminBookingStats, adminCancelBooking, adminMe, AdminBookingRow, AdminBookingStats } from "@/lib/api";
import { ADMIN_PERMISSIONS } from "@/lib/permissions";
import { formatMoney } from "@/lib/format";
import { formatBookingStatus, deriveBookingStage, STAGE_TONE, formatStageLabel } from "@/lib/bookingStatus";

const STATUS_TABS = ["", "PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const;
const PAYMENT_TABS = ["", "PENDING", "PAID", "FAILED"] as const;
const RANGE_TABS = ["", "TODAY", "WEEK", "MONTH", "CUSTOM"] as const;
type StatusTab = (typeof STATUS_TABS)[number];
type PaymentTab = (typeof PAYMENT_TABS)[number];
type RangeTab = (typeof RANGE_TABS)[number];

function statusTabLabel(t: StatusTab) {
  if (t === "") return "ALL";
  return formatBookingStatus(t);
}
function paymentTabLabel(t: PaymentTab) {
  if (t === "") return "ALL";
  return t;
}
const RANGE_LABELS: Record<RangeTab, string> = {
  "": "ALL TIME",
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
 * Convert a {@link RangeTab} to ISO `from`/`to` boundaries.
 *
 * Calendar-true: WEEK starts on the most recent Monday, MONTH starts on the
 * 1st of the current month. CUSTOM honors partial selections — year only
 * spans the whole year, year+month spans the whole month, full y/m/d picks a
 * single day. Empty (no year picked) is a no-op so we don't accidentally
 * filter to "year 1970".
 */
function rangeBoundaries(r: RangeTab, custom?: CustomDate): { from?: string; to?: string } {
  if (r === "") return {};
  if (r === "CUSTOM") {
    if (!custom?.year) return {};
    const y = custom.year;
    const hasMonth = custom.month != null;
    const hasDay = hasMonth && custom.day != null;
    const monthIdx = hasMonth ? custom.month! : 0;
    const dayIdx = hasDay ? custom.day! : 1;
    const from = new Date(y, monthIdx, dayIdx, 0, 0, 0, 0);
    const to = hasDay
      ? new Date(y, monthIdx, dayIdx, 23, 59, 59, 999)
      : hasMonth
      ? new Date(y, monthIdx + 1, 0, 23, 59, 59, 999) // last day of selected month
      : new Date(y, 11, 31, 23, 59, 59, 999); // last day of selected year
    return { from: from.toISOString(), to: to.toISOString() };
  }
  const now = new Date();
  const from = new Date(now);
  from.setHours(0, 0, 0, 0);
  if (r === "WEEK") {
    // Roll back to Monday: getDay() returns 0=Sun..6=Sat; we want 1=Mon as 0.
    const offsetToMonday = (from.getDay() + 6) % 7;
    from.setDate(from.getDate() - offsetToMonday);
  } else if (r === "MONTH") {
    from.setDate(1);
  }
  return { from: from.toISOString(), to: now.toISOString() };
}

export default function BookingsPage() {
  const [rows, setRows] = useState<AdminBookingRow[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusTab>("");
  const [paymentStatus, setPaymentStatus] = useState<PaymentTab>("");
  const [range, setRange] = useState<RangeTab>("");
  const [custom, setCustom] = useState<CustomDate>({});
  const [stats, setStats] = useState<AdminBookingStats | null>(null);
  // Pull the admin's role + permissions so the cancel button only renders
  // for admins with bookings:edit (or SUPER_ADMIN).
  const [canEditBookings, setCanEditBookings] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<AdminBookingRow | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  useEffect(() => {
    adminMe()
      .then((me) => {
        const ok =
          me.role === "SUPER_ADMIN" ||
          (me.permissions ?? []).includes(ADMIN_PERMISSIONS.BOOKINGS_EDIT);
        setCanEditBookings(ok);
      })
      .catch(() => { /* unauth handled by api interceptor */ });
  }, []);

  async function confirmCancel() {
    if (!cancelTarget) return;
    setCancelling(true);
    setCancelError(null);
    try {
      const result = await adminCancelBooking(cancelTarget.id, cancelReason || undefined);
      // Patch the row in place so the table reflects the new state without
      // a full refetch. Status flips to CANCELLED; payment status doesn't
      // change (refund is a separate finance step).
      setRows((rs) => rs.map((r) => r.id === cancelTarget.id ? { ...r, status: "CANCELLED" } : r));
      setCancelTarget(null);
      setCancelReason("");
      if (result.refundRequired) {
        // Soft alert — don't block the UI, just remind the operator.
        alert("Booking cancelled. The traveler had already paid — a manual refund still needs to be issued from the Finance tab.");
      }
    } catch (e) {
      setCancelError(e instanceof Error ? e.message : "Failed to cancel");
    } finally {
      setCancelling(false);
    }
  }

  // When the user moves away from CUSTOM, drop their stored year/month/day so
  // the next time they open it they start fresh — keeps the selects honest.
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
    listAdminBookings({
      status: status || undefined,
      paymentStatus: paymentStatus || undefined,
      from,
      to,
      cursor: reset ? undefined : nextCursor ?? undefined,
    })
      .then((res) => {
        setRows((prev) => (reset ? res.bookings : [...prev, ...res.bookings]));
        setNextCursor(res.nextCursor);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load bookings"))
      .finally(() => { setLoading(false); setLoadingMore(false); });
  }

  // Counts for the TabFilter badges. Refetched whenever any filter changes —
  // the backend returns counts that respect the *other* filters, so the
  // numbers always answer "if I switch this tab, how many will I see?"
  useEffect(() => {
    const { from, to } = rangeBoundaries(range, custom);
    getAdminBookingStats({
      status: status || undefined,
      paymentStatus: paymentStatus || undefined,
      from,
      to,
    })
      .then(setStats)
      .catch(() => { /* counts are nice-to-have — don't surface errors */ });
  }, [status, paymentStatus, range, custom]);

  useEffect(() => { load(true); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [status, paymentStatus, range, custom]);

  // Build the count maps the TabFilter expects (keyed on tab values, including "" for ALL).
  const statusCounts: Partial<Record<StatusTab, number>> = stats
    ? {
        "": Object.values(stats.byStatus).reduce((a, b) => a + b, 0),
        PENDING: stats.byStatus.PENDING,
        CONFIRMED: stats.byStatus.CONFIRMED,
        IN_PROGRESS: stats.byStatus.IN_PROGRESS,
        COMPLETED: stats.byStatus.COMPLETED,
        CANCELLED: stats.byStatus.CANCELLED,
      }
    : {};
  const paymentCounts: Partial<Record<PaymentTab, number>> = stats
    ? {
        "": Object.values(stats.byPayment).reduce((a, b) => a + b, 0),
        PENDING: stats.byPayment.PENDING,
        PAID: stats.byPayment.PAID,
        FAILED: stats.byPayment.FAILED,
      }
    : {};

  return (
    <Page className="space-y-6">
      <PageHeader kicker="Trade" title="Bookings" subtitle="Every booking — pending, confirmed, completed, cancelled." />

      <Card className="space-y-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 mb-1.5">Status</p>
          <TabFilter<StatusTab>
            tabs={STATUS_TABS}
            value={status}
            onChange={setStatus}
            counts={statusCounts}
            formatLabel={statusTabLabel}
          />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 mb-1.5">Payment</p>
          <TabFilter<PaymentTab>
            tabs={PAYMENT_TABS}
            value={paymentStatus}
            onChange={setPaymentStatus}
            counts={paymentCounts}
            formatLabel={paymentTabLabel}
          />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 mb-1.5">Date</p>
          <TabFilter<RangeTab>
            tabs={RANGE_TABS}
            value={range}
            onChange={setRange}
            formatLabel={(t) => RANGE_LABELS[t]}
          />
          {range === "CUSTOM" && <CustomDatePicker value={custom} onChange={setCustom} />}
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
                  {canEditBookings && (
                    <th className="text-right px-5 py-3 font-semibold">Actions</th>
                  )}
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
                      {(() => {
                        // Derived stage gives admin the unified lifecycle
                        // (PENDING / CONFIRMED / PAID / IN TRANSIT / COMPLETED
                        // / RECEIVED / CANCELLED). The separate Status filter
                        // tabs above still drive server-side filtering by raw
                        // BookingStatus.
                        const stage = deriveBookingStage(b);
                        return (
                          <StatusPill tone={STAGE_TONE[stage]}>
                            {formatStageLabel(stage)}
                          </StatusPill>
                        );
                      })()}
                    </td>
                    <td className="px-5 py-3">
                      <StatusPill tone={paymentTone(b.paymentStatus)}>{b.paymentStatus}</StatusPill>
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">{b.seatsBooked}</td>
                    <td className="px-5 py-3 text-right font-mono tabular-nums">{formatMoney(b.totalPrice, b.transport.currency)}</td>
                    <td className="px-5 py-3 text-right text-[11px] text-slate-500">
                      {new Date(b.createdAt).toLocaleDateString(undefined, { day: "2-digit", month: "short" })}
                    </td>
                    {canEditBookings && (
                      <td className="px-5 py-3 text-right">
                        {/* Force-cancel only makes sense pre-completion. A
                            COMPLETED booking is terminal; CANCELLED is
                            already done. */}
                        {b.status !== "COMPLETED" && b.status !== "CANCELLED" && (
                          <button
                            onClick={() => { setCancelTarget(b); setCancelReason(""); setCancelError(null); }}
                            className="text-[11px] font-semibold text-red-600 hover:text-red-700 hover:underline"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Force-cancel confirmation modal */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl ring-1 ring-slate-200">
            <div className="px-6 py-5 border-b border-slate-100">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-red-600">Force cancel</div>
              <h3 className="mt-1 text-lg font-semibold text-zinc-950">
                {cancelTarget.transport.departureCity} → {cancelTarget.transport.destinationCity}
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                {cancelTarget.traveler?.name || cancelTarget.traveler?.email || "—"} · {cancelTarget.seatsBooked} seat{cancelTarget.seatsBooked === 1 ? "" : "s"}
              </p>
            </div>
            <div className="px-6 py-5 space-y-4">
              {cancelTarget.paymentStatus === "PAID" && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-900">
                  This booking is <strong>PAID</strong>. Cancelling here only frees the seats and notifies both parties — you'll still need to issue the refund from the Finance tab.
                </div>
              )}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Reason (optional)</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  maxLength={500}
                  rows={3}
                  placeholder="Why is admin force-cancelling? (Logged in the audit trail.)"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400"
                />
              </div>
              {cancelError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {cancelError}
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setCancelTarget(null)}
                disabled={cancelling}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
              >
                Back
              </button>
              <button
                onClick={confirmCancel}
                disabled={cancelling}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {cancelling ? "Cancelling…" : "Force cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

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

function statusTone(s: string): "emerald" | "yellow" | "red" | "slate" | "blue" | "orange" {
  if (s === "COMPLETED") return "emerald";
  if (s === "CONFIRMED") return "blue";
  if (s === "IN_PROGRESS") return "orange";
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

// ─── Custom date picker ──────────────────────────────────────────────────────
// Three styled selects (Year / Month / Day). Each is optional — leaving Day
// blank filters by month, leaving Month blank filters by year. Selecting a
// month resets day if it's now invalid (e.g. switching from Jan to Feb when
// day was 31). Year list is current year ± 5.
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
          // Clamp day if switching to a shorter month
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

// DateSelect moved to @/app/_Components/DateSelect — shared with audit + routes pages.
