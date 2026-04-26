"use client";

import { useEffect, useRef, useState } from "react";
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
import { LightboxImage } from "@/app/_Components/LightboxImage";

const AUDIENCE_LABEL: Record<AnnouncementAudience, string> = {
  ALL: "Travelers + Transporters",
  TRAVELERS_ONLY: "Travelers only",
  TRANSPORTERS_ONLY: "Transporters only",
};

const MAX_IMAGES = 4;
const DEFAULT_EXPIRES_IN_DAYS = 7;

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
  const [expiresInDays, setExpiresInDays] = useState<number>(DEFAULT_EXPIRES_IN_DAYS);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manage object-URL lifecycles for the image preview tiles.
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
      const created = await createAdminAnnouncement({
        title,
        body,
        audience,
        isPublished: true,
        expiresInDays,
        images,
      });
      setItems((prev) => [created.announcement, ...prev]);
      // Reset form
      setTitle(""); setBody(""); setAudience("ALL");
      setExpiresInDays(DEFAULT_EXPIRES_IN_DAYS);
      setImages([]);
      setShowForm(false);
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

            {/* Auto-expiry */}
            <div>
              <label className="text-sm font-semibold text-zinc-900 block mb-1.5">
                Auto-remove after <span className="font-normal text-slate-500">(default 7 days)</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={365}
                  value={expiresInDays}
                  onChange={(e) => setExpiresInDays(Number(e.target.value))}
                  className="w-24 rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm focus:outline-none focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                />
                <span className="text-sm text-slate-500">days</span>
                <span className="text-[11px] text-slate-400 ml-3">
                  {expiresInDays > 0
                    ? `Disappears around ${new Date(Date.now() + expiresInDays * 86400000).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })}`
                    : "Set to 0 to keep this announcement until you delete it manually"}
                </span>
              </div>
            </div>

            {/* Image attachments */}
            <div>
              <label className="text-sm font-semibold text-zinc-900 block mb-1.5">
                Images <span className="font-normal text-slate-500">(optional, up to {MAX_IMAGES})</span>
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
          {items.map((a) => {
            const visibleImages = (a.imageUrls ?? []).filter(Boolean) as string[];
            const expiresAt = a.expiresAt ? new Date(a.expiresAt) : null;
            const expiresIn = expiresAt ? Math.ceil((expiresAt.getTime() - Date.now()) / 86400000) : null;
            const expiryTone =
              expiresIn === null ? "slate" :
              expiresIn <= 0 ? "red" :
              expiresIn <= 2 ? "yellow" : "blue";
            const expiryLabel =
              expiresIn === null ? "No auto-expiry" :
              expiresIn <= 0 ? "Expiring now" :
              expiresIn === 1 ? "Expires in 1 day" :
              `Expires in ${expiresIn} days`;
            return (
            <Card key={a.id}>
              <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                <div className="min-w-0">
                  <div className="text-base font-semibold text-zinc-950">{a.title}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {AUDIENCE_LABEL[a.audience]} ·{" "}
                    {new Date(a.createdAt).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })}
                    {a.createdByAdmin ? ` · by ${a.createdByAdmin.username}` : ""}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <StatusPill tone={expiryTone}>{expiryLabel}</StatusPill>
                  <StatusPill tone={a.isPublished ? "emerald" : "slate"}>
                    {a.isPublished ? "Published" : "Hidden"}
                  </StatusPill>
                </div>
              </div>
              <p className="text-sm text-zinc-700 whitespace-pre-wrap">{a.body}</p>
              {visibleImages.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {visibleImages.map((url, i) => (
                    <LightboxImage
                      key={i}
                      src={url}
                      alt={`${a.title} attachment ${i + 1}`}
                      className="block w-24 h-24 rounded-lg object-cover ring-1 ring-slate-200 bg-slate-50 hover:ring-emerald-300 transition-all"
                    />
                  ))}
                </div>
              )}
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
            );
          })}
        </div>
      )}
    </Page>
  );
}
