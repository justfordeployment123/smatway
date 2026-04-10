"use client";

import { useState } from "react";
import { UserIcon, PhoneIcon, MailIcon, CameraIcon } from "@/app/dashboard/_Components/Icons";

const travelerData = {
  initial: "J",
  fullName: "John Doe",
  phone: "+91 12 12345678",
  email: "john.doe@example.com",
  role: "Traveler",
  roleTag: "text-emerald-700 bg-emerald-50 border border-emerald-300",
  emergencyContacts: [
    { name: "John Doe Friend", relation: "family", phone: "+92 12 12345678", status: "Pending", statusTag: "text-amber-700 bg-amber-50 border border-amber-300" },
    { name: "John Doe Family", relation: "friend", phone: "+92 12 12345678", status: "Verified", statusTag: "text-emerald-700 bg-emerald-50 border border-emerald-300" },
  ],
};

const transporterData = {
  initial: "J",
  fullName: "John Doe",
  phone: "+91 12 12345678",
  email: "john.doe@example.com",
  role: "Transporter",
  roleTag: "text-blue-700 bg-blue-50 border border-blue-300",
  emergencyContacts: [
    { name: "John Doe Friend", relation: "family", phone: "+92 12 12345678", status: "Verified", statusTag: "text-emerald-700 bg-emerald-50 border border-emerald-300" },
    { name: "John Doe Family", relation: "friend", phone: "+92 12 12345678", status: "Verified", statusTag: "text-emerald-700 bg-emerald-50 border border-emerald-300" },
  ],
};

export default function ProfilePage() {
  const [role] = useState<"traveler" | "transporter">(() => {
    if (typeof window === "undefined") return "traveler";
    const saved = localStorage.getItem("smatway-dev-role") as "traveler" | "transporter" | null;
    return saved ?? "traveler";
  });

  const data = role === "transporter" ? transporterData : travelerData;
  const [fullName, setFullName] = useState(data.fullName);
  const [phone, setPhone] = useState(data.phone);

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">My Profile</h1>

      {/* Profile card */}
      <div className="bg-white rounded-lg border border-[#f0f0f0] p-6 mb-6">
        {/* Avatar + name */}
        <div className="flex items-center space-x-6 mb-8">
          <div className="relative">
            <div
              className="rounded-full bg-linear-to-r from-emerald-500 to-teal-600 flex items-center justify-center text-white font-semibold"
              style={{ width: 100, height: 100, fontSize: 18 }}
            >
              {data.initial}
            </div>
            <button
              title="Change profile picture"
              className="absolute bottom-0 right-0 w-7 h-7 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-lg hover:bg-slate-50 transition-colors"
            >
              <CameraIcon className="w-3 h-3" />
            </button>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{data.fullName}</h2>
            <span className={`inline-block mt-2 px-2 py-0.5 text-xs font-medium rounded ${data.roleTag}`}>
              {data.role}
            </span>
          </div>
        </div>

        <hr className="border-[#f0f0f0] mb-6" />

        {/* Form */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <span className="text-red-500 mr-1">*</span>Full Name
            </label>
            <div className="flex items-center border border-slate-300 rounded-lg px-3 py-2.5 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
              <UserIcon className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={fullName}
                placeholder="John Doe"
                onChange={(e) => setFullName(e.target.value)}
                className="flex-1 ml-2 outline-none text-slate-900 text-sm bg-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <span className="text-red-500 mr-1">*</span>Phone Number
            </label>
            <div className="flex items-center border border-slate-300 rounded-lg px-3 py-2.5 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
              <PhoneIcon className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={phone}
                placeholder="+254 712 345 678"
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1 ml-2 outline-none text-slate-900 text-sm bg-transparent"
              />
            </div>
          </div>
        </div>

        {/* Email (readonly) */}
        <div className="bg-slate-50 p-4 rounded-lg mb-4">
          <div className="flex items-center space-x-2 text-slate-600 mb-2">
            <MailIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Email</span>
          </div>
          <p className="text-slate-900">{data.email}</p>
          <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
        </div>

        <button className="bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold px-6 py-2.5 rounded-lg border-0 shadow transition-all">
          Update Profile
        </button>
      </div>

      {/* Emergency Contacts */}
      <div className="bg-white rounded-lg border border-[#f0f0f0] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#f0f0f0]">
          <h2 className="text-base font-semibold text-slate-900">Emergency Contacts</h2>
        </div>
        <div className="p-6 space-y-4">
          {data.emergencyContacts.map((contact, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <UserIcon className="w-4 h-4 text-slate-600" />
                  <span className="font-semibold text-slate-900">{contact.name}</span>
                  <span className="px-2 py-0.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded capitalize">
                    {contact.relation}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-slate-600">
                  <PhoneIcon className="w-4 h-4 text-slate-600" />
                  <span className="text-sm">{contact.phone}</span>
                </div>
              </div>
              <span className={`px-2 py-0.5 text-xs font-medium rounded ${contact.statusTag}`}>
                {contact.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
