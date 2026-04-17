"use client";

function ArrowLeftIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
    </svg>
  );
}

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

function KeyIcon() {
  return (
    <svg className="w-10 h-10 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  );
}

export default function ForgotPasswordPage() {
  return (
    <div className="w-full animate-fade-in-up">

      <a href="/signin" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 mb-10 transition-colors">
        <ArrowLeftIcon /><span>Back to Sign In</span>
      </a>

      <div className="mb-8">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-5 animate-scale-in">
          <KeyIcon />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 mb-2">Reset your password</h1>
        <p className="text-slate-500">Enter your email and we&apos;ll send you a reset link</p>
      </div>

      <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
        <div className="animate-fade-in-up [animation-delay:100ms]">
          <label htmlFor="email" className="text-sm font-medium text-zinc-900 mb-1.5 block">Email Address</label>
          <div className="relative flex items-center">
            <span className="absolute left-3 pointer-events-none">
              <MailIcon />
            </span>
            <input
              id="email"
              type="text"
              placeholder="you@example.com"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pl-10 text-sm text-zinc-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        <div className="animate-fade-in-up [animation-delay:200ms] pt-1">
          <a
            href="/signin"
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-semibold py-3 px-4 rounded-xl active:scale-[0.98] transition-all duration-150 text-center flex items-center justify-center gap-2 text-sm"
          >
            <SendIcon />
            Send Reset Link
          </a>
        </div>
      </form>

      <div className="border-t border-slate-100 my-6" />

      <div className="text-center animate-fade-in-up [animation-delay:300ms]">
        <p className="text-sm text-slate-500">
          Remember your password?{" "}
          <a href="/signin" className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors">Sign In</a>
        </p>
      </div>
    </div>
  );
}
