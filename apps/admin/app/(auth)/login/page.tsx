"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminLogin } from "@/lib/api";
import { setAdminToken, setAdminProfile } from "@/lib/auth";

function ArrowLeftIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function LockIcon() {
  return (
    <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
function EyeOffIcon() {
  return (
    <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}
function EyeIcon() {
  return (
    <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await adminLogin(username.trim(), password);
      setAdminToken(result.accessToken);
      setAdminProfile(result.admin);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full animate-fade-in-up">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 mb-10 transition-colors">
        <ArrowLeftIcon /><span>Back to Home</span>
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 mb-2">Admin Access</h1>
        <p className="text-slate-500">Sign in with your admin username or email.</p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* suppressHydrationWarning: password-manager browser extensions (LastPass,
          1Password, etc.) inject wrapper divs before React hydrates and trip
          the hydration check. The mismatch is harmless — React reconciles on
          the client and the form works normally. */}
      <form className="space-y-5" onSubmit={handleSubmit} suppressHydrationWarning>
        <div className="animate-fade-in-up [animation-delay:100ms]">
          <label htmlFor="username" className="text-sm font-medium text-zinc-900 mb-1.5 block">Username or email</label>
          <div className="relative flex items-center">
            <span className="absolute left-3 pointer-events-none"><UserIcon /></span>
            <input
              id="username"
              type="text"
              autoComplete="username"
              placeholder="superadmin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pl-10 text-sm text-zinc-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        <div className="animate-fade-in-up [animation-delay:200ms]">
          <label htmlFor="password" className="text-sm font-medium text-zinc-900 mb-1.5 block">Password</label>
          <div className="relative flex items-center">
            <span className="absolute left-3 pointer-events-none"><LockIcon /></span>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pl-10 pr-11 text-sm text-zinc-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeIcon /> : <EyeOffIcon />}
            </button>
          </div>
        </div>

        <div className="animate-fade-in-up [animation-delay:300ms] pt-1">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-zinc-900 hover:bg-zinc-800 disabled:opacity-60 text-white font-semibold py-3 px-4 rounded-xl active:scale-[0.98] transition-all duration-150 text-center block text-sm"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>
      </form>

      <p className="text-center text-xs text-slate-400 mt-8 animate-fade-in-up [animation-delay:500ms]">
        SmatWay Admin Portal
      </p>
    </div>
  );
}
