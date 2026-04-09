"use client";

import { useState } from "react";

function AntEmptyIllustration() {
  return (
    <svg width="184" height="152" viewBox="0 0 184 152" xmlns="http://www.w3.org/2000/svg">
      <title>No data</title>
      <g fill="none" fillRule="evenodd">
        <g transform="translate(24 31.67)">
          <ellipse fillOpacity=".8" fill="#F5F5F7" cx="67.797" cy="106.89" rx="67.797" ry="12.668" />
          <path d="M122.034 69.674L98.109 40.229c-1.148-1.386-2.826-2.225-4.593-2.225h-51.44c-1.766 0-3.444.839-4.592 2.225L13.56 69.674v15.383h108.475V69.674z" fill="#AEB8C2" />
          <path d="M101.537 86.214L80.63 61.102c-1.001-1.207-2.507-1.867-4.048-1.867H31.724c-1.54 0-3.047.66-4.048 1.867L6.769 86.214v13.792h94.768V86.214z" fill="url(#linearGradient-1)" transform="translate(13.56)" />
          <path d="M33.83 0h67.933a4 4 0 0 1 4 4v93.344a4 4 0 0 1-4 4H33.83a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4z" fill="#F5F5F7" />
          <path d="M42.678 9.953h50.237a2 2 0 0 1 2 2V36.91a2 2 0 0 1-2 2H42.678a2 2 0 0 1-2-2V11.953a2 2 0 0 1 2-2zM42.94 49.767h49.713a2.262 2.262 0 1 1 0 4.524H42.94a2.262 2.262 0 0 1 0-4.524zM42.94 61.53h49.713a2.262 2.262 0 1 1 0 4.525H42.94a2.262 2.262 0 0 1 0-4.525zM121.813 105.032c-.775 3.071-3.497 5.36-6.735 5.36H20.515c-3.238 0-5.96-2.29-6.734-5.36a7.309 7.309 0 0 1-.222-1.79V69.675h26.318c2.907 0 5.25 2.448 5.25 5.42v.04c0 2.971 2.37 5.37 5.277 5.37h34.785c2.907 0 5.277-2.421 5.277-5.393V75.1c0-2.972 2.343-5.426 5.25-5.426h26.318v33.569c0 .617-.077 1.216-.221 1.789z" fill="#DCE0E6" />
        </g>
        <path d="M149.121 33.292l-6.83 2.65a1 1 0 0 1-1.317-1.23l1.937-6.207c-2.589-2.944-4.109-6.534-4.109-10.408C138.802 8.102 148.92 0 161.402 0 173.881 0 184 8.102 184 18.097c0 9.995-10.118 18.097-22.599 18.097-4.528 0-8.744-1.066-12.28-2.902z" fill="#DCE0E6" />
        <g transform="translate(149.65 15.383)" fill="#FFF">
          <ellipse cx="20.654" cy="3.167" rx="2.849" ry="2.815" />
          <path d="M5.698 5.63H0L2.898.704zM9.259.704h4.985V5.63H9.259z" />
        </g>
      </g>
    </svg>
  );
}

const transportTypes = ["All Types", "Bus", "Minibus", "Van", "Car", "Truck"];

export default function SearchRidesPage() {
  const [depCountry, setDepCountry] = useState("");
  const [depCity, setDepCity] = useState("");
  const [destCountry, setDestCountry] = useState("");
  const [destCity, setDestCity] = useState("");
  const [transportType, setTransportType] = useState("All Types");
  const [searched, setSearched] = useState(false);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
          Available Rides
        </h1>
        <p className="text-sm text-slate-400">Search for routes</p>
      </div>

      {/* Search form */}
      <div className="bg-white rounded-xl border border-slate-100 p-6 mb-6">
        <h3 className="text-sm font-semibold text-zinc-900 mb-4">
          Search Routes
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-zinc-900 mb-1.5 block">
              Departure Country
            </label>
            <input
              type="text"
              placeholder="Enter departure country"
              value={depCountry}
              onChange={(e) => setDepCountry(e.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-full transition-all"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-900 mb-1.5 block">
              Departure City
            </label>
            <input
              type="text"
              placeholder="Enter departure city"
              value={depCity}
              onChange={(e) => setDepCity(e.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-full transition-all"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-900 mb-1.5 block">
              Destination Country
            </label>
            <input
              type="text"
              placeholder="Enter destination country"
              value={destCountry}
              onChange={(e) => setDestCountry(e.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-full transition-all"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-900 mb-1.5 block">
              Destination City
            </label>
            <input
              type="text"
              placeholder="Enter destination city"
              value={destCity}
              onChange={(e) => setDestCity(e.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-full transition-all"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-900 mb-1.5 block">
              Transport Type
            </label>
            <div className="relative">
              <select
                value={transportType}
                onChange={(e) => setTransportType(e.target.value)}
                className="appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-full transition-all pr-10"
              >
                {transportTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-slate-400"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <button
            type="button"
            onClick={() => setSearched(true)}
            className="bg-zinc-900 hover:bg-zinc-800 text-white font-semibold px-8 py-2.5 rounded-xl active:scale-[0.98] transition-all text-sm"
          >
            Search Routes
          </button>
        </div>
      </div>

      {/* Empty state */}
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AntEmptyIllustration />
        <p className="text-sm font-medium text-zinc-900 mt-4">
          No rides to display
        </p>
        <p className="text-sm text-slate-400 max-w-xs mt-1">
          Enter search criteria above and click &apos;Search Routes&apos; to
          find available rides
        </p>
      </div>
    </div>
  );
}
