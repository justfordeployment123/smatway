"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Page, PageHeader, Card, Skeleton, ErrorState, EmptyState, StatusPill, SecondaryButton, TabFilter } from "@/app/_Components/ui";
import { CashIcon } from "@/app/_Components/Icons";
import {
  listAdminPayouts, releaseAdminPayout, markAdminPayoutFailed,
  reconcileAdminPayout, getPlatformSettings, AdminPayoutRow, PayoutStatus, PayoutTrigger,
  PlatformSettings,
} from "@/lib/api";
import { adminCan, getAdminProfile } from "@/lib/auth";
import { ADMIN_PERMISSIONS } from "@/lib/permissions";
import { formatMoney } from "@/lib/format";

export default function PayoutsPage() {
  const [rows, setRows] = useState<AdminPayoutRow[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"" | PayoutStatus>("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const canRelease = adminCan(getAdminProfile(), ADMIN_PERMISSIONS.PAYOUTS_RELEASE);

  // Pull current release mode (auto vs manual) so the banner reflects what
  // the platform will do for new payouts created right now. Failure is silent
  // — the banner just doesn't render until we know.
  useEffect(() => {
    getPlatformSettings().then(setSettings).catch(() => {});
  }, []);

  function load(reset = true) {
    if (reset) { setLoading(true); setRows([]); setNextCursor(null); } else { setLoadingMore(true); }
    setError(null);
    listAdminPayouts({
      status: status || undefined,
      cursor: reset ? undefined : nextCursor ?? undefined,
    })
      .then((res) => {
        setRows((prev) => (reset ? res.payouts : [...prev, ...res.payouts]));
        setNextCursor(res.nextCursor);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load payouts"))
      .finally(() => { setLoading(false); setLoadingMore(false); });
  }
  useEffect(() => { load(true); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [status]);

  async function release(p: AdminPayoutRow) {
    const net = formatMoney(p.netAmount, p.currency);
    if (!confirm(`Release ${net} to ${p.transporter?.name || p.transporter?.email}? This calls Paystack and is irreversible.`)) return;
    setBusyId(p.id);
    try {
      await releaseAdminPayout(p.id);
      load(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Release failed");
    } finally {
      setBusyId(null);
    }
  }

  async function reconcile(p: AdminPayoutRow) {
    setBusyId(p.id);
    try {
      const res = await reconcileAdminPayout(p.id);
      alert(`Status: ${res.status}`);
      load(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Reconcile failed");
    } finally {
      setBusyId(null);
    }
  }

  async function fail(p: AdminPayoutRow) {
    const reason = prompt("Why is this payout being failed? (visible to support only)");
    if (!reason) return;
    setBusyId(p.id);
    try {
      await markAdminPayoutFailed(p.id, reason);
      load(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Mark-failed action failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Page className="space-y-6">
      <PageHeader
        kicker="Finance"
        title="Transporter payouts"
        subtitle="Money owed to transporters after travelers confirm arrival. Release sends from your Paystack balance to their bank."
      />

      {settings && <ReleaseModeBanner enabled={settings.autoPayoutEnabled} />}

      <Card>
        <TabFilter<"" | PayoutStatus>
          tabs={PAYOUT_FILTER_TABS}
          value={status}
          onChange={setStatus}
          formatLabel={formatPayoutFilterLabel}
        />
      </Card>

      {error && <ErrorState message={error} onRetry={() => load(true)} />}

      <Card className="!p-0 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState icon={<CashIcon />} title="No payouts" description="Payouts appear here once travelers confirm arrival on completed trips." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/50 text-[11px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold">Transporter</th>
                  <th className="text-left px-5 py-3 font-semibold">Route</th>
                  <th className="text-left px-5 py-3 font-semibold">Status</th>
                  <th className="text-right px-5 py-3 font-semibold">Gross</th>
                  <th className="text-right px-5 py-3 font-semibold">Commission</th>
                  <th className="text-right px-5 py-3 font-semibold">Net (payout)</th>
                  <th className="text-right px-5 py-3 font-semibold">Created</th>
                  <th className="text-right px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-3">
                      {p.transporter ? (
                        <Link
                          href={`/dashboard/users/${p.transporter.id}`}
                          className="font-semibold text-zinc-950 truncate hover:text-emerald-700"
                        >
                          {p.transporter.name || p.transporter.email}
                        </Link>
                      ) : (
                        <div className="font-semibold text-zinc-950 truncate">—</div>
                      )}
                      <div className="text-[11px] text-slate-500 truncate">{p.transporter?.email}</div>
                      {!p.transporter?.paystackRecipientCode && (
                        <div className="text-[10px] text-amber-700 mt-0.5">⚠ No bank account on file</div>
                      )}
                    </td>
                    <td className="px-5 py-3 text-slate-700">
                      <Link
                        href={`/dashboard/routes/${p.booking.transport.id}`}
                        className="hover:text-emerald-700"
                      >
                        {p.booking.transport.departureCity} → {p.booking.transport.destinationCity}
                      </Link>
                      <div className="text-[10px] text-slate-400">{p.booking.seatsBooked} seat{p.booking.seatsBooked === 1 ? "" : "s"}</div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <StatusPill tone={
                          p.status === "RELEASED" ? "emerald" :
                          p.status === "PROCESSING" ? "blue" :
                          p.status === "FAILED" ? "red" : "yellow"
                        }>{p.status}</StatusPill>
                        {p.releaseTrigger && <ReleaseTriggerBadge trigger={p.releaseTrigger} />}
                      </div>
                      {p.status === "FAILED" && p.failureReason && (
                        <div className="text-[10px] text-red-700 mt-0.5">{p.failureReason}</div>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right font-mono tabular-nums">{formatMoney(p.grossAmount, p.currency)}</td>
                    <td className="px-5 py-3 text-right font-mono tabular-nums text-slate-500">−{formatMoney(p.commissionAmount, p.currency)}</td>
                    <td className="px-5 py-3 text-right font-mono font-semibold tabular-nums text-emerald-700">{formatMoney(p.netAmount, p.currency)}</td>
                    <td className="px-5 py-3 text-right text-[11px] text-slate-500">
                      {new Date(p.createdAt).toLocaleDateString(undefined, { day: "2-digit", month: "short" })}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {canRelease && (p.status === "PENDING" || p.status === "FAILED") && (
                          <button
                            onClick={() => release(p)}
                            disabled={busyId === p.id}
                            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 disabled:opacity-60"
                          >
                            {busyId === p.id ? "…" : "Release"}
                          </button>
                        )}
                        {canRelease && p.status === "PROCESSING" && (
                          <button
                            onClick={() => reconcile(p)}
                            disabled={busyId === p.id}
                            className="text-xs font-semibold text-blue-700 hover:text-blue-900 disabled:opacity-60"
                          >
                            {busyId === p.id ? "…" : "Reconcile"}
                          </button>
                        )}
                        {canRelease && p.status !== "RELEASED" && p.status !== "FAILED" && (
                          <button
                            onClick={() => fail(p)}
                            disabled={busyId === p.id}
                            className="text-xs font-semibold text-red-700 hover:text-red-900 disabled:opacity-60"
                          >
                            Fail
                          </button>
                        )}
                      </div>
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

const PAYOUT_FILTER_TABS = ["", "PENDING", "PROCESSING", "RELEASED", "FAILED"] as const;
const PAYOUT_FILTER_LABELS: Record<(typeof PAYOUT_FILTER_TABS)[number], string> = {
  "": "ALL",
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  RELEASED: "RELEASED",
  FAILED: "FAILED",
};
function formatPayoutFilterLabel(tab: "" | PayoutStatus) {
  return PAYOUT_FILTER_LABELS[tab];
}

// Top-of-page banner showing the *current* release mode driven by
// PlatformSettings.autoPayoutEnabled. The per-row badge (below) tells the
// history of each payout — this banner tells the admin what'll happen to
// the *next* payout created. Coloring matches: emerald = automatic flow,
// slate = manual flow.
function ReleaseModeBanner({ enabled }: { enabled: boolean }) {
  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border p-4 ${
        enabled
          ? "border-emerald-200 bg-emerald-50/60"
          : "border-slate-200 bg-slate-50/60"
      }`}
    >
      <div
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
          enabled ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"
        }`}
        aria-hidden
      >
        {enabled ? (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 4.09 12.97a1 1 0 0 0 .77 1.63H10l-1 7.4 9.5-12.5a1 1 0 0 0-.79-1.6H14l-1-5.9z" /></svg>
        ) : (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11V6a3 3 0 0 1 6 0v5" /><rect x="5" y="11" width="14" height="10" rx="2" />
          </svg>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-zinc-950">
          Release mode: {enabled ? "Automatic" : "Manual"}
        </div>
        <p className="mt-0.5 text-[12px] text-slate-600">
          {enabled
            ? "Payouts release as soon as travelers confirm arrival — new rows here will be tagged Auto."
            : "Payouts wait for an admin to click Release — new rows here will be tagged Manual."}
        </p>
      </div>
      <Link
        href="/dashboard/settings"
        className="shrink-0 self-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-zinc-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
      >
        Change
      </Link>
    </div>
  );
}

// Non-interactive marker telling the admin whether a payout was released by
// the auto-payout setting or by an admin clicking Release. Rendered as a
// <span> (not <button>) so it can't be tabbed-to or clicked — it's metadata.
function ReleaseTriggerBadge({ trigger }: { trigger: PayoutTrigger }) {
  const isAuto = trigger === "AUTO";
  return (
    <span
      role="presentation"
      aria-label={isAuto ? "Released automatically" : "Released manually by an admin"}
      className={`inline-flex select-none items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ring-inset ${
        isAuto
          ? "bg-violet-50 text-violet-700 ring-violet-200"
          : "bg-slate-100 text-slate-700 ring-slate-200"
      }`}
    >
      {isAuto ? (
        <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 4.09 12.97a1 1 0 0 0 .77 1.63H10l-1 7.4 9.5-12.5a1 1 0 0 0-.79-1.6H14l-1-5.9z" /></svg>
      ) : (
        <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 11V6a3 3 0 0 1 6 0v5" /><rect x="5" y="11" width="14" height="10" rx="2" />
        </svg>
      )}
      {isAuto ? "Auto" : "Manual"}
    </span>
  );
}
