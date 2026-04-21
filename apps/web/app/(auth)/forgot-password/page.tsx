'use client';

import { useState } from 'react';
import Link from 'next/link';
import { apiPost } from '@/lib/api';

function MailIcon() {
  return (
    <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg className="w-10 h-10 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  );
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await apiPost('/auth/forgot-password', { email });
      setSuccess(true);
      setEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full animate-fade-in-up">
      <Link href="/signin" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 mb-10 transition-colors">
        <ArrowLeftIcon /><span>Back to Sign In</span>
      </Link>

      <div className="mb-8">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-5 animate-scale-in">
          <KeyIcon />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 mb-2">Reset your password</h1>
        <p className="text-slate-500">Enter your email and we&apos;ll send you a reset link</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success ? (
        <div className="text-center space-y-4">
          <div className="p-3 bg-green-50 border border-green-300 text-green-700 rounded-lg text-sm">
            Check your email for a password reset link. The link expires in 24 hours.
          </div>
          <Link href="/signin" className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
            Back to Sign In
          </Link>
        </div>
      ) : (
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="animate-fade-in-up [animation-delay:100ms]">
            <label htmlFor="email" className="text-sm font-medium text-zinc-900 mb-1.5 block">Email Address</label>
            <div className="relative flex items-center">
              <span className="absolute left-3 pointer-events-none">
                <MailIcon />
              </span>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pl-10 text-sm text-zinc-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          <div className="animate-fade-in-up [animation-delay:200ms] pt-1">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-semibold py-3 px-4 rounded-xl active:scale-[0.98] transition-all duration-150 text-center flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              <SendIcon />
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </div>
        </form>
      )}

      <div className="border-t border-slate-100 my-6" />

      <div className="text-center animate-fade-in-up [animation-delay:300ms]">
        <p className="text-sm text-slate-500">
          Remember your password?{" "}
          <Link href="/signin" className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
