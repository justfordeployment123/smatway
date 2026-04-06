import { CarIcon, MapPinIcon, UsersIcon, CreditCardIcon } from "@/app/dashboard/_Components/Icons";

export default function TransporterDashboardPage() {
  return (
    <div className="p-4 md:p-0">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-sm md:text-base text-slate-600">Track transport activity and quick actions</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-linear-to-br from-emerald-50 to-teal-50 rounded-lg border border-[#f0f0f0] p-6">
          <div className="text-sm text-slate-600 mb-3">Total Vehicles</div>
          <div className="flex items-center gap-2" style={{ color: "rgb(5,150,105)" }}>
            <CarIcon className="w-5 h-5" />
            <span className="text-3xl font-semibold">0</span>
          </div>
        </div>

        <div className="bg-linear-to-br from-blue-50 to-cyan-50 rounded-lg border border-[#f0f0f0] p-6">
          <div className="text-sm text-slate-600 mb-3">Active Routes</div>
          <div className="flex items-center gap-2" style={{ color: "rgb(37,99,235)" }}>
            <MapPinIcon className="w-5 h-5" />
            <span className="text-3xl font-semibold">0</span>
          </div>
        </div>

        <div className="bg-linear-to-br from-purple-50 to-pink-50 rounded-lg border border-[#f0f0f0] p-6">
          <div className="text-sm text-slate-600 mb-3">Total Bookings</div>
          <div className="flex items-center gap-2" style={{ color: "rgb(147,51,234)" }}>
            <UsersIcon className="w-5 h-5" />
            <span className="text-3xl font-semibold">0</span>
          </div>
        </div>

        <div className="bg-linear-to-br from-amber-50 to-orange-50 rounded-lg border border-[#f0f0f0] p-6">
          <div className="text-sm text-slate-600 mb-3">Total Revenue (All Currencies)</div>
          <div className="flex items-center gap-2" style={{ color: "rgb(217,119,6)" }}>
            <CreditCardIcon className="w-5 h-5" />
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
