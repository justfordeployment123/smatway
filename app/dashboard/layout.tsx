"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MapPinIcon, DashboardIcon, CarIcon, MapPinIcon as RouteIcon,
  BookOpenIcon, MegaphoneIcon, UserIcon, SettingsIcon, BellIcon, LogOutIcon,
} from "@/app/dashboard/_Components/Icons";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

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
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-[250px] bg-white border-r border-sidebar-border z-30">
      {/* Logo */}
      <div className="h-16 flex items-center px-5">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="bg-linear-to-br from-emerald-500 to-teal-600 p-2 rounded-xl shadow-sm">
            <MapPinIcon className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-zinc-900 tracking-tight">SmatWay</span>
        </Link>
      </div>

      <Separator className="mx-4" />

      {/* Role switcher */}
      <div className="mx-4 mt-4 mb-2">
        <Tabs value={role} onValueChange={(v) => onRoleSwitch(v as "traveler" | "transporter")}>
          <TabsList className="w-full bg-slate-100 rounded-xl p-0.5 h-auto">
            <TabsTrigger
              value="traveler"
              className="flex-1 rounded-[9px] py-1.5 text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm data-[state=active]:font-semibold data-[state=inactive]:text-slate-500"
            >
              Traveler
            </TabsTrigger>
            <TabsTrigger
              value="transporter"
              className="flex-1 rounded-[9px] py-1.5 text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm data-[state=active]:font-semibold data-[state=inactive]:text-slate-500"
            >
              Transporter
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Section label */}
      <p className="px-5 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
        Navigation
      </p>

      {/* Nav */}
      <ul className="flex-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname === item.key;
          return (
            <li key={item.key}>
              <Link
                href={item.key}
                className={`flex items-center gap-3 py-2.5 pr-4 text-sm font-medium transition-all duration-150 ${active
                  ? "border-l-2 border-emerald-600 pl-[22px] bg-emerald-50/70 text-emerald-700"
                  : "border-l-2 border-transparent pl-[22px] text-slate-500 hover:bg-slate-50/80 hover:text-zinc-900"
                  }`}
              >
                <span className={active ? "text-emerald-600" : "text-slate-400"}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Fade gradient */}
      <div className="h-10 bg-linear-to-t from-white to-transparent pointer-events-none" />

      {/* Logout */}
      <div className="px-4 pb-4 pt-1 shrink-0">
        <Link
          href="/"
          className="flex items-center gap-2 w-full px-3 py-2.5 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors duration-150"
        >
          <LogOutIcon className="w-4 h-4" />
          Sign out
        </Link>
      </div>
    </aside>
  );
}

// ─── Topbar ───────────────────────────────────────────────────────────────────

function Topbar({ title, role }: { title: string; role: "traveler" | "transporter" }) {
  const initial = "A";
  const name = "Aryan Malik";

  return (
    <header className="bg-white border-b border-sidebar-border px-4 lg:px-8 flex items-center justify-between sticky top-0 z-40 h-16">
      <h2 className="text-base font-semibold text-zinc-900 tracking-tight hidden sm:block">{title}</h2>

      <div className="flex items-center gap-2">
        {/* Bell */}
        <Tooltip>
          <TooltipTrigger className="relative p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
            <BellIcon className="w-5 h-5 text-slate-500" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Notifications</p>
          </TooltipContent>
        </Tooltip>

        {/* Avatar + User info */}
        <div className="flex items-center gap-2.5 cursor-pointer hover:bg-slate-50 pl-1 pr-3 py-1.5 rounded-xl transition-colors">
          <Avatar className="h-8 w-8 rounded-xl">
            <AvatarFallback className="rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 text-white text-xs font-bold">
              {initial}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block text-left">
            <p className="text-sm font-semibold text-zinc-900 leading-none mb-0.5">{name}</p>
            <p className="text-xs text-slate-400 capitalize">{role}</p>
          </div>
          <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </div>
    </header>
  );
}

function MobileNav({
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
    <div className="lg:hidden sticky top-16 z-30 border-b border-sidebar-border bg-white/95 backdrop-blur">
      <div className="px-4 py-3 space-y-3">
        <Tabs value={role} onValueChange={(v) => onRoleSwitch(v as "traveler" | "transporter")}>
          <TabsList className="w-full bg-slate-100 rounded-xl p-0.5 h-auto">
            <TabsTrigger
              value="traveler"
              className="flex-1 rounded-[9px] py-2 text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm data-[state=active]:font-semibold data-[state=inactive]:text-slate-500"
            >
              Traveler
            </TabsTrigger>
            <TabsTrigger
              value="transporter"
              className="flex-1 rounded-[9px] py-2 text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm data-[state=active]:font-semibold data-[state=inactive]:text-slate-500"
            >
              Transporter
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {navItems.map((item) => {
            const active = pathname === item.key;

            return (
              <Link
                key={item.key}
                href={item.key}
                className={`shrink-0 whitespace-nowrap rounded-full px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${active
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-zinc-900"
                  }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [preferredRole, setPreferredRole] = useState<"traveler" | "transporter">(() => {
    if (typeof window === "undefined") return "traveler";
    const saved = localStorage.getItem("smatway-dev-role") as "traveler" | "transporter" | null;
    return saved ?? "traveler";
  });
  const role = roleFromPath(pathname, preferredRole);

  useEffect(() => {
    localStorage.setItem("smatway-dev-role", preferredRole);
  }, [preferredRole]);

  function handleRoleSwitch(r: "traveler" | "transporter") {
    setPreferredRole(r);
    router.push(r === "transporter" ? "/dashboard/overview" : "/dashboard");
  }

  const titles = role === "transporter" ? transporterTitles : travelerTitles;
  const title = titles[pathname] ?? "Dashboard";

  return (
    <TooltipProvider>
      <div className="min-h-[100dvh] flex bg-slate-50/50">
        <Sidebar pathname={pathname} role={role} onRoleSwitch={handleRoleSwitch} />
        <div className="flex-1 lg:ml-[250px] flex flex-col min-h-[100dvh]">
          <Topbar title={title} role={role} />
          <MobileNav pathname={pathname} role={role} onRoleSwitch={handleRoleSwitch} />
          <main className="flex-1 p-4 lg:p-8 pb-24 lg:pb-8">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
