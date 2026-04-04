"use client";

import { useState } from "react";

export default function SearchRidesPage() {
  const [transportType, setTransportType] = useState("All Types");

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Available Rides</h1>
        <p className="text-slate-600">Search for Routes</p>
      </div>

      {/* Search card */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Search Routes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Departure Country</label>
            <input type="text" placeholder="Enter departure country" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Departure City</label>
            <input type="text" placeholder="Enter departure city" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Destination Country</label>
            <input type="text" placeholder="Enter destination country" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Destination City</label>
            <input type="text" placeholder="Enter destination city" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Transport Type</label>
            <select
              value={transportType}
              onChange={(e) => setTransportType(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
            >
              <option>All Types</option>
              <option>Bus</option>
              <option>Van</option>
              <option>Car</option>
              <option>Truck</option>
            </select>
          </div>
        </div>
        <div className="flex justify-center pt-4">
          <button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold px-8 py-2.5 rounded-lg shadow transition-all">
            Search Routes
          </button>
        </div>
      </div>

      {/* Empty state */}
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <svg className="w-16 h-16 mb-4 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <p className="text-sm">Enter search criteria above and click &apos;Search Routes&apos; to find available rides</p>
      </div>
    </div>
  );
}
