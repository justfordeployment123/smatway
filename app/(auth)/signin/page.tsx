"use client";

import { useState } from "react";

function ArrowLeftIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
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

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full max-w-md">

      <a href="/" className="flex items-center space-x-2 text-slate-600 hover:text-emerald-600 mb-8 transition-colors">
        <ArrowLeftIcon /><span>Back to Home</span>
      </a>

      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Welcome Back!</h1>
        <p className="text-slate-600">Sign in to your Smatway account</p>
      </div>

      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label htmlFor="email" className="block text-slate-700 font-medium mb-2">Email</label>
          <div className="flex items-center border border-slate-300 rounded-lg px-3 py-2.5 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all bg-white">
            <MailIcon />
            <input id="email" type="text" placeholder="you@example.com" className="flex-1 ml-2 outline-none text-slate-900 placeholder-slate-400 text-base bg-transparent" />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-slate-700 font-medium mb-2">Password</label>
          <div className="flex items-center border border-slate-300 rounded-lg px-3 py-2.5 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all bg-white">
            <LockIcon />
            <input id="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" className="flex-1 ml-2 outline-none text-slate-900 placeholder-slate-400 text-base bg-transparent" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="ml-2 focus:outline-none">
              {showPassword ? <EyeIcon /> : <EyeOffIcon />}
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <a href="/forgot-password" className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">Forgot password?</a>
        </div>

        <a href="/dashboard" className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-base font-semibold rounded-lg shadow-md hover:shadow-lg transition-all inline-flex items-center justify-center">
          Sign In
        </a>
      </form>

      <div className="mt-6 text-center">
        <span className="text-slate-600">Don&apos;t have an account? </span>
        <a href="/signup" className="text-emerald-600 hover:text-emerald-700 font-semibold">Sign Up</a>
      </div>

    </div>
  );
}
