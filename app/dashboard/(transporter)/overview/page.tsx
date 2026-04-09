import { CarIcon, MapPinIcon, UsersIcon, CreditCardIcon } from "@/app/dashboard/_Components/Icons";

const stats = [
  {
    label: "Total Vehicles",
    value: "0",
    icon: <CarIcon className="w-4 h-4 text-emerald-600" />,
    iconBg: "bg-emerald-50",
  },
  {
    label: "Active Routes",
    value: "0",
    icon: <MapPinIcon className="w-4 h-4 text-blue-600" />,
    iconBg: "bg-blue-50",
  },
  {
    label: "Total Bookings",
    value: "0",
    icon: <UsersIcon className="w-4 h-4 text-slate-600" />,
    iconBg: "bg-slate-50",
  },
  {
    label: "Revenue",
    value: "0.00",
    icon: <CreditCardIcon className="w-4 h-4 text-amber-600" />,
    iconBg: "bg-amber-50",
  },
];

const quickActions = [
  {
    href: "/dashboard/vehicles",
    title: "Add New Vehicle",
    description: "Register a new vehicle to your fleet",
  },
  {
    href: "/dashboard/routes",
    title: "Create Route",
    description: "Schedule a new route for your vehicles",
  },
  {
    href: "/dashboard/bookings",
    title: "View Bookings",
    description: "Check recent customer bookings",
  },
  {
    href: "/dashboard/t-announcements",
    title: "Manage Announcements",
    description: "Create and manage your announcements",
  },
];

export default function TransporterDashboardPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
          Dashboard Overview
        </h1>
        <p className="text-sm text-slate-400">
          Track transport activity and quick actions
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-slate-100 p-5"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-400 uppercase tracking-wide">
                {stat.label}
              </span>
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.iconBg}`}
              >
                {stat.icon}
              </div>
            </div>
            <div className="text-2xl font-mono font-semibold text-zinc-900 mt-3">
              {stat.value}
            </div>
            <p className="text-xs text-slate-400 mt-1">No data yet</p>
          </div>
        ))}
      </div>

      {/* Empty state banner */}
      <div className="mt-4 rounded-xl border border-slate-100 bg-white px-5 py-3 flex items-center gap-3">
        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
        <p className="text-sm text-slate-500">
          Your dashboard is empty — add your first vehicle to get started.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="mt-6">
        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-zinc-900 text-sm">
              Quick Actions
            </h2>
          </div>
          <div className="divide-y divide-slate-100">
            {quickActions.map((action) => (
              <a
                key={action.href}
                href={action.href}
                className="flex items-center justify-between px-5 py-4 hover:bg-slate-50/80 transition-colors group"
              >
                <div>
                  <h4 className="text-sm font-medium text-zinc-900">
                    {action.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {action.description}
                  </p>
                </div>
                <span className="text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all text-sm">
                  &rarr;
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
