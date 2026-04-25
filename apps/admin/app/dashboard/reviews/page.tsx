"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Page, PageHeader, Card, Skeleton, ErrorState, EmptyState, SecondaryButton } from "@/app/_Components/ui";
import { StarIcon, MessageSquareIcon } from "@/app/_Components/Icons";
import { listAdminReviews, deleteAdminReview, AdminReviewRow } from "@/lib/api";
import { adminCan, getAdminProfile } from "@/lib/auth";
import { ADMIN_PERMISSIONS } from "@/lib/permissions";

export default function ReviewsPage() {
  const [rows, setRows] = useState<AdminReviewRow[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const canDelete = adminCan(getAdminProfile(), ADMIN_PERMISSIONS.REVIEWS_DELETE);

  function load(reset = true) {
    if (reset) { setLoading(true); setRows([]); setNextCursor(null); } else { setLoadingMore(true); }
    setError(null);
    listAdminReviews({ cursor: reset ? undefined : nextCursor ?? undefined })
      .then((res) => {
        setRows((prev) => (reset ? res.reviews : [...prev, ...res.reviews]));
        setNextCursor(res.nextCursor);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load reviews"))
      .finally(() => { setLoading(false); setLoadingMore(false); });
  }

  useEffect(() => { load(true); }, []);

  async function remove(id: string) {
    if (!confirm("Delete this review? This is permanent.")) return;
    setBusyId(id);
    try {
      await deleteAdminReview(id);
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
        kicker="Quality"
        title="Trip reviews"
        subtitle="Per-booking ratings travelers leave for transporters. Drives the marketing homepage receipt card."
      />

      {error && <ErrorState message={error} onRetry={() => load(true)} />}

      <Card className="!p-0 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState icon={<MessageSquareIcon />} title="No reviews yet" description="Reviews appear here once travelers rate their completed trips." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/50 text-[11px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold">Traveler</th>
                  <th className="text-left px-5 py-3 font-semibold">Transporter</th>
                  <th className="text-left px-5 py-3 font-semibold">Rating</th>
                  <th className="text-left px-5 py-3 font-semibold">Feedback</th>
                  <th className="text-right px-5 py-3 font-semibold">When</th>
                  {canDelete && <th className="text-right px-5 py-3 font-semibold">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-3">
                      {r.traveler ? (
                        <Link href={`/dashboard/users/${r.traveler.id}`} className="block hover:text-emerald-700">
                          <div className="font-semibold text-zinc-950 hover:text-emerald-700">{r.traveler.name || r.traveler.email}</div>
                          <div className="text-[11px] text-slate-500">{r.traveler.email}</div>
                        </Link>
                      ) : <span className="font-semibold text-zinc-950">—</span>}
                    </td>
                    <td className="px-5 py-3">
                      {r.transporter ? (
                        <Link href={`/dashboard/users/${r.transporter.id}`} className="text-slate-700 hover:text-emerald-700">
                          {r.transporter.name || r.transporter.email}
                        </Link>
                      ) : <span className="text-slate-700">—</span>}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <StarIcon key={n} className={`w-3.5 h-3.5 ${n <= r.rating ? "text-amber-400" : "text-slate-200"}`} filled={n <= r.rating} />
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-700 max-w-md">
                      <p className="line-clamp-2">{r.feedback ?? "—"}</p>
                    </td>
                    <td className="px-5 py-3 text-right text-[11px] text-slate-500">
                      {new Date(r.createdAt).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    {canDelete && (
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => remove(r.id)}
                          disabled={busyId === r.id}
                          className="text-xs font-semibold text-red-700 hover:text-red-900 disabled:opacity-60"
                        >
                          {busyId === r.id ? "…" : "Delete"}
                        </button>
                      </td>
                    )}
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
