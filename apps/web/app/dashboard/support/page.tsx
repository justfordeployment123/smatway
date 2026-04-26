"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Page, Reveal, PageHeader, spring } from "@/app/dashboard/_Components/ui";
import {
  submitBugReport,
  listMyBugReports,
  type BugReport,
  type BugReportKind,
} from "@/lib/api";
import { markBugReportsSeen } from "@/lib/bugReportNotifications";
import { LightboxImage } from "@/components/LightboxImage";

const MAX_IMAGES = 4;

/**
 * Support / feedback page shared between travelers and transporters. Submits
 * a bug report or improvement suggestion (with optional image attachments)
 * and lists the user's past submissions including any admin reply.
 *
 * Image upload uses native FormData so we don't need a dedicated upload
 * endpoint — the report-create endpoint accepts images alongside text.
 */
export default function SupportPage() {
  const [kind, setKind] = useState<BugReportKind>("BUG");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<BugReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [justSubmittedId, setJustSubmittedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pulled out of useEffect so it can be re-run by the polling interval +
  // the focus / visibility listeners. Each fetch refreshes the list AND the
  // "seen up to" cursor, so an admin reply *or* an admin update to an
  // existing reply lands while the user sits on this page — and the sidebar
  // dot stays cleared because the cursor walks forward with each poll.
  function refresh() {
    listMyBugReports()
      .then((rs) => {
        setReports(rs);
        const latest = rs.reduce((max, r) => {
          if (!r.repliedAt) return max;
          const t = new Date(r.repliedAt).getTime();
          return t > max ? t : max;
        }, 0);
        if (latest > 0) markBugReportsSeen(latest);
      })
      .catch(() => { /* empty list is fine */ })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    refresh();
    // Poll every 30s so the user sees admin updates without refreshing. The
    // window is small enough that an edit reads as "live" without hammering
    // the API. On focus / visibility we also re-fetch so a backgrounded tab
    // catches up immediately when it returns.
    const interval = setInterval(refresh, 30_000);
    function onFocus() { refresh(); }
    function onVisibility() { if (document.visibilityState === "visible") refresh(); }
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Build/teardown object URLs for the image previews so we don't leak them.
  useEffect(() => {
    const urls = images.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [images]);

  function handleFiles(picked: FileList | null) {
    if (!picked) return;
    const next = [...images, ...Array.from(picked)].slice(0, MAX_IMAGES);
    setImages(next);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeImage(idx: number) {
    setImages((arr) => arr.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!subject.trim() || !body.trim()) {
      setError("Please add a subject and a description.");
      return;
    }
    setSubmitting(true);
    try {
      const created = await submitBugReport({
        kind,
        subject: subject.trim(),
        body: body.trim(),
        images,
      });
      setReports((prev) => [created, ...prev]);
      setJustSubmittedId(created.id);
      setSubject("");
      setBody("");
      setImages([]);
      setKind("BUG");
      // Clear the highlight after a moment so it doesn't linger forever.
      setTimeout(() => setJustSubmittedId(null), 3000);
    } catch (e: any) {
      setError(e?.message || "Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Page>
      <PageHeader
        kicker="We're listening"
        title="Report a problem or suggest an improvement"
        subtitle="Tell us what's broken or what would make SmatWay better. Our team reviews every report and replies right here."
      />

      <Reveal>
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-4"
        >
          {/* Kind toggle */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-2 block">Type</label>
            <div className="inline-flex gap-1.5 rounded-xl bg-slate-100/80 p-1">
              <KindButton active={kind === "BUG"} onClick={() => setKind("BUG")} label="Bug" />
              <KindButton active={kind === "SUGGESTION"} onClick={() => setKind("SUGGESTION")} label="Suggestion" />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1.5 block">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={kind === "BUG" ? "e.g. Pickup code not loading on iPhone Safari" : "e.g. Allow saving favourite routes"}
              maxLength={200}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1.5 block">Description</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="What happened (or what would help)? Steps to reproduce, what you expected, what you got."
              rows={5}
              maxLength={5000}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 resize-none"
            />
            <p className="mt-1 text-[11px] text-slate-400 text-right">{body.length}/5000</p>
          </div>

          {/* Image attachments */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1.5 block">
              Screenshots <span className="font-normal normal-case text-slate-400">(optional, up to {MAX_IMAGES})</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {previews.map((src, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden ring-1 ring-slate-200 bg-slate-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="Attachment preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1.5 right-1.5 grid h-6 w-6 place-items-center rounded-full bg-zinc-950/70 text-white hover:bg-zinc-950 transition-colors"
                    aria-label="Remove attachment"
                  >
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
              {images.length < MAX_IMAGES && (
                <label className="aspect-square rounded-xl border-2 border-dashed border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 transition-colors flex flex-col items-center justify-center text-slate-400 hover:text-emerald-600 cursor-pointer">
                  <svg className="h-6 w-6 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />
                  </svg>
                  <span className="text-[11px] font-semibold">Add image</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFiles(e.target.files)}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</div>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 disabled:opacity-60 transition-all active:scale-[0.99]"
            >
              {submitting ? (
                <>
                  <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                  Sending…
                </>
              ) : (
                <>Send {kind === "BUG" ? "report" : "suggestion"}</>
              )}
            </button>
          </div>
        </form>
      </Reveal>

      {/* History */}
      <div className="mt-8">
        <h2 className="text-sm font-semibold text-zinc-900 mb-3">Your past reports</h2>
        {loading ? (
          <p className="text-xs text-slate-400">Loading…</p>
        ) : reports.length === 0 ? (
          <p className="text-xs text-slate-400">No reports yet — your past submissions will appear here.</p>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {reports.map((r) => (
                <motion.div
                  key={r.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={spring}
                  className={`rounded-2xl border bg-white p-4 ${
                    justSubmittedId === r.id
                      ? "border-emerald-300 ring-2 ring-emerald-200"
                      : "border-slate-200/70"
                  }`}
                >
                  <ReportRow report={r} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </Page>
  );
}

function KindButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
        active ? "bg-white text-zinc-900 shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:text-zinc-900"
      }`}
    >
      {label}
    </button>
  );
}

function ReportRow({ report }: { report: BugReport }) {
  const visibleImages = report.imageUrls.filter(Boolean) as string[];
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <KindBadge kind={report.kind} />
        <StatusBadge status={report.status} />
        <span className="text-[11px] text-slate-400 ml-auto">
          {new Date(report.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
        </span>
      </div>

      <div>
        <p className="text-sm font-semibold text-zinc-950">{report.subject}</p>
        <p className="mt-1 text-[13px] text-slate-700 whitespace-pre-wrap">{report.body}</p>
      </div>

      {visibleImages.length > 0 && (
        // Cap thumbnail width so a single attachment doesn't blow up to half
        // the row. Multiple images flow into a wrap-grid of 96px tiles.
        <div className="flex flex-wrap gap-2">
          {visibleImages.map((url, i) => (
            <LightboxImage
              key={i}
              src={url}
              alt={`Attachment ${i + 1}`}
              className="block w-24 h-24 rounded-lg object-cover ring-1 ring-slate-200 bg-slate-50 hover:ring-emerald-300 transition-all"
            />
          ))}
        </div>
      )}

      {report.adminReply && <AdminReplyBubble reply={report.adminReply} repliedAt={report.repliedAt} />}
    </div>
  );
}

/**
 * Reply bubble styled like a conversation message from the SmatWay team —
 * branded avatar + name with verified tick, slight left indent so it visually
 * nests under the user's report, and a connector line on the left edge to
 * tie it back to the parent row.
 */
function AdminReplyBubble({ reply, repliedAt }: { reply: string; repliedAt: string | null }) {
  return (
    <div className="mt-3 ml-2 sm:ml-6 relative">
      {/* Left connector — gradient line that fades down so the reply reads
          as branching off the report above without dominating visually. */}
      <span
        aria-hidden
        className="absolute -left-3 sm:-left-5 top-3 bottom-3 w-px bg-gradient-to-b from-emerald-300 via-emerald-200 to-transparent"
      />
      <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-white ring-1 ring-emerald-200 px-4 py-3 shadow-[0_1px_2px_rgba(16,185,129,0.08)]">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 ring-2 ring-white shadow-sm grid place-items-center">
            <svg className="h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2 4.09 12.97a1 1 0 0 0 .77 1.63H10l-1 7.4 9.5-12.5a1 1 0 0 0-.79-1.6H14l-1-5.9z" fill="currentColor" stroke="none" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="inline-flex items-center gap-1 text-[12px] font-semibold text-zinc-950">
              SmatWay Support
              <svg className="h-3 w-3 text-emerald-600" viewBox="0 0 24 24" fill="currentColor" aria-label="Verified">
                <path d="M12 2 9.5 4.5 6 4l-1 3.5L2 10l2 2.5L2 15l3 2.5L6 21l3.5-.5L12 23l2.5-2.5L18 21l1-3.5 3-2.5-2-2.5L22 10l-3-2.5L18 4l-3.5.5L12 2z" />
                <path d="m9 12 2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </p>
            {repliedAt && (
              <p className="text-[10px] text-slate-500">
                {new Date(repliedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
              </p>
            )}
          </div>
        </div>
        <p className="text-[13px] text-zinc-800 whitespace-pre-wrap leading-relaxed">
          {reply}
        </p>
      </div>
    </div>
  );
}

function KindBadge({ kind }: { kind: BugReportKind }) {
  const isBug = kind === "BUG";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${
      isBug ? "bg-red-50 text-red-700 ring-red-200" : "bg-violet-50 text-violet-700 ring-violet-200"
    }`}>
      {isBug ? "BUG" : "SUGGESTION"}
    </span>
  );
}

function StatusBadge({ status }: { status: BugReport["status"] }) {
  const map: Record<BugReport["status"], string> = {
    OPEN: "bg-yellow-50 text-yellow-700 ring-yellow-200",
    REPLIED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    CLOSED: "bg-slate-100 text-slate-600 ring-slate-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${map[status]}`}>
      {status}
    </span>
  );
}
