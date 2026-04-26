"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  Page, PageHeader, Card, Skeleton, ErrorState, StatusPill,
  SecondaryButton,
} from "@/app/_Components/ui";
import {
  getAdminBugReport,
  replyAdminBugReport,
  closeAdminBugReport,
  type AdminBugReportRow,
} from "@/lib/api";
import { LightboxImage } from "@/app/_Components/LightboxImage";

/**
 * Admin detail view for a single bug report. Shows the user's submission +
 * any attached screenshots, lets the admin reply (which also flips status to
 * REPLIED), or close it without reply.
 */
export default function AdminBugReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [report, setReport] = useState<AdminBugReportRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  // Brief "saved" pulse so a successful reply isn't a silent state-only update.
  const [savedAt, setSavedAt] = useState<number | null>(null);

  function load() {
    setLoading(true);
    setError(null);
    getAdminBugReport(id)
      .then((r) => {
        setReport(r);
        setReply(r.adminReply ?? "");
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load report"))
      .finally(() => setLoading(false));
  }
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [id]);

  async function handleReply() {
    setReplyError(null);
    if (!reply.trim()) {
      setReplyError("Reply can't be empty.");
      return;
    }
    setSubmitting(true);
    try {
      const updated = await replyAdminBugReport(id, reply.trim());
      setReport(updated);
      setReply(updated.adminReply ?? "");
      setSavedAt(Date.now());
    } catch (e: any) {
      setReplyError(e?.message || "Failed to send reply");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleClose() {
    const message = report?.adminReply
      ? "Close this report? It'll move out of the OPEN/REPLIED queues."
      : "Close this report without a reply?";
    if (!confirm(message)) return;
    setSubmitting(true);
    try {
      const updated = await closeAdminBugReport(id);
      setReport(updated);
      setSavedAt(Date.now());
    } finally {
      setSubmitting(false);
    }
  }

  // Auto-clear the saved flash after a few seconds.
  useEffect(() => {
    if (savedAt == null) return;
    const t = setTimeout(() => setSavedAt(null), 2500);
    return () => clearTimeout(t);
  }, [savedAt]);

  return (
    <Page className="space-y-6">
      <Link
        href="/dashboard/bug-reports"
        className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-zinc-900 transition-colors mb-3"
      >
        ← Back to bug reports
      </Link>
      <PageHeader
        kicker="Support"
        title={loading ? "Loading…" : report?.subject ?? "Report not found"}
      />

      {savedAt != null && (
        <div
          key={savedAt}
          className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 animate-fade-in-up"
          role="status"
        >
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          Saved. The user will see this on their report page.
        </div>
      )}

      {error && <ErrorState message={error} onRetry={load} />}

      {loading ? (
        <Card><Skeleton className="h-32 w-full" /></Card>
      ) : !report ? null : (
        <>
          {/* Submitter + meta */}
          <Card>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset ${
                report.kind === "BUG"
                  ? "bg-red-50 text-red-700 ring-red-200"
                  : "bg-violet-50 text-violet-700 ring-violet-200"
              }`}>
                {report.kind}
              </span>
              <StatusPill tone={
                report.status === "OPEN" ? "yellow" :
                report.status === "REPLIED" ? "emerald" : "slate"
              }>{report.status}</StatusPill>
              <span className="ml-auto text-[11px] text-slate-500">
                {new Date(report.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
              </span>
            </div>
            <div className="text-sm text-zinc-700">
              {report.user ? (
                <>
                  <Link href={`/dashboard/users/${report.user.id}`} className="font-semibold text-zinc-950 hover:text-emerald-700">
                    {report.user.name || "—"}
                  </Link>{" "}
                  <span className="text-slate-500">· {report.user.email}</span>
                  {report.user.accountType && (
                    <span className="text-slate-500"> · {report.user.accountType.toLowerCase()}</span>
                  )}
                  {report.user.country && (
                    <span className="text-slate-500"> · {report.user.country}</span>
                  )}
                </>
              ) : (
                <span className="text-slate-500">User unavailable</span>
              )}
            </div>
          </Card>

          {/* Body + attachments */}
          <Card>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 mb-2">Description</p>
            <p className="text-sm text-zinc-900 whitespace-pre-wrap">{report.body}</p>

            {report.imageUrls.filter(Boolean).length > 0 && (
              <>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 mt-5 mb-2">
                  Screenshots ({report.imageUrls.filter(Boolean).length})
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {report.imageUrls.map((url, i) =>
                    url ? (
                      <LightboxImage
                        key={i}
                        src={url}
                        alt={`Screenshot ${i + 1}`}
                        className="aspect-square w-full h-full rounded-xl object-cover ring-1 ring-slate-200 bg-slate-50 hover:ring-emerald-300 transition-all"
                      />
                    ) : null
                  )}
                </div>
              </>
            )}
          </Card>

          {/* Reply form */}
          <Card>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 mb-2">
              {report.adminReply ? "Edit your reply" : "Reply to user"}
            </p>
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Write a clear, friendly response. The user will see this on their report page."
              rows={5}
              maxLength={5000}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 resize-none"
            />
            <div className="mt-1 flex items-center justify-between">
              <p className="text-[11px] text-slate-400">{reply.length}/5000</p>
              {report.repliedAt && (
                <p className="text-[11px] text-slate-400">
                  Last sent {new Date(report.repliedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                </p>
              )}
            </div>
            {replyError && (
              <div className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{replyError}</div>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-2 justify-end">
              {report.status !== "CLOSED" && (
                <SecondaryButton onClick={handleClose} disabled={submitting}>
                  {report.adminReply ? "Close" : "Close without reply"}
                </SecondaryButton>
              )}
              <button
                type="button"
                onClick={handleReply}
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60 transition-colors"
              >
                {submitting ? "Sending…" : report.adminReply ? "Update reply" : "Send reply"}
              </button>
            </div>
          </Card>
        </>
      )}
    </Page>
  );
}
