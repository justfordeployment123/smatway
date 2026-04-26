"use client";

import { useEffect, useState } from "react";
import { getAnnouncements } from "./api";

const POLL_MS = 60_000;
// Per-audience cursor so a transporter's "seen" state doesn't accidentally
// clear a traveler's dot when both roles are tested in the same browser.
const seenKey = (audience: "TRAVELER" | "TRANSPORTER") =>
  `announcements:seen-up-to:${audience}`;

/**
 * Tracks how many announcements the user hasn't acknowledged yet.
 *
 * Source of truth = `createdAt` timestamps from the public announcements
 * endpoint. Diffed against `localStorage.announcements:seen-up-to:<audience>`
 * which {@link markAnnouncementsSeen} bumps when the user opens the page.
 *
 * Mirrors the bug-report notifications setup — same trade-off (per-device
 * "seen" state in localStorage) so we avoid a DB column for a sidebar dot.
 */
export function useUnreadAnnouncements(
  audience: "TRAVELER" | "TRANSPORTER",
): { unread: number; recheck: () => void } {
  const [unread, setUnread] = useState(0);

  function check() {
    getAnnouncements(audience)
      .then((res) => {
        const seenUpTo = readSeenCursor(audience);
        const count = res.announcements.reduce((acc, a) => {
          const t = new Date(a.createdAt).getTime();
          return t > seenUpTo ? acc + 1 : acc;
        }, 0);
        setUnread(count);
      })
      .catch(() => { /* sidebar dot is nice-to-have — silent on error */ });
  }

  useEffect(() => {
    check();
    const interval = setInterval(check, POLL_MS);
    function onFocus() { check(); }
    function onVisibility() { if (document.visibilityState === "visible") check(); }
    function onStorage(e: StorageEvent) { if (e.key === seenKey(audience)) check(); }
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("storage", onStorage);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("storage", onStorage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audience]);

  return { unread, recheck: check };
}

/**
 * Mark every announcement up to `cursor` (default = now) as seen for this
 * audience. Called by the announcements page after its list loads.
 * Dispatches a synthetic storage event so other open tabs in the same
 * browser pick it up — native `storage` doesn't fire in the originating tab.
 */
export function markAnnouncementsSeen(
  audience: "TRAVELER" | "TRANSPORTER",
  cursor: number = Date.now(),
) {
  if (typeof window === "undefined") return;
  const key = seenKey(audience);
  const previous = readSeenCursor(audience);
  if (cursor <= previous) return;
  localStorage.setItem(key, String(cursor));
  window.dispatchEvent(new StorageEvent("storage", { key, newValue: String(cursor) }));
}

function readSeenCursor(audience: "TRAVELER" | "TRANSPORTER"): number {
  if (typeof window === "undefined") return 0;
  const raw = localStorage.getItem(seenKey(audience));
  if (!raw) return 0;
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}
