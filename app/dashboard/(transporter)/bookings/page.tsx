"use client";

import { useState } from "react";

function AntEmptyInbox() {
    return (
        <svg width="64" height="41" viewBox="0 0 64 41" xmlns="http://www.w3.org/2000/svg">
            <title>No data</title>
            <g transform="translate(0 1)" fill="none" fillRule="evenodd">
                <ellipse fill="#f5f5f5" cx="32" cy="33" rx="32" ry="7" />
                <g fillRule="nonzero" stroke="#d9d9d9">
                    <path d="M55 12.76L44.854 1.258C44.367.474 43.656 0 42.907 0H21.093c-.749 0-1.46.474-1.947 1.257L9 12.761V22h46v-9.24z" />
                    <path d="M41.613 15.931c0-1.605.994-2.93 2.227-2.931H55v18.137C55 33.26 53.68 35 52.05 35h-40.1C10.32 35 9 33.259 9 31.137V13h11.16c1.233 0 2.227 1.323 2.227 2.928v.022c0 1.605 1.005 2.901 2.237 2.901h14.752c1.232 0 2.237-1.308 2.237-2.913v-.007z" fill="#fafafa" />
                </g>
            </g>
        </svg>
    );
}

const columns = ["Bookingref", "Traveler", "Route", "Departure", "Seats", "Amount", "Status", "Actions"];

export default function TransporterBookingsPage() {
    const [autoConfirm, setAutoConfirm] = useState(true);

    return (
        <div className="p-4 md:p-0 space-y-6">
            <div className="bg-white rounded-lg border border-slate-200">
                <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-1">Booking Settings</h3>
                            <p className="text-sm text-slate-600">Configure how bookings are handled</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-slate-700">Auto-confirm Bookings</span>
                            <button
                                type="button"
                                role="switch"
                                aria-checked={autoConfirm}
                                onClick={() => setAutoConfirm((prev) => !prev)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoConfirm ? "bg-emerald-500" : "bg-slate-200"
                                    }`}
                            >
                                <span className="sr-only">Toggle auto-confirm</span>
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${autoConfirm ? "translate-x-6" : "translate-x-1"
                                        }`}
                                />
                            </button>
                        </div>
                    </div>

                    <div className="border-t border-slate-200 my-5" />

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                            <div className="flex items-center space-x-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                </svg>
                                <div>
                                    <div className="text-2xl font-bold text-slate-900">0</div>
                                    <div className="text-sm text-slate-600">Pending Confirmation</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                            <div className="flex items-center space-x-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <path d="m9 11 3 3L22 4" />
                                </svg>
                                <div>
                                    <div className="text-2xl font-bold text-slate-900">0</div>
                                    <div className="text-sm text-slate-600">Confirmed</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <div className="flex items-center space-x-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                                    <rect width="20" height="16" x="2" y="4" rx="2" />
                                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                </svg>
                                <div>
                                    <div className="text-2xl font-bold text-slate-900">0</div>
                                    <div className="text-sm text-slate-600">Total Bookings</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                    <h3 className="text-base md:text-lg font-semibold text-slate-900">All Bookings</h3>
                    <button type="button" className="px-3 py-1.5 text-sm border border-slate-300 rounded hover:bg-slate-50 transition-colors">
                        Refresh
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm" style={{ width: "max-content", minWidth: "100%" }}>
                        <thead>
                            <tr className="border-b border-slate-200">
                                {columns.map((col) => (
                                    <th
                                        key={col}
                                        className={`px-4 py-3 font-semibold text-slate-900 whitespace-nowrap ${col === "Seats" ? "text-center" : "text-left"}`}
                                    >
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colSpan={columns.length}>
                                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                        <AntEmptyInbox />
                                        <p className="text-sm mt-2">No data</p>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
