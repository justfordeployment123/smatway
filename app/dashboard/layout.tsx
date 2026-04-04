"use client";

import { usePathname } from "next/navigation";

// ─── Icons ────────────────────────────────────────────────────────────────────

function MapPinIcon() {
  return (
    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function DashboardIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  );
}

function BookOpenIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

function MegaphoneIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 11 18-5v12L3 14v-3z" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

function LogOutIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  );
}

// ─── Nav items ────────────────────────────────────────────────────────────────

const navItems = [
  { key: "/dashboard", label: "Search Rides", icon: <DashboardIcon /> },
  { key: "/dashboard/my-bookings", label: "My Bookings", icon: <BookOpenIcon /> },
  { key: "/dashboard/announcements", label: "Announcements", icon: <MegaphoneIcon /> },
  { key: "/dashboard/profile", label: "Profile", icon: <UserIcon /> },
  { key: "/dashboard/settings", label: "Settings", icon: <SettingsIcon /> },
];

const pageTitles: Record<string, string> = {
  "/dashboard": "Search Rides",
  "/dashboard/my-bookings": "My Bookings",
  "/dashboard/announcements": "Announcements",
  "/dashboard/profile": "Profile",
  "/dashboard/settings": "Settings",
};

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ pathname }: { pathname: string }) {
  return (
    <aside className="hidden lg:block fixed left-0 top-0 bottom-0 w-[250px] bg-white border-r border-slate-200 overflow-auto z-30">
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-2 rounded-lg">
            <MapPinIcon />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            SmatWay
          </span>
        </div>
      </div>

      {/* Nav */}
      <ul className="mt-4">
        {navItems.map((item) => {
          const active = pathname === item.key;
          return (
            <li key={item.key}>
              <a
                href={item.key}
                className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${active
                    ? "bg-emerald-50 text-emerald-600"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
              >
                <span className={active ? "text-emerald-600" : "text-slate-500"}>{item.icon}</span>
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>

      {/* Logout */}
      <div className="absolute bottom-4 left-4 right-4">
        <a href="/" className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors">
          <LogOutIcon />
          Logout
        </a>
      </div>
    </aside>
  );
}

// ─── Topbar ───────────────────────────────────────────────────────────────────

function Topbar({ title }: { title: string }) {
  return (
    <header className="bg-white border-b border-slate-200 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-40 h-16">
      <div className="flex items-center space-x-4">
        <h2 className="text-xl font-semibold text-slate-900 hidden sm:block">{title}</h2>
      </div>
      <div className="flex items-center space-x-4">
        {/* Bell */}
        <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
          <BellIcon />
        </button>
        {/* User */}
        <div className="flex items-center space-x-3 cursor-pointer hover:bg-slate-50 px-3 py-2 rounded-lg transition-colors">
          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-semibold">
            M
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-semibold text-slate-900">M Hamza</p>
            <p className="text-xs text-slate-500 capitalize">traveler</p>
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? "Dashboard";

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar pathname={pathname} />
      <div className="flex-1 lg:ml-[250px] flex flex-col min-h-screen">
        <Topbar title={title} />
        <main className="flex-1 m-4 lg:m-8">
          {children}
        </main>
      </div>
    </div>
  );
}
