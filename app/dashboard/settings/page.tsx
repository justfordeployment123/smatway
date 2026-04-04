"use client";

import { useState } from "react";

function LockIcon() {
  return (
    <svg className="w-5 h-5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg className="w-5 h-5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? "bg-emerald-500" : "bg-slate-200"}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-6" : "translate-x-1"}`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [notifications, setNotifications] = useState({
    bookingUpdates: true,
    paymentUpdates: true,
    routeUpdates: true,
    vehicleUpdates: true,
    systemAnnouncements: true,
  });

  const notificationTypes = [
    { key: "bookingUpdates" as const, title: "Booking Updates", description: "Notifications about your booking status" },
    { key: "paymentUpdates" as const, title: "Payment Updates", description: "Notifications about payment processing" },
    { key: "routeUpdates" as const, title: "Route Updates", description: "Notifications about route changes" },
    { key: "vehicleUpdates" as const, title: "Vehicle Updates", description: "Notifications about vehicle information" },
    { key: "systemAnnouncements" as const, title: "System Announcements", description: "Important system-wide announcements" },
  ];

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Settings</h1>

      {/* Change Password */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-6">
          <LockIcon />
          <h2 className="text-lg font-bold text-slate-900">Change Password</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
            <div className="flex items-center border border-slate-300 rounded-lg px-3 py-2.5 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="Enter new password"
                className="flex-1 outline-none text-slate-900 text-sm bg-transparent"
              />
              <button onClick={() => setShowNewPassword(!showNewPassword)}>
                {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
            <div className="flex items-center border border-slate-300 rounded-lg px-3 py-2.5 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                className="flex-1 outline-none text-slate-900 text-sm bg-transparent"
              />
              <button onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>
        </div>

        <button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold px-6 py-2.5 rounded-lg shadow transition-all">
          Update Password
        </button>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <BellIcon />
          <h2 className="text-lg font-bold text-slate-900">Notifications</h2>
        </div>

        {/* Enable Push Notifications */}
        <div className="flex items-center justify-between py-3 border-b border-slate-100 mb-4">
          <span className="text-sm font-medium text-slate-900">Enable Push Notifications</span>
          <Toggle enabled={pushEnabled} onToggle={() => setPushEnabled(!pushEnabled)} />
        </div>

        {/* Notification Types */}
        <p className="text-sm font-semibold text-slate-700 mb-3">Notification Types</p>
        <div className="space-y-1">
          {notificationTypes.map((type) => (
            <div key={type.key} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
              <div>
                <p className="text-sm font-medium text-slate-900">{type.title}</p>
                <p className="text-xs text-slate-500">{type.description}</p>
              </div>
              <Toggle
                enabled={notifications[type.key]}
                onToggle={() => setNotifications((prev) => ({ ...prev, [type.key]: !prev[type.key] }))}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
