import { CarIcon, MapPinIcon, UsersIcon, CreditCardIcon } from "@/app/dashboard/_Components/Icons";

function ArrowRightIcon() {
  return (
    <svg className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all duration-150" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  );
}

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
    iconBg: "bg-slate-100",
  },
  {
    label: "Total Revenue",
    value: "0.00",
    icon: <CreditCardIcon className="w-4 h-4 text-amber-600" />,
    iconBg: "bg-amber-50",
  },
];

const quickActions = [
  { href: "/dashboard/vehicles",        title: "Add New Vehicle",        description: "Register a vehicle to your fleet" },
  { href: "/dashboard/routes",          title: "Create Route",            description: "Schedule a new route for your vehicles" },
  { href: "/dashboard/bookings",        title: "View Bookings",           description: "Check recent customer bookings" },
  { href: "/dashboard/t-announcements", title: "Manage Announcements",    description: "Post updates for your passengers" },
];

export default function TransporterDashboardPage() {
  return (
    <div>
      {/* Page header */}
      <div className="mb-7">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900">Dashboard Overview</h1>
        <p className="text-sm text-slate-400 mt-0.5">Track transport activity and take quick actions</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className="animate-fade-in-up bg-white rounded-xl border border-slate-200 shadow-sm p-5"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{stat.label}</p>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.iconBg}`}>
                {stat.icon}
              </div>
            </div>
            <p className="text-2xl font-semibold text-zinc-900 font-mono">{stat.value}</p>
            <p className="text-xs text-slate-400 mt-1">No data yet</p>
          </div>
        ))}
      </div>

      {/* Empty state notice */}
      <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl px-5 py-4 mb-6 flex items-start gap-3">
        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 8v4m0 4h.01" />
          </svg>
        </div>
        <p className="text-sm text-emerald-800">
          Your dashboard is empty —{" "}
          <a href="/dashboard/vehicles" className="font-semibold underline underline-offset-2">
            add your first vehicle
          </a>{" "}
          to get started.
        </p>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-zinc-900 tracking-tight">Quick Actions</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {quickActions.map((action) => (
            <a
              key={action.href}
              href={action.href}
              className="flex items-center justify-between px-5 py-4 hover:bg-slate-50/80 transition-colors group"
            >
              <div>
                <p className="text-sm font-medium text-zinc-900 mb-0.5">{action.title}</p>
                <p className="text-xs text-slate-400">{action.description}</p>
              </div>
              <ArrowRightIcon />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
