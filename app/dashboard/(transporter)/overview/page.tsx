export default function TransporterDashboardPage() {
  return (
    <div className="p-4 md:p-0">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-sm md:text-base text-slate-600">Track transport activity and quick actions</p>
      </div>

      {/* Stat Cards — 4 cols on lg, 2 on sm */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg border border-[#f0f0f0] p-6">
          <div className="text-sm text-slate-600 mb-3">Total Vehicles</div>
          <div className="flex items-center gap-2" style={{ color: "rgb(5, 150, 105)" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
              <circle cx="7" cy="17" r="2" /><path d="M9 17h6" /><circle cx="17" cy="17" r="2" />
            </svg>
            <span className="text-3xl font-semibold">0</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-[#f0f0f0] p-6">
          <div className="text-sm text-slate-600 mb-3">Active Routes</div>
          <div className="flex items-center gap-2" style={{ color: "rgb(37, 99, 235)" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
            </svg>
            <span className="text-3xl font-semibold">0</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-[#f0f0f0] p-6">
          <div className="text-sm text-slate-600 mb-3">Total Bookings</div>
          <div className="flex items-center gap-2" style={{ color: "rgb(147, 51, 234)" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span className="text-3xl font-semibold">0</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-[#f0f0f0] p-6">
          <div className="text-sm text-slate-600 mb-3">Total Revenue (All Currencies)</div>
          <div className="flex items-center gap-2" style={{ color: "rgb(217, 119, 6)" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" />
            </svg>
            <span className="text-3xl font-semibold">0<span className="text-xl">.00</span></span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6">
        <div className="bg-white rounded-lg border border-[#f0f0f0]">
          <div className="px-6 py-4 border-b border-[#f0f0f0] font-semibold text-slate-900 text-base">
            Quick Actions
          </div>
          <div className="p-6 space-y-3">
            <a href="/dashboard/vehicles" className="block p-4 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors">
              <h4 className="font-semibold text-slate-900 mb-1">Add New Vehicle</h4>
              <p className="text-sm text-slate-600">Register a new vehicle to your fleet</p>
            </a>
            <a href="/dashboard/routes" className="block p-4 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors">
              <h4 className="font-semibold text-slate-900 mb-1">Create Route</h4>
              <p className="text-sm text-slate-600">Schedule a new route for your vehicles</p>
            </a>
            <a href="/dashboard/bookings" className="block p-4 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors">
              <h4 className="font-semibold text-slate-900 mb-1">View Bookings</h4>
              <p className="text-sm text-slate-600">Check recent customer bookings</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
