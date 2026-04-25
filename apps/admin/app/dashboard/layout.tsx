"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  DashboardIcon, UsersIcon, MapPinIcon, CarIcon, BookOpenIcon, CashIcon,
  StarIcon, MessageSquareIcon, MegaphoneIcon, ShieldUserIcon, ListIcon,
  LogOutIcon, MenuIcon, CloseIcon,
} from "@/app/_Components/Icons";
import { adminMe } from "@/lib/api";
import {
  AdminProfile, adminCan, clearAdminAuth, getAdminProfile, setAdminProfile,
} from "@/lib/auth";
import { ADMIN_PERMISSIONS } from "@/lib/permissions";

// Sidebar nav — every entry gates on a permission. Hidden when the admin
// doesn't hold it (SUPER_ADMIN sees everything).
type NavEntry = {
  key: string;
  label: string;
  icon: (props: { className?: string }) => React.ReactElement;
  permission: string;
};

const NAV: NavEntry[] = [
  { key: "/dashboard", label: "Overview", icon: DashboardIcon, permission: ADMIN_PERMISSIONS.USERS_READ },
  { key: "/dashboard/users", label: "Users", icon: UsersIcon, permission: ADMIN_PERMISSIONS.USERS_READ },
  { key: "/dashboard/routes", label: "Routes", icon: MapPinIcon, permission: ADMIN_PERMISSIONS.ROUTES_READ },
  { key: "/dashboard/vehicles", label: "Vehicles", icon: CarIcon, permission: ADMIN_PERMISSIONS.VEHICLES_READ },
  { key: "/dashboard/bookings", label: "Bookings", icon: BookOpenIcon, permission: ADMIN_PERMISSIONS.BOOKINGS_READ },
  { key: "/dashboard/finance", label: "Finance", icon: CashIcon, permission: ADMIN_PERMISSIONS.FINANCE_READ },
  { key: "/dashboard/feedback", label: "Site feedback", icon: MessageSquareIcon, permission: ADMIN_PERMISSIONS.FEEDBACK_READ },
  { key: "/dashboard/reviews", label: "Trip reviews", icon: StarIcon, permission: ADMIN_PERMISSIONS.REVIEWS_READ },
  { key: "/dashboard/announcements", label: "Announcements", icon: MegaphoneIcon, permission: ADMIN_PERMISSIONS.ANNOUNCEMENTS_READ },
  { key: "/dashboard/admins", label: "Admins", icon: ShieldUserIcon, permission: ADMIN_PERMISSIONS.ADMINS_READ },
  { key: "/dashboard/audit", label: "Audit log", icon: ListIcon, permission: ADMIN_PERMISSIONS.AUDIT_READ },
];

const TITLES: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/users": "Users",
  "/dashboard/routes": "Routes",
  "/dashboard/vehicles": "Vehicles",
  "/dashboard/bookings": "Bookings",
  "/dashboard/finance": "Finance",
  "/dashboard/feedback": "Site feedback",
  "/dashboard/reviews": "Trip reviews",
  "/dashboard/announcements": "Announcements",
  "/dashboard/admins": "Admins",
  "/dashboard/audit": "Audit log",
};

function isActivePath(pathname: string, key: string) {
  if (pathname === key) return true;
  if (key !== "/dashboard" && pathname.startsWith(key + "/")) return true;
  return false;
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Hydrate from localStorage immediately so the first paint isn't blocked
  // on the network. Re-fetch via /admin/auth/me to refresh perms (the user
  // could have been re-roled while a stale token sat in storage).
  useEffect(() => {
    setProfile(getAdminProfile());
    adminMe()
      .then((p) => {
        setProfile(p);
        setAdminProfile(p);
      })
      .catch(() => { /* middleware handles redirect on 401 */ });
  }, []);

  function logout() {
    clearAdminAuth();
    router.push("/login");
  }

  const visibleNav = NAV.filter((n) => adminCan(profile, n.permission));
  const title = TITLES[pathname] ?? "Admin";

  const sidebar = (
    <>
      <div className="h-16 flex items-center px-6">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 p-2 rounded-xl shadow-sm ring-1 ring-emerald-600/20">
            <ShieldUserIcon className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-[15px] font-semibold text-zinc-950 tracking-tight">SmatWay</span>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide -mt-0.5">Admin Console</p>
          </div>
        </Link>
      </div>

      <div className="px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      </div>

      <p className="px-6 pt-5 pb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
        Menu
      </p>

      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        <ul className="space-y-0.5">
          {visibleNav.map((item) => {
            const active = isActivePath(pathname, item.key);
            const Icon = item.icon;
            return (
              <li key={item.key}>
                <Link
                  href={item.key}
                  onClick={() => setDrawerOpen(false)}
                  className={`relative flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium rounded-xl transition-colors ${
                    active
                      ? "bg-zinc-950 text-white"
                      : "text-slate-600 hover:text-zinc-950 hover:bg-slate-100/60"
                  }`}
                >
                  <Icon className={`w-[18px] h-[18px] ${active ? "text-white" : "text-slate-400"}`} />
                  {item.label}
                  {active && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_0_3px_rgba(52,211,153,0.2)]" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="px-3 pb-4 shrink-0 border-t border-slate-100 pt-3 mt-2">
        {profile && (
          <div className="px-3 pb-3">
            <div className="text-[13px] font-semibold text-zinc-950 truncate">{profile.username}</div>
            <div className="text-[11px] text-slate-500 truncate">
              {profile.role === "SUPER_ADMIN" ? "Super admin" : profile.role === "MODERATOR" ? "Moderator" : "Admin"}
              {profile.isEnvBootstrap && " · env bootstrap"}
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className="w-full inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-[13px] font-medium text-slate-600 hover:text-red-700 hover:bg-red-50 transition-colors"
        >
          <LogOutIcon className="w-[18px] h-[18px]" />
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-[100dvh] bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-200/70 z-30">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 bg-zinc-900/50 z-40 lg:hidden" onClick={() => setDrawerOpen(false)} />
          <aside className="fixed top-0 bottom-0 left-0 w-72 bg-white z-50 lg:hidden flex flex-col animate-fade-in-up">
            <div className="flex items-center justify-end p-3">
              <button onClick={() => setDrawerOpen(false)} className="p-2 text-slate-500 hover:text-zinc-900">
                <CloseIcon />
              </button>
            </div>
            {sidebar}
          </aside>
        </>
      )}

      <div className="lg:ml-64">
        {/* Topbar */}
        <header className="sticky top-0 z-20 h-16 bg-white/85 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-zinc-900"
            >
              <MenuIcon />
            </button>
            <h1 className="text-base font-semibold text-zinc-950 tracking-tight">{title}</h1>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            Live
          </div>
        </header>

        <main className="px-4 sm:px-6 lg:px-10 py-6 sm:py-10 max-w-[1600px]">{children}</main>
      </div>
    </div>
  );
}
