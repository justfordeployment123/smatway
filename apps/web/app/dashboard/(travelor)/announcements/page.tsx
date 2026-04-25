"use client";

import { motion } from "motion/react";
import { MegaphoneIcon } from "@/app/dashboard/_Components/Icons";
import { Page, Reveal, PageHeader, EmptyState } from "@/app/dashboard/_Components/ui";
import { useAnnouncements } from "@/hooks/useAnnouncements";

export default function AnnouncementsPage() {
  const { items, loading, error, refetch } = useAnnouncements("TRAVELER");

  return (
    <Page>
      <PageHeader
        kicker="From SmatWay"
        title="Announcements"
        subtitle="Important updates from the SmatWay team — service notices, route changes, and platform news."
      />

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
          <button onClick={refetch} className="ml-2 font-semibold underline">
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="All quiet for now"
          description="When the SmatWay team posts platform-wide news, you'll see it here."
          icon={<MegaphoneIcon className="w-6 h-6" />}
        />
      ) : (
        <div className="space-y-3">
          {items.map((a, i) => (
            <Reveal key={a.id} delay={i * 0.04}>
              <motion.article
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                    <MegaphoneIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-3">
                      <h2 className="text-base font-semibold text-zinc-950 truncate">{a.title}</h2>
                      <time className="shrink-0 text-[11px] text-slate-400 tabular-nums">
                        {new Date(a.createdAt).toLocaleDateString(undefined, {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </time>
                    </div>
                    <p className="mt-1.5 text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap">
                      {a.body}
                    </p>
                  </div>
                </div>
              </motion.article>
            </Reveal>
          ))}
        </div>
      )}
    </Page>
  );
}
