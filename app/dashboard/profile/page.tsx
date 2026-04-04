"use client";

import { useState } from "react";

function UserIcon() {
  return (
    <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
}

export default function ProfilePage() {
  const [fullName, setFullName] = useState("M Hamza");
  const [phone, setPhone] = useState("+91 12 12345678");

  const emergencyContacts = [
    { name: "M Hamza", relation: "Family", phone: "+92 12 12345678", status: "Pending", statusColor: "text-amber-600 bg-amber-50 border-amber-200" },
    { name: "M Hamza", relation: "Friend", phone: "+92 12 12345678", status: "Verified", statusColor: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  ];

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">My Profile</h1>

      {/* Profile card */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
        {/* Avatar + name */}
        <div className="flex items-center space-x-6 mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center text-white text-3xl font-bold">
              M
            </div>
            <button className="absolute bottom-0 right-0 w-7 h-7 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-lg hover:bg-slate-50 transition-colors">
              <CameraIcon />
            </button>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">M Hamza</h2>
            <span className="inline-block mt-2 px-2.5 py-0.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded">
              Traveler
            </span>
          </div>
        </div>

        <hr className="border-slate-200 mb-6" />

        {/* Form */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <span className="text-red-500 mr-1">*</span>Full Name
            </label>
            <div className="flex items-center border border-slate-300 rounded-lg px-3 py-2.5 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
              <UserIcon />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="flex-1 ml-2 outline-none text-slate-900 text-sm bg-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <span className="text-red-500 mr-1">*</span>Phone Number
            </label>
            <div className="flex items-center border border-slate-300 rounded-lg px-3 py-2.5 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
              <PhoneIcon />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1 ml-2 outline-none text-slate-900 text-sm bg-transparent"
              />
            </div>
          </div>
        </div>

        {/* Email (readonly) */}
        <div className="bg-slate-50 p-4 rounded-lg mb-6">
          <div className="flex items-center space-x-2 text-slate-600 mb-1">
            <MailIcon />
            <span className="text-sm font-medium">Email</span>
          </div>
          <p className="text-slate-900 text-sm">anybody.add2@gmail.com</p>
          <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
        </div>

        <button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold px-6 py-2.5 rounded-lg shadow transition-all">
          Update Profile
        </button>
      </div>

      {/* Emergency Contacts */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Emergency Contacts</h2>
        <div className="space-y-4">
          {emergencyContacts.map((contact, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 text-sm text-slate-700">
                    <UserIcon />
                    {contact.name}
                  </span>
                  <span className="px-2 py-0.5 text-xs font-medium border rounded text-slate-600 border-slate-300">
                    {contact.relation}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-slate-500">
                  <PhoneIcon />
                  {contact.phone}
                </div>
              </div>
              <span className={`px-2.5 py-0.5 text-xs font-medium border rounded ${contact.statusColor}`}>
                {contact.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
