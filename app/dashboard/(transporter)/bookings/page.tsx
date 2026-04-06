"use client";

import { useState } from "react";
import DashboardTable, { TableColumn } from "@/app/dashboard/_Components/DashboardTable";
import { ClockIcon, CheckCircleIcon, MailIcon } from "@/app/dashboard/_Components/Icons";

const columns: TableColumn[] = [
    "Bookingref", "Traveler", "Route", "Departure",
    { label: "Seats", align: "center" },
    "Amount", "Status", "Actions",
];

export default function TransporterBookingsPage() {
    const [autoConfirm, setAutoConfirm] = useState(true);

    return (
        <div className="p-4 md:p-0 space-y-6">
            <div className="bg-white rounded-lg border border-[#f0f0f0]">
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
                                className={`relative inline-flex h-6 w-[44px] items-center rounded-full transition-colors text-white text-xs font-medium ${autoConfirm ? "bg-emerald-500" : "bg-slate-200"}`}
                            >
                                <span className={`absolute transition-all ${autoConfirm ? "left-1.5" : "right-1"} text-[10px] leading-none`}>
                                    {autoConfirm ? "ON" : "OFF"}
                                </span>
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${autoConfirm ? "translate-x-[24px]" : "translate-x-1"}`}
                                />
                            </button>
                        </div>
                    </div>

                    <div className="border-t border-[#f0f0f0] my-5" />

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                            <div className="flex items-center space-x-3">
                                <ClockIcon className="w-8 h-8 text-amber-600" />
                                <div>
                                    <div className="text-2xl font-bold text-slate-900">0</div>
                                    <div className="text-sm text-slate-600">Pending Confirmation</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                            <div className="flex items-center space-x-3">
                                <CheckCircleIcon className="w-8 h-8 text-emerald-600" />
                                <div>
                                    <div className="text-2xl font-bold text-slate-900">0</div>
                                    <div className="text-sm text-slate-600">Confirmed</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <div className="flex items-center space-x-3">
                                <MailIcon className="w-8 h-8 text-blue-600" />
                                <div>
                                    <div className="text-2xl font-bold text-slate-900">0</div>
                                    <div className="text-sm text-slate-600">Total Bookings</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <DashboardTable
                columns={columns}
                title="All Bookings"
                action={
                    <button type="button" className="px-3 py-1.5 text-sm border border-slate-300 rounded hover:bg-slate-50 transition-colors">
                        Refresh
                    </button>
                }
            />
        </div>
    );
}
