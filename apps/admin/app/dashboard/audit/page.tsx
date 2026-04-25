"use client";

import { useEffect, useState } from "react";
import { Page, PageHeader, Card, Skeleton, ErrorState, EmptyState, SecondaryButton } from "@/app/_Components/ui";
import { ListIcon } from "@/app/_Components/Icons";
import { listAdminAuditLog, AdminAuditEntry } from "@/lib/api";

export default function AuditPage() {
  const [rows, setRows] = useState<AdminAuditEntry[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function load(reset = true) {
    if (reset) { setLoading(true); setRows([]); setNextCursor(null); } else { setLoadingMore(true); }
    setError(null);
    listAdminAuditLog({ cursor: reset ? undefined : nextCursor ?? undefined, limit: 50 })
      .then((res) => {
        setRows((prev) => (reset ? res.logs : [...prev, ...res.logs]));
        setNextCursor(res.nextCursor);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load audit log"))
      .finally(() => { setLoading(false); setLoadingMore(false); });
  }
  useEffect(() => { load(true); }, []);

  return (
    <Page className="space-y-6">
      <PageHeader
        kicker="Forensics"
        title="Audit log"
        subtitle="Append-only record of every admin write action — who did what, when, and from where."
      />

      {error && <ErrorState message={error} onRetry={() => load(true)} />}

      <Card className="!p-0 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState icon={<ListIcon />} title="No actions logged yet" description="Once admins start performing write actions they'll show up here." />
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
