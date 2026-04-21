'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiPost } from '@/lib/api';

function LockIcon() {
  return (
    <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function EyeIcon({ show }: { show: boolean }) {
  return show ? (
    <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><path d="M1 1l22 22" />
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

function ArrowLeftIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
    </svg>
  );
}

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Token is missing.');
    }
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!token) {
      setError('Invalid reset link');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await apiPost('/auth/reset-password', {
        token,
        password,
        confirmPassword,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push('/signin');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="w-full animate-fade-in-up">
        <Link href="/signin" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 mb-10 transition-colors">
          <ArrowLeftIcon /><span>Back to Sign In</span>
        </Link>

        <div className="mb-8">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-5">
            <KeyIcon />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 mb-2">Invalid Reset Link</h1>
          <p className="text-slate-500">The reset link is missing or invalid. Please request a new one.</p>
        </div>

        <Link
          href="/forgot-password"
          className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-semibold py-3 px-4 rounded-xl active:scale-[0.98] transition-all duration-150 text-center block text-sm"
        >
          Request New Reset Link
        </Link>
      </div>
    );
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
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 mb-2">Create new password</h1>
        <p className="text-slate-500">Enter a new password for your account</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success ? (
        <div className="text-center space-y-4">
          <div className="p-3 bg-green-50 border border-green-300 text-green-700 rounded-lg text-sm">
            Password reset successfully! Redirecting to sign in...
          </div>
        </div>
      ) : (
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="animate-fade-in-up [animation-delay:100ms]">
            <label htmlFor="password" className="text-sm font-medium text-zinc-900 mb-1.5 block">New Password</label>
            <div className="relative flex items-center">
              <span className="absolute left-3 pointer-events-none">
                <LockIcon />
              </span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                required
                minLength={8}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pl-10 pr-10 text-sm text-zinc-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 pointer-events-auto"
              >
                <EyeIcon show={showPassword} />
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1">At least 8 characters</p>
          </div>

          <div className="animate-fade-in-up [animation-delay:150ms]">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-zinc-900 mb-1.5 block">Confirm Password</label>
            <div className="relative flex items-center">
              <span className="absolute left-3 pointer-events-none">
                <LockIcon />
              </span>
              <input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                required
                minLength={8}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pl-10 pr-10 text-sm text-zinc-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 pointer-events-auto"
              >
                <EyeIcon show={showConfirm} />
              </button>
            </div>
          </div>

          <div className="animate-fade-in-up [animation-delay:200ms] pt-1">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-semibold py-3 px-4 rounded-xl active:scale-[0.98] transition-all duration-150 text-center text-sm disabled:opacity-50"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
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
