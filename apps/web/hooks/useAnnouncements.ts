"use client";

import { useEffect, useState, useCallback } from "react";
import io, { Socket } from "socket.io-client";
import { getAnnouncements, PublicAnnouncement } from "@/lib/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3002";

/**
 * Source-of-truth fetch + real-time hint.
 *
 * - Fetches /announcements?audience=… on mount and on tab refocus (always
 *   the source of truth — guarantees we never miss one even if the socket
 *   disconnects).
 * - Opens a Socket.io connection and joins the audience room. When the
 *   server emits announcement.created/updated/deleted, we just refetch.
 *   The socket payload is treated as a "go look again" hint, not data.
 */
export function useAnnouncements(audience: "TRAVELER" | "TRANSPORTER") {
  const [items, setItems] = useState<PublicAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setError(null);
      const res = await getAnnouncements(audience);
      setItems(res.announcements);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load announcements");
    } finally {
      setLoading(false);
    }
  }, [audience]);

  // Initial fetch + tab refocus
  useEffect(() => {
    refetch();
    const onVis = () => {
      if (document.visibilityState === "visible") refetch();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [refetch]);

  // Socket subscription — best-effort hint that triggers a refetch
  useEffect(() => {
    const socket: Socket = io(API_BASE_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
    });

    socket.on("connect", () => {
      socket.emit("subscribe-announcements", { accountType: audience });
    });

    const onChange = () => { refetch(); };
    socket.on("announcement.created", onChange);
    socket.on("announcement.updated", onChange);
    socket.on("announcement.deleted", onChange);

    return () => {
      socket.off("announcement.created", onChange);
      socket.off("announcement.updated", onChange);
      socket.off("announcement.deleted", onChange);
      socket.emit("unsubscribe-announcements");
      socket.disconnect();
    };
  }, [audience, refetch]);

  return { items, loading, error, refetch };
}
