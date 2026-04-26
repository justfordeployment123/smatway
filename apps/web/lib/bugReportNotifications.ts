"use client";

import { useEffect, useState } from "react";
import { listMyBugReports } from "./api";

const SEEN_KEY = "bug-reports:seen-up-to";
const POLL_MS = 60_000;

/**
 * Tracks how many of the user's bug-report replies they haven't seen yet.
 *
 * Source of truth = `repliedAt` timestamps from the API. We diff against a
 * `seen-up-to` cursor in localStorage so the dot clears as soon as the user
 * lands on /dashboard/support (which calls {@link markBugReportsSeen}).
 *
 * No DB column needed — keeping the seen-state client-local means we don't
 * burn a migration on a feature this lightweight. Trade-off: it's per-device,
 * so a user with two browsers might see the dot disappear on one but not the
 * other until they open support there too. Acceptable for a notification dot.
 *
 * Polls every 60s, plus refetches on focus / visibilitychange so an admin
 * reply lights the dot soon after it's sent.
 */
export function useUnreadBugReplies(): { unread: number; recheck: () => void } {
  const [unread, setUnread] = useState(0);

  function check() {
    listMyBugReports()
      .then((reports) => {
        const seenUpTo = readSeenCursor();
        const count = reports.reduce((acc, r) => {
          if (!r.repliedAt) return acc;
          const t = new Date(r.repliedAt).getTime();
          return t > seenUpTo ? acc + 1 : acc;
        }, 0);
        setUnread(count);
      })
      .catch(() => { /* silent — sidebar dot is nice-to-have */ });
  }

  useEffect(() => {
    check();
    const interval = setInterval(check, POLL_MS);
    function onFocus() { check(); }
    function onVisibility() { if (document.visibilityState === "visible") check(); }
    function onStorage(e: StorageEvent) { if (e.key === SEEN_KEY) check(); }
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("storage", onStorage);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return { unread, recheck: check };
}

/**
 * Mark every reply visible up to `cursor` (default = now) as seen. Called
 * by the support page once the report list has rendered. Dispatches a
 * synthetic storage event so other open tabs in the same browser pick it up.
 */
export function markBugReportsSeen(cursor: number = Date.now()) {
  if (typeof window === "undefined") return;
  const previous = readSeenCursor();
  if (cursor <= previous) return;
  localStorage.setItem(SEEN_KEY, String(cursor));
  // Native `storage` events don't fire in the same tab, so trigger a manual
  // bus event for the hook running in the layout above this page.
  window.dispatchEvent(new StorageEvent("storage", { key: SEEN_KEY, newValue: String(cursor) }));
}

function readSeenCursor(): number {
  if (typeof window === "undefined") return 0;
  const raw = localStorage.getItem(SEEN_KEY);
  if (!raw) return 0;
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}
