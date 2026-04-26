"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Page, PageHeader, Card, Skeleton, ErrorState, EmptyState, StatusPill,
  SecondaryButton, TabFilter,
} from "@/app/_Components/ui";
import { MessageSquareIcon } from "@/app/_Components/Icons";
import {
  listAdminBugReports,
  getAdminBugReportCounts,
  type AdminBugReportRow,
  type BugReportKind,
  type BugReportStatus,
} from "@/lib/api";

const STATUS_TABS = ["", "OPEN", "REPLIED", "CLOSED"] as const;
type StatusTab = (typeof STATUS_TABS)[number];
const KIND_TABS = ["", "BUG", "SUGGESTION"] as const;
type KindTab = (typeof KIND_TABS)[number];

const STATUS_LABEL: Record<StatusTab, string> = {
  "": "ALL",
  OPEN: "OPEN",
  REPLIED: "REPLIED",
  CLOSED: "CLOSED",
};
const KIND_LABEL: Record<KindTab, string> = {
  "": "ALL",
  BUG: "BUGS",
  SUGGESTION: "SUGGESTIONS",
};

export default function AdminBugReportsPage() {
  const [rows, setRows] = useState<AdminBugReportRow[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusTab>("");
  const [kind, setKind] = useState<KindTab>("");
  const [counts, setCounts] = useState<Record<BugReportStatus, number> | null>(null);

  function load(reset = true) {
    if (reset) { setLoading(true); setRows([]); setNextCursor(null); } else { setLoadingMore(true); }
    setError(null);
    listAdminBugReports({
      kind: kind || undefined,
      status: status || undefined,
      cursor: reset ? undefined : nextCursor ?? undefined,
    })
      .then((res) => {
        setRows((prev) => (reset ? res.reports : [...prev, ...res.reports]));
        setNextCursor(res.nextCursor);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load reports"))
      .finally(() => { setLoading(false); setLoadingMore(false); });
  }

  // Status counts are global (not narrowed by current filter) — they answer
  // "how many are pending across all kinds" so the OPEN badge stays a useful
  // unread indicator.
  function refreshCounts() {
    getAdminBugReportCounts().then(setCounts).catch(() => {});
  }
  useEffect(() => {
    refreshCounts();
  }, []);

  useEffect(() => { load(true); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [status, kind]);

  // Refetch rows + counts when the tab regains focus — typical flow is admin
  // navigates to a detail page, replies, then comes back here; without this
  // the row's status badge would stay stale.
  useEffect(() => {
    function onFocus() {
      load(true);
      refreshCounts();
    }
    function onVisibilityChange() {
      if (document.visibilityState === "visible") onFocus();
    }
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, kind]);

  const statusCounts: Partial<Record<StatusTab, number>> = counts
    ? {
        "": counts.OPEN + counts.REPLIED + counts.CLOSED,
        OPEN: counts.OPEN,
        REPLIED: counts.REPLIED,
        CLOSED: counts.CLOSED,
      }
    : {};

  return (
    <Page className="space-y-6">
      <PageHeader
        kicker="Support"
        title="Bug reports & suggestions"
        subtitle="Everything users have submitted from the in-app Report-a-problem flow. Open one to read it and reply."
      />

      <Card className="space-y-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 mb-1.5">Status</p>
          <TabFilter<StatusTab>
            tabs={STATUS_TABS}
            value={status}
            onChange={setStatus}
            counts={statusCounts}
            formatLabel={(t) => STATUS_LABEL[t]}
          />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 mb-1.5">Type</p>
          <TabFilter<KindTab>
            tabs={KIND_TABS}
            value={kind}
            onChange={setKind}
            formatLabel={(t) => KIND_LABEL[t]}
          />
        </div>
      </Card>

      {error && <ErrorState message={error} onRetry={() => load(true)} />}

      <Card className="!p-0 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState icon={<MessageSquareIcon />} title="No reports match" description="Try a different filter, or wait for users to submit one." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {rows.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/dashboard/bug-reports/${r.id}`}
                  className="block px-5 py-4 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="flex items-start gap-3 flex-wrap">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <KindPill kind={r.kind} />
                        <StatusPill tone={
                          r.status === "OPEN" ? "yellow" :
                          r.status === "REPLIED" ? "emerald" : "slate"
                        }>{r.status}</StatusPill>
                        {r.imageKeys.length > 0 && (
                          <span className="text-[10px] font-semibold text-slate-500 inline-flex items-center gap-1">
                            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg>
                            {r.imageKeys.length}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-zinc-950 truncate">{r.subject}</p>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{r.body}</p>
                      <p className="text-[11px] text-slate-400 mt-1.5">
                        {r.user.name || r.user.email}
                        {r.user.accountType ? ` · ${r.user.accountType.toLowerCase()}` : ""}
                        {" · "}
                        {new Date(r.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                      </p>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
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

function KindPill({ kind }: { kind: BugReportKind }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset ${
      kind === "BUG"
        ? "bg-red-50 text-red-700 ring-red-200"
        : "bg-violet-50 text-violet-700 ring-violet-200"
    }`}>
      {kind}
    </span>
  );
}
