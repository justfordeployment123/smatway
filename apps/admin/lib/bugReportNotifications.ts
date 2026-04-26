"use client";

import { useEffect, useState } from "react";
import { getAdminBugReportCounts } from "./api";

const POLL_MS = 60_000;

/**
 * Polls /admin/bug-reports/counts and exposes the OPEN bucket as the
 * sidebar's unread badge. Refetches on focus + visibility change so an
 * admin who replies in tab A sees the dot drop in tab B without reload.
 *
 * No "seen" tracking on this side — OPEN reports are intrinsically unread
 * (no admin has replied yet). Once an admin replies, status flips to
 * REPLIED and the count drops.
 */
export function useAdminUnreadBugReports(): { open: number; recheck: () => void } {
  const [open, setOpen] = useState(0);

  function check() {
    getAdminBugReportCounts()
      .then((counts) => setOpen(counts.OPEN ?? 0))
      .catch(() => { /* silent */ });
  }

  useEffect(() => {
    check();
    const interval = setInterval(check, POLL_MS);
    function onFocus() { check(); }
    function onVisibility() { if (document.visibilityState === "visible") check(); }
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return { open, recheck: check };
}
