"use client";

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

export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-md">

      <a href="/signin" className="flex items-center space-x-2 text-slate-600 hover:text-emerald-600 mb-8 transition-colors">
        <ArrowLeftIcon /><span>Back to Sign In</span>
      </a>

      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Forgot Your Password?</h1>
        <p className="text-slate-600">Enter your email and we&apos;ll send you a reset link</p>
      </div>

      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label htmlFor="email" className="block text-slate-700 font-medium mb-2">Email Address</label>
          <div className="flex items-center border border-slate-300 rounded-lg px-3 py-2.5 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all bg-white">
            <MailIcon />
            <input id="email" type="text" placeholder="you@example.com" className="flex-1 ml-2 outline-none text-slate-900 placeholder-slate-400 text-base bg-transparent" />
          </div>
        </div>

        <a href="/signin" className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-base font-semibold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-4">
          <SendIcon />
          Send Reset Link
        </a>
      </form>

      <div className="mt-6 text-center">
        <span className="text-slate-600">Remember your password? </span>
        <a href="/signin" className="text-emerald-600 hover:text-emerald-700 font-semibold">Sign In</a>
      </div>

    </div>
  );
}
