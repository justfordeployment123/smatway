"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Page, PageHeader, Card, Skeleton, ErrorState, EmptyState, StatusPill, SecondaryButton } from "@/app/_Components/ui";
import { MessageSquareIcon, StarIcon } from "@/app/_Components/Icons";
import { listAdminFeedback, deleteAdminFeedback, AdminSiteFeedback } from "@/lib/api";
import { adminCan, getAdminProfile } from "@/lib/auth";
import { ADMIN_PERMISSIONS } from "@/lib/permissions";

export default function FeedbackPage() {
  const [rows, setRows] = useState<AdminSiteFeedback[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const canDelete = adminCan(getAdminProfile(), ADMIN_PERMISSIONS.FEEDBACK_DELETE);

  function load(reset = true) {
    if (reset) { setLoading(true); setRows([]); setNextCursor(null); } else { setLoadingMore(true); }
    setError(null);
    listAdminFeedback({ cursor: reset ? undefined : nextCursor ?? undefined })
      .then((res) => {
        setRows((prev) => (reset ? res.feedback : [...prev, ...res.feedback]));
        setNextCursor(res.nextCursor);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load feedback"))
      .finally(() => { setLoading(false); setLoadingMore(false); });
  }

  useEffect(() => { load(true); }, []);

  async function remove(id: string) {
    if (!confirm("Delete this feedback? This is permanent.")) return;
    setBusyId(id);
    try {
      await deleteAdminFeedback(id);
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Page className="space-y-6">
      <PageHeader
        kicker="Voice of customer"
        title="Site feedback"
        subtitle="Feedback submitted from the user-side dashboard. Surfaces on the marketing homepage Testimonials section."
      />

      {error && <ErrorState message={error} onRetry={() => load(true)} />}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState icon={<MessageSquareIcon />} title="No feedback yet" description="When users submit feedback from /dashboard/feedback it appears here." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rows.map((f) => (
            <Card key={f.id}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  {f.user ? (
                    <Link href={`/dashboard/users/${f.user.id}`} className="block hover:text-emerald-700">
                      <div className="text-sm font-semibold text-zinc-950 hover:text-emerald-700 truncate">{f.user.name || f.user.email}</div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {f.user.email}
                        {f.user.country ? ` · ${f.user.country}` : ""}
                      </div>
                    </Link>
                  ) : (
                    <div className="text-sm font-semibold text-zinc-950 truncate">Anonymous</div>
                  )}
                </div>
                {f.user?.accountType && (
                  <StatusPill tone={f.user.accountType === "TRANSPORTER" ? "blue" : "emerald"}>
                    {f.user.accountType}
                  </StatusPill>
                )}
              </div>
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <StarIcon key={n} className={`w-3.5 h-3.5 ${n <= f.rating ? "text-amber-400" : "text-slate-200"}`} filled={n <= f.rating} />
                ))}
                <span className="ml-1 text-[11px] text-slate-500 tabular-nums">{f.rating}/5</span>
              </div>
              <p className="text-sm text-zinc-700 leading-relaxed line-clamp-4">{f.comment}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-[11px] text-slate-400">
                  {new Date(f.createdAt).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })}
                </span>
                {canDelete && (
                  <button
                    onClick={() => remove(f.id)}
                    disabled={busyId === f.id}
                    className="text-xs font-semibold text-red-700 hover:text-red-900 disabled:opacity-60"
                  >
                    {busyId === f.id ? "Deleting…" : "Delete"}
                  </button>
                )}
              </div>
            </Card>
          ))}
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
