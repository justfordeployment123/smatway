"use client";

import { useEffect, useState } from "react";
import {
  Page, PageHeader, Card, Skeleton, ErrorState, EmptyState, StatusPill,
  PrimaryButton, SecondaryButton,
} from "@/app/_Components/ui";
import { MegaphoneIcon, PlusIcon } from "@/app/_Components/Icons";
import {
  listAdminAnnouncements, createAdminAnnouncement, deleteAdminAnnouncement,
  updateAdminAnnouncement,
  AdminAnnouncement, AnnouncementAudience,
} from "@/lib/api";
import { adminCan, getAdminProfile } from "@/lib/auth";
import { ADMIN_PERMISSIONS } from "@/lib/permissions";

const AUDIENCE_LABEL: Record<AnnouncementAudience, string> = {
  ALL: "Travelers + Transporters",
  TRAVELERS_ONLY: "Travelers only",
  TRANSPORTERS_ONLY: "Transporters only",
};

export default function AnnouncementsPage() {
  const profile = getAdminProfile();
  const canCreate = adminCan(profile, ADMIN_PERMISSIONS.ANNOUNCEMENTS_CREATE);
  const canDelete = adminCan(profile, ADMIN_PERMISSIONS.ANNOUNCEMENTS_DELETE);

  const [items, setItems] = useState<AdminAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<AnnouncementAudience>("ALL");
  const [submitting, setSubmitting] = useState(false);

  function load() {
    setLoading(true);
    setError(null);
    listAdminAnnouncements()
      .then((r) => setItems(r.announcements))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load announcements"))
      .finally(() => setLoading(false));
  }
  useEffect(() => { load(); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const created = await createAdminAnnouncement({ title, body, audience, isPublished: true });
      setItems((prev) => [created.announcement, ...prev]);
      setTitle(""); setBody(""); setAudience("ALL"); setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create");
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this announcement?")) return;
    setBusyId(id);
    try {
      await deleteAdminAnnouncement(id);
      setItems((prev) => prev.filter((a) => a.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusyId(null);
    }
  }

  async function togglePublish(a: AdminAnnouncement) {
    setBusyId(a.id);
    try {
      const updated = await updateAdminAnnouncement(a.id, { isPublished: !a.isPublished });
      setItems((prev) => prev.map((x) => (x.id === a.id ? updated.announcement : x)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Toggle failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Page className="space-y-6">
      <PageHeader
        kicker="Broadcast"
        title="Announcements"
        subtitle="Send platform-wide messages. Choose who sees them — travelers, transporters, or both."
        action={
          canCreate ? (
            <PrimaryButton onClick={() => setShowForm((v) => !v)}>
              <PlusIcon className="w-4 h-4" />
              {showForm ? "Cancel" : "New announcement"}
            </PrimaryButton>
          ) : undefined
        }
      />

      {showForm && canCreate && (
        <Card>
          <form className="space-y-4" onSubmit={submit}>
            <div>
              <label className="text-sm font-semibold text-zinc-900 block mb-1.5">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={120}
                placeholder="e.g. Service update: Lagos → Abuja schedule changes"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-zinc-900 block mb-1.5">Body</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={5}
                maxLength={2000}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100 resize-none"
                placeholder="Write the message that will appear in /dashboard/announcements for the chosen audience…"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-zinc-900 block mb-1.5">Audience</label>
              <div className="flex flex-wrap gap-2">
                {(["ALL", "TRAVELERS_ONLY", "TRANSPORTERS_ONLY"] as AnnouncementAudience[]).map((a) => (
                  <button
                    type="button"
                    key={a}
                    onClick={() => setAudience(a)}
                    className={`text-sm px-3 py-2 rounded-xl border transition-colors ${
                      audience === a
                        ? "bg-zinc-950 text-white border-zinc-950"
                        : "bg-white text-zinc-700 border-slate-200 hover:border-slate-400"
                    }`}
                  >
                    {AUDIENCE_LABEL[a]}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <SecondaryButton onClick={() => setShowForm(false)}>Cancel</SecondaryButton>
              <PrimaryButton type="submit" disabled={submitting}>
                {submitting ? "Publishing…" : "Publish"}
              </PrimaryButton>
            </div>
          </form>
        </Card>
      )}

      {error && <ErrorState message={error} onRetry={load} />}

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<MegaphoneIcon />}
          title="No announcements yet"
          description="Publish your first announcement so travelers and transporters see it on their dashboards."
        />
      ) : (
        <div className="space-y-3">
          {items.map((a) => (
            <Card key={a.id}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <div className="text-base font-semibold text-zinc-950">{a.title}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {AUDIENCE_LABEL[a.audience]} ·{" "}
                    {new Date(a.createdAt).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })}
                    {a.createdByAdmin ? ` · by ${a.createdByAdmin.username}` : ""}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusPill tone={a.isPublished ? "emerald" : "slate"}>
                    {a.isPublished ? "Published" : "Hidden"}
                  </StatusPill>
                </div>
              </div>
              <p className="text-sm text-zinc-700 whitespace-pre-wrap">{a.body}</p>
              <div className="flex items-center justify-end gap-3 mt-3 pt-3 border-t border-slate-100">
                {canCreate && (
                  <button
                    onClick={() => togglePublish(a)}
                    disabled={busyId === a.id}
                    className="text-xs font-semibold text-zinc-700 hover:text-zinc-900 disabled:opacity-60"
                  >
                    {a.isPublished ? "Hide" : "Publish"}
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => remove(a.id)}
                    disabled={busyId === a.id}
                    className="text-xs font-semibold text-red-700 hover:text-red-900 disabled:opacity-60"
                  >
                    Delete
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </Page>
  );
}
