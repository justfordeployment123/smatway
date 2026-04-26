"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { MegaphoneIcon, SearchIcon } from "@/app/dashboard/_Components/Icons";
import { Reveal, EmptyState } from "@/app/dashboard/_Components/ui";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import type { PublicAnnouncement } from "@/lib/api";
import { markAnnouncementsSeen } from "@/lib/announcementsNotifications";
import { LightboxImage } from "@/components/LightboxImage";

/**
 * Shared announcements feed used by both the traveler and transporter
 * dashboards. Adds search, date grouping (Today / This week / Earlier), a
 * NEW pill for items posted in the last 48 hours, and a polished empty
 * state. The two role pages just pass an audience + an empty-state copy.
 */
export function AnnouncementsList({
  audience,
  emptyTitle,
  emptyDescription,
}: {
  audience: "TRAVELER" | "TRANSPORTER";
  emptyTitle: string;
  emptyDescription: string;
}) {
  const { items, loading, error, refetch } = useAnnouncements(audience);
  const [query, setQuery] = useState("");

  // Each time the list refreshes (initial load + socket-driven refetches),
  // walk the seen-up-to cursor forward so the sidebar dot clears for the
  // viewer. The hook in the layout listens for the storage event we dispatch
  // and recounts immediately.
  useEffect(() => {
    if (items.length === 0) return;
    const latest = items.reduce((max, a) => {
      const t = new Date(a.createdAt).getTime();
      return t > max ? t : max;
    }, 0);
    if (latest > 0) markAnnouncementsSeen(audience, latest);
  }, [audience, items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.body.toLowerCase().includes(q),
    );
  }, [items, query]);

  // Three-bucket grouping: items today, items in the last 7 days, everything
  // else. Cheaper than a date-by-date fold for a list this short and reads
  // well — most announcements pages have only a handful of entries.
  const grouped = useMemo(() => groupByRecency(filtered), [filtered]);

  return (
    <>
      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
          <button onClick={refetch} className="ml-2 font-semibold underline">
            Retry
          </button>
        </div>
      )}

      {/* Search row — only render when there's actually something to filter
          so a fresh install doesn't show a useless search box. */}
      {!loading && items.length > 0 && (
        <Reveal className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <SearchIcon className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search announcements…"
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-[13px] text-zinc-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-colors"
            />
          </div>
          <p className="text-[11px] text-slate-500 tabular-nums">
            {query
              ? `${filtered.length} of ${items.length} match`
              : `${items.length} ${items.length === 1 ? "announcement" : "announcements"}`}
          </p>
        </Reveal>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          icon={<MegaphoneIcon className="w-6 h-6" />}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Nothing matched your search"
          description="Try a different keyword or clear the search to see all announcements."
          icon={<SearchIcon className="w-6 h-6" />}
        />
      ) : (
        <div className="space-y-7">
          {grouped.map((group) => (
            <section key={group.label}>
              <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                {group.label}
              </h2>
              <div className="space-y-3">
                {group.items.map((a, i) => (
                  <Reveal key={a.id} delay={i * 0.03}>
                    <AnnouncementCard a={a} />
                  </Reveal>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  );
}

function AnnouncementCard({ a }: { a: PublicAnnouncement }) {
  const created = new Date(a.createdAt);
  const isFresh = Date.now() - created.getTime() < 48 * 60 * 60 * 1000;
  const visibleImages = (a.imageUrls ?? []).filter(Boolean) as string[];
  return (
    <motion.article
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="relative rounded-2xl border border-slate-200/70 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:border-slate-300 hover:shadow-[0_8px_24px_-12px_rgba(15,23,42,0.10)] transition-all"
    >
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/60 ring-1 ring-emerald-200/70 flex items-center justify-center text-emerald-700 shrink-0">
          <MegaphoneIcon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 min-w-0">
              <h2 className="text-[15px] font-semibold text-zinc-950 break-words">{a.title}</h2>
              {isFresh && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 ring-1 ring-inset ring-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </span>
                  New
                </span>
              )}
            </div>
            <time
              className="shrink-0 text-[11px] text-slate-400 tabular-nums"
              dateTime={a.createdAt}
              title={created.toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" })}
            >
              {formatRelative(created)}
            </time>
          </div>
          <p className="mt-2 text-[13px] text-zinc-700 leading-relaxed whitespace-pre-wrap">{a.body}</p>

          {visibleImages.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {visibleImages.map((url, i) => (
                <LightboxImage
                  key={i}
                  src={url}
                  alt={`${a.title} attachment ${i + 1}`}
                  className="block w-32 h-32 sm:w-40 sm:h-40 rounded-xl object-cover ring-1 ring-slate-200 bg-slate-50 hover:ring-emerald-300 transition-all"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function groupByRecency(items: PublicAnnouncement[]) {
  const now = Date.now();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

  const buckets: Array<{ label: string; items: PublicAnnouncement[] }> = [
    { label: "Today", items: [] },
    { label: "This week", items: [] },
    { label: "Earlier", items: [] },
  ];
  for (const a of items) {
    const t = new Date(a.createdAt);
    if (t >= startOfToday) buckets[0].items.push(a);
    else if (t >= sevenDaysAgo) buckets[1].items.push(a);
    else buckets[2].items.push(a);
  }
  return buckets.filter((b) => b.items.length > 0);
}

/**
 * "Just now / 12 min ago / 3 hr ago / Yesterday / Apr 22 / Apr 22, 2025"
 * Falls back to absolute date once it's older than ~5 days; before that
 * relative phrasing reads better.
 */
function formatRelative(d: Date): string {
  const ms = Date.now() - d.getTime();
  const min = ms / 60_000;
  if (min < 1) return "Just now";
  if (min < 60) return `${Math.floor(min)} min ago`;
  const hr = min / 60;
  if (hr < 24) return `${Math.floor(hr)} hr ago`;
  if (hr < 48) return "Yesterday";
  const days = hr / 24;
  if (days < 5) return `${Math.floor(days)} days ago`;
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}
