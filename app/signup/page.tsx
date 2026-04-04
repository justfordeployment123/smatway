"use client";

import { useState } from "react";

// ─── Icons ────────────────────────────────────────────────────────────────────

function ArrowLeftIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
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

function PhoneIcon() {
  return (
    <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
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

function CheckIcon() {
  return (
    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
    </svg>
  );
}

// ─── Reusable Input ───────────────────────────────────────────────────────────

function InputField({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center border border-slate-300 rounded-lg px-3 py-2.5 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all bg-white">
      {icon}
      {children}
    </div>
  );
}

// ─── Left Panel (shared) ──────────────────────────────────────────────────────

function LeftPanel() {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-200 rounded-full filter blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-200 rounded-full filter blur-3xl opacity-30 translate-x-1/2 translate-y-1/2" />
      <div className="absolute inset-0 flex items-center justify-center p-12">
        <div className="relative w-full max-w-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://purepng.com/public/uploads/large/purepng.com-hyundai-ioniq-white-carcarvehicletransporthyundai-961524653528qvh7u.png"
            alt="Smatway Vehicle"
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
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [accountType, setAccountType] = useState<"traveler" | "transporter">("traveler");

  return (
    <div className="min-h-screen flex">
      <LeftPanel />

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-white overflow-y-auto">
        <div className="w-full max-w-md">

          <a href="/" className="flex items-center space-x-2 text-slate-600 hover:text-emerald-600 mb-8 transition-colors">
            <ArrowLeftIcon /><span>Back to Home</span>
          </a>

          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Create Account</h1>
            <p className="text-slate-600">Join SmatWay and start your journey today</p>
          </div>

          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>

            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-slate-700 font-medium mb-2">Full Name</label>
              <InputField icon={<UserIcon />}>
                <input id="fullName" type="text" placeholder="John Doe" className="flex-1 ml-2 outline-none text-slate-900 placeholder-slate-400 text-base bg-transparent" />
              </InputField>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-slate-700 font-medium mb-2">Email</label>
              <InputField icon={<MailIcon />}>
                <input id="email" type="text" placeholder="john@example.com" className="flex-1 ml-2 outline-none text-slate-900 placeholder-slate-400 text-base bg-transparent" />
              </InputField>
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phoneNumber" className="block text-slate-700 font-medium mb-2">Phone Number</label>
              <InputField icon={<PhoneIcon />}>
                <input id="phoneNumber" type="text" placeholder="+254 712 345 678" className="flex-1 ml-2 outline-none text-slate-900 placeholder-slate-400 text-base bg-transparent" />
              </InputField>
            </div>

            {/* Country */}
            <div>
              <label htmlFor="country" className="block text-slate-700 font-medium mb-2">Country</label>
              <div className="flex items-center border border-slate-300 rounded-lg px-3 py-2.5 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all bg-white">
                <select id="country" className="flex-1 outline-none text-slate-400 text-base bg-transparent appearance-none cursor-pointer">
                  <option value="">Select your country</option>
                  <option value="KE">Kenya</option>
                  <option value="UG">Uganda</option>
                  <option value="TZ">Tanzania</option>
                  <option value="RW">Rwanda</option>
                  <option value="ET">Ethiopia</option>
                  <option value="NG">Nigeria</option>
                  <option value="GH">Ghana</option>
                  <option value="ZA">South Africa</option>
                  <option value="US">United States</option>
                  <option value="GB">United Kingdom</option>
                </select>
                <GlobeIcon />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-slate-700 font-medium mb-2">Password</label>
              <InputField icon={<LockIcon />}>
                <input id="password" type={showPassword ? "text" : "password"} placeholder="Create a password" className="flex-1 ml-2 outline-none text-slate-900 placeholder-slate-400 text-base bg-transparent" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="ml-2 focus:outline-none">
                  {showPassword ? <EyeIcon /> : <EyeOffIcon />}
                </button>
              </InputField>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-slate-700 font-medium mb-2">Confirm Password</label>
              <InputField icon={<LockIcon />}>
                <input id="confirmPassword" type={showConfirm ? "text" : "password"} placeholder="Confirm your password" className="flex-1 ml-2 outline-none text-slate-900 placeholder-slate-400 text-base bg-transparent" />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="ml-2 focus:outline-none">
                  {showConfirm ? <EyeIcon /> : <EyeOffIcon />}
                </button>
              </InputField>
            </div>

            {/* Account Type */}
            <div>
              <label className="block text-slate-700 font-medium mb-2">Account Type</label>
              <div className="flex w-full border border-slate-300 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setAccountType("traveler")}
                  className={`w-1/2 py-2.5 text-base font-medium transition-colors ${accountType === "traveler"
                      ? "bg-white text-emerald-600 border border-emerald-500"
                      : "bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                >
                  Traveler
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType("transporter")}
                  className={`w-1/2 py-2.5 text-base font-medium transition-colors border-l border-slate-300 ${accountType === "transporter"
                      ? "bg-white text-emerald-600 border border-emerald-500"
                      : "bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                >
                  Transporter
                </button>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2">
              <input type="checkbox" id="terms" className="mt-1 cursor-pointer" />
              <label htmlFor="terms" className="text-sm text-gray-700">
                I have read and agree to the{" "}
                <a
                  href="https://res.cloudinary.com/dge3lt4u6/image/upload/v1766858233/Terms_of_use_and_condition_of_service_y3gdjj.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  Terms of Use &amp; Conditions
                </a>
              </label>
            </div>

            {/* Submit */}
            <a
              href="/dashboard"
              className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-base font-semibold rounded-lg shadow-md hover:shadow-lg transition-all mt-4 inline-flex items-center justify-center"
            >
              Create Account
            </a>

          </form>

          <div className="mt-6 text-center">
            <span className="text-slate-600">Already have an account? </span>
            <a href="/signin" className="text-emerald-600 hover:text-emerald-700 font-semibold">Sign In</a>
          </div>

        </div>
      </div>
    </div>
  );
}
