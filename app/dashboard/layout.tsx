"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  MapPinIcon, DashboardIcon, CarIcon, MapPinIcon as RouteIcon,
  BookOpenIcon, MegaphoneIcon, UserIcon, SettingsIcon, BellIcon, LogOutIcon,
} from "@/app/dashboard/_Components/Icons";

// ─── Nav config ───────────────────────────────────────────────────────────────

const travelerNav = [
  { key: "/dashboard", label: "Search Rides", icon: <DashboardIcon /> },
  { key: "/dashboard/my-bookings", label: "My Bookings", icon: <BookOpenIcon /> },
  { key: "/dashboard/announcements", label: "Announcements", icon: <MegaphoneIcon /> },
  { key: "/dashboard/profile", label: "Profile", icon: <UserIcon /> },
  { key: "/dashboard/settings", label: "Settings", icon: <SettingsIcon /> },
];

const transporterNav = [
  { key: "/dashboard/overview", label: "Dashboard", icon: <DashboardIcon /> },
  { key: "/dashboard/vehicles", label: "My Transport", icon: <CarIcon /> },
  { key: "/dashboard/routes", label: "My Routes", icon: <RouteIcon /> },
  { key: "/dashboard/bookings", label: "Bookings", icon: <BookOpenIcon /> },
  { key: "/dashboard/t-announcements", label: "My Announcements", icon: <MegaphoneIcon /> },
  { key: "/dashboard/profile", label: "Profile", icon: <UserIcon /> },
  { key: "/dashboard/settings", label: "Settings", icon: <SettingsIcon /> },
];

const travelerTitles: Record<string, string> = {
  "/dashboard": "Search Rides",
  "/dashboard/my-bookings": "My Bookings",
  "/dashboard/announcements": "Announcements",
  "/dashboard/profile": "Profile",
  "/dashboard/settings": "Settings",
};

const transporterTitles: Record<string, string> = {
  "/dashboard/overview": "Dashboard",
  "/dashboard/vehicles": "My Transport",
  "/dashboard/routes": "My Routes",
  "/dashboard/bookings": "Bookings",
  "/dashboard/t-announcements": "My Announcements",
  "/dashboard/profile": "Profile",
  "/dashboard/settings": "Settings",
};

const transporterOnlyPaths = new Set([
  "/dashboard/overview",
  "/dashboard/vehicles",
  "/dashboard/routes",
  "/dashboard/bookings",
  "/dashboard/t-announcements",
]);

const travelerOnlyPaths = new Set([
  "/dashboard",
  "/dashboard/my-bookings",
  "/dashboard/announcements",
]);

function roleFromPath(pathname: string, fallback: "traveler" | "transporter") {
  if (transporterOnlyPaths.has(pathname)) return "transporter";
  if (travelerOnlyPaths.has(pathname)) return "traveler";
  return fallback;
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({
  pathname,
  role,
  onRoleSwitch,
}: {
  pathname: string;
  role: "traveler" | "transporter";
  onRoleSwitch: (r: "traveler" | "transporter") => void;
}) {
  const navItems = role === "transporter" ? transporterNav : travelerNav;

  return (
    <aside className="hidden lg:block fixed left-0 top-0 bottom-0 w-[250px] bg-white border-r border-slate-100 overflow-auto z-30">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="bg-linear-to-r from-emerald-500 to-teal-600 p-2 rounded-lg">
            <MapPinIcon className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            SmatWay
          </span>
        </div>
      </div>

      {/* Role switcher */}
      <div className="mx-4 mt-3 mb-1 flex items-center rounded-lg bg-slate-100 p-0.5 text-xs font-medium">
        <button
          onClick={() => onRoleSwitch("traveler")}
          className={`flex-1 rounded-md py-1.5 transition-all ${role === "traveler"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
            }`}
        >
          Traveler
        </button>
        <button
          onClick={() => onRoleSwitch("transporter")}
          className={`flex-1 rounded-md py-1.5 transition-all ${role === "transporter"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
            }`}
        >
          Transporter
        </button>
      </div>

      {/* Section label */}
      <p className="px-6 py-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
        Navigation
      </p>

      {/* Nav */}
      <ul>
        {navItems.map((item) => {
          const active = pathname === item.key;
          return (
            <li key={item.key}>
              <a
                href={item.key}
                className={`flex items-center gap-3 py-2.5 text-sm transition-colors ${
                  active
                    ? "border-l-2 border-emerald-600 bg-emerald-50/60 text-emerald-700 font-medium pl-[22px] pr-6"
                    : "border-l-2 border-transparent text-slate-600 hover:bg-slate-50/80 hover:text-slate-900 pl-6 pr-6"
                }`}
              >
                <span className={active ? "text-emerald-600" : "text-slate-500"}>
                  {item.icon}
                </span>
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>

      {/* Gradient fade above logout */}
      <div className="absolute bottom-14 left-0 right-0 bg-linear-to-t from-white to-transparent h-12 pointer-events-none" />

      {/* Logout */}
      <div className="absolute bottom-4 left-4 right-4">
        <a
          href="/"
          className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOutIcon className="w-4 h-4" />
          Logout
        </a>
      </div>
    </aside>
  );
}

// ─── Topbar ───────────────────────────────────────────────────────────────────

function Topbar({ title, role }: { title: string; role: "traveler" | "transporter" }) {
  const initial = "A";
  const name = "Aryan Malik";

  return (
    <header className="bg-white border-b border-slate-100 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-40 h-16">
      <div className="flex items-center space-x-4">
        <h2 className="text-lg font-semibold text-zinc-900 tracking-tight hidden sm:block">
          {title}
        </h2>
      </div>
      <div className="flex items-center space-x-4">
        <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
          <BellIcon className="w-5 h-5 text-slate-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full" />
        </button>
        <div className="flex items-center space-x-3 cursor-pointer hover:bg-slate-50 px-3 py-2 rounded-lg transition-colors">
          <div className="w-9 h-9 rounded-full bg-linear-to-r from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-semibold">
            {initial}
          </div>
          <div className="hidden md:flex items-center gap-1.5">
            <div className="text-left">
              <p className="text-sm font-semibold text-slate-900">{name}</p>
              <p className="text-xs text-slate-500 capitalize">{role}</p>
            </div>
            <svg
              className="w-4 h-4 text-slate-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [role, setRole] = useState<"traveler" | "transporter">("traveler");

  // Hydrate initial role and keep shared pages in sync with selected mode.
  useEffect(() => {
    const saved = localStorage.getItem("smatway-dev-role") as "traveler" | "transporter" | null;
    const baseRole = saved ?? "traveler";
    setRole(roleFromPath(pathname, baseRole));
  }, [pathname]);

  useEffect(() => {
    localStorage.setItem("smatway-dev-role", role);
  }, [role]);

  function handleRoleSwitch(r: "traveler" | "transporter") {
    setRole(r);
    router.push(r === "transporter" ? "/dashboard/overview" : "/dashboard");
  }

  const titles = role === "transporter" ? transporterTitles : travelerTitles;
  const title = titles[pathname] ?? "Dashboard";

  return (
    <div className="min-h-[100dvh] flex bg-slate-50/50">
      <Sidebar pathname={pathname} role={role} onRoleSwitch={handleRoleSwitch} />
      <div className="flex-1 lg:ml-[250px] flex flex-col min-h-[100dvh]">
        <Topbar title={title} role={role} />
        <main className="flex-1 m-4 lg:m-8 mb-24 lg:mb-8">
          {children}
        </main>
      </div>
    </div>
  );
}
