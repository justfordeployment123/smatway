"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useChat } from "@/hooks/useChat";
import { getCurrentUser } from "@/lib/auth";

export function NotificationBell() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const { notifications, requestNotificationPermission } = useChat(user?.id);
  const [showDrawer, setShowDrawer] = useState(false);
  const unreadCount = notifications.length;

  const handleNotificationClick = (notif: any) => {
    if (notif.type !== "message") return;

    const senderRole = notif.message?.sender?.role;
    const targetPath = senderRole === "traveler" ? "/dashboard/bookings" : "/dashboard/my-bookings";
    const targetUrl = notif.bookingId
      ? `${targetPath}?openChatBooking=${encodeURIComponent(notif.bookingId)}`
      : targetPath;

    setShowDrawer(false);
    router.push(targetUrl);
  };

  useEffect(() => {
    getCurrentUser().then(setUser).catch(() => { });
  }, []);

  return (
    <>
      <button
        onClick={() => {
          setShowDrawer(!showDrawer);
          requestNotificationPermission();
        }}
        className="relative p-2 text-slate-600 hover:text-zinc-900 transition-colors"
        title="Notifications"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Drawer */}
      {showDrawer && (
        <div className="fixed inset-0 z-50" onClick={() => setShowDrawer(false)}>
          <div
            className="absolute right-0 top-0 mt-12 w-80 bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-200">
              <h3 className="font-semibold text-zinc-900">Notifications</h3>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm text-slate-400">No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {notifications.slice(0, 10).map((notif, i) => (
                    <div
                      key={notif.message?.id || i}
                      className="p-3 hover:bg-slate-50 cursor-pointer transition-colors"
                      onClick={() => handleNotificationClick(notif)}
                    >
                      {notif.type === "message" && notif.message && (
                        <>
                          <p className="text-sm font-medium text-zinc-900">
                            "{notif.message.content}" from {notif.message.sender?.name} {notif.message.sender?.role === 'traveler' ? 'Traveler' : 'Transporter'}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            {new Date(notif.message.createdAt).toLocaleTimeString()}
                          </p>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
