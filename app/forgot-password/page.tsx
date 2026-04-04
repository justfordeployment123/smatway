"use client";

// ─── Icons ────────────────────────────────────────────────────────────────────

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

function SendIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
    </svg>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex">

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-200 rounded-full filter blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-200 rounded-full filter blur-3xl opacity-30 translate-x-1/2 translate-y-1/2" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="relative w-full max-w-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://purepng.com/public/uploads/large/purepng.com-hyundai-ioniq-white-carcarvehicletransporthyundai-961524653528qvh7u.png"
              alt="SmatWay Vehicle"
              className="w-full h-auto object-contain drop-shadow-2xl"
            />
            <div className="absolute top-8 right-8 bg-white rounded-2xl shadow-lg p-4 flex items-center space-x-3">
              <div className="bg-emerald-500 rounded-full p-2"><CheckIcon /></div>
              <div>
                <div className="font-semibold text-slate-900">Verified</div>
                <div className="text-sm text-slate-600">Safe &amp; Trusted</div>
              </div>
            </div>
            <div className="absolute bottom-8 left-8 bg-white rounded-2xl shadow-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                <div className="flex -space-x-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 border-2 border-white" />
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 border-2 border-white" />
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 border-2 border-white" />
                </div>
              </div>
              <div className="font-semibold text-slate-900">50K+</div>
              <div className="text-sm text-slate-600">Happy Users</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-white">
        <div className="w-full max-w-md">

          <a href="/signin" className="flex items-center space-x-2 text-slate-600 hover:text-emerald-600 mb-8 transition-colors">
            <ArrowLeftIcon /><span>Back to Sign In</span>
          </a>

          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Forgot Your Password?</h1>
            <p className="text-slate-600">Enter your email and we&apos;ll send you a reset link</p>
          </div>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>

            {/* Email Address */}
            <div>
              <label htmlFor="email" className="block text-slate-700 font-medium mb-2">Email Address</label>
              <div className="flex items-center border border-slate-300 rounded-lg px-3 py-2.5 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all bg-white">
                <MailIcon />
                <input
                  id="email"
                  type="text"
                  placeholder="you@example.com"
                  className="flex-1 ml-2 outline-none text-slate-900 placeholder-slate-400 text-base bg-transparent"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-base font-semibold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-4"
            >
              <SendIcon />
              Send Reset Link
            </button>

          </form>

          <div className="mt-6 text-center">
            <span className="text-slate-600">Remember your password? </span>
            <a href="/signin" className="text-emerald-600 hover:text-emerald-700 font-semibold">Sign In</a>
          </div>

        </div>
      </div>

    </div>
  );
}
