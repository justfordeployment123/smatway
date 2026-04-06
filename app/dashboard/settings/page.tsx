"use client";

import { useState } from "react";
import { LockIcon, BellIcon, EyeIcon, EyeOffIcon } from "@/app/dashboard/_Components/Icons";

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${enabled ? "bg-emerald-500" : "bg-slate-200"}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-6" : "translate-x-1"}`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [notifications, setNotifications] = useState({
    bookingUpdates: true,
    paymentUpdates: true,
    routeUpdates: true,
    vehicleUpdates: true,
    systemAnnouncements: true,
  });

  const notificationTypes = [
    { key: "bookingUpdates" as const,      title: "Booking Updates",      description: "Get notified about booking confirmations and changes" },
    { key: "paymentUpdates" as const,      title: "Payment Updates",      description: "Receive notifications about payment status" },
    { key: "routeUpdates" as const,        title: "Route Updates",        description: "Get notified about route changes and new routes" },
    { key: "vehicleUpdates" as const,      title: "Vehicle Updates",      description: "Receive notifications about vehicle changes" },
    { key: "systemAnnouncements" as const, title: "System Announcements", description: "Important updates and announcements from Smatway" },
  ];

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Settings</h1>

      {/* Change Password */}
      <div className="bg-white rounded-lg border border-[#f0f0f0] p-6 mb-6">
        <div className="flex items-center space-x-3 mb-6">
          <LockIcon className="w-6 h-6 text-emerald-600" />
          <h2 className="text-xl font-bold text-slate-900">Change Password</h2>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            <span className="text-red-500 mr-1">*</span>New Password
          </label>
          <div className="flex items-center border border-slate-300 rounded-lg px-3 py-2.5 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
            <input
              type={showNew ? "text" : "password"}
              placeholder="Enter new password"
              className="flex-1 outline-none text-slate-900 text-sm bg-transparent"
            />
            <button type="button" onClick={() => setShowNew(!showNew)}>
              {showNew ? <EyeIcon className="w-4 h-4 text-slate-400" /> : <EyeOffIcon className="w-4 h-4 text-slate-400" />}
            </button>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            <span className="text-red-500 mr-1">*</span>Confirm Password
          </label>
          <div className="flex items-center border border-slate-300 rounded-lg px-3 py-2.5 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm new password"
              className="flex-1 outline-none text-slate-900 text-sm bg-transparent"
            />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)}>
              {showConfirm ? <EyeIcon className="w-4 h-4 text-slate-400" /> : <EyeOffIcon className="w-4 h-4 text-slate-400" />}
            </button>
          </div>
        </div>

        <button className="bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold px-6 py-2.5 rounded-lg border-0 shadow transition-all">
          Update Password
        </button>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-lg border border-[#f0f0f0] p-6">
        <div className="flex items-center space-x-3 mb-6">
          <BellIcon className="w-6 h-6 text-emerald-600" />
          <h2 className="text-xl font-bold text-slate-900">Notifications</h2>
        </div>

        <div className="space-y-4">
          {/* Enable Push Notifications — highlighted green row */}
          <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border-2 border-emerald-200">
            <div>
              <p className="font-bold text-slate-900">Enable Push Notifications</p>
              <p className="text-sm text-slate-600">Receive notifications about your bookings and updates</p>
            </div>
            <Toggle enabled={pushEnabled} onToggle={() => setPushEnabled(!pushEnabled)} />
          </div>

          {/* Divider with centered text */}
          <div className="flex items-center gap-4 my-2">
            <div className="flex-1 border-t border-[#f0f0f0]" />
            <span className="text-sm font-medium text-slate-500 whitespace-nowrap">Notification Types</span>
            <div className="flex-1 border-t border-[#f0f0f0]" />
          </div>

          {/* Notification type rows */}
          {notificationTypes.map((type) => (
            <div key={type.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p className="font-semibold text-slate-900">{type.title}</p>
                <p className="text-sm text-slate-600">{type.description}</p>
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
