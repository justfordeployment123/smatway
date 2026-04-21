"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { clearAuthData, setAuthToken } from "@/lib/auth";

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
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
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
      <circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" />
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

function ChevronDownIcon() {
  return (
    <svg className="w-4 h-4 text-slate-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export default function SignUpPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [accountType, setAccountType] = useState<"traveler" | "transporter">("traveler");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    country: "",
    agreedToTerms: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  type RegisterResponse = {
    accessToken?: string;
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-full min-h-[60vh]" aria-hidden="true" />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      // Handle checkbox separately from text inputs
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Avoid sending stale bearer tokens from previous sessions.
      clearAuthData();

      // Validate form
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        throw new Error("Please fill in all fields");
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      // Submit to /auth/register with all collected fields
      const result = await api.post<RegisterResponse>("/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        country: formData.country,
        accountType,
      });

      if (result?.accessToken) {
        setAuthToken(result.accessToken, 15 * 60);
      }

      await api.get("/auth/me");

      window.location.assign("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        // Display the specific message from the server if it exists
        setError(err.response?.message || "Registration succeeded but session validation failed. Please sign in again.");
      } else {
        setError(err instanceof Error ? err.message : "An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full animate-fade-in-up" suppressHydrationWarning>

      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 mb-10 transition-colors">
        <ArrowLeftIcon /><span>Back to Home</span>
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 mb-2">Create your account</h1>
        <p className="text-slate-500">Join SmatWay and start your journey today</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Full Name */}
        <div className="animate-fade-in-up [animation-delay:100ms]">
          <label htmlFor="name" className="text-sm font-medium text-zinc-900 mb-1.5 block">Full Name</label>
          <div className="relative flex items-center">
            <span className="absolute left-3 pointer-events-none">
              <UserIcon />
            </span>
            <input
              id="name"
              type="text"
              placeholder="Your full name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pl-10 text-sm text-zinc-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        {/* Email */}
        <div className="animate-fade-in-up [animation-delay:150ms]">
          <label htmlFor="email" className="text-sm font-medium text-zinc-900 mb-1.5 block">Email</label>
          <div className="relative flex items-center">
            <span className="absolute left-3 pointer-events-none">
              <MailIcon />
            </span>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pl-10 text-sm text-zinc-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        {/* Phone Number */}
        <div className="animate-fade-in-up [animation-delay:200ms]">
          <label htmlFor="phoneNumber" className="text-sm font-medium text-zinc-900 mb-1.5 block">Phone Number</label>
          <div className="relative flex items-center">
            <span className="absolute left-3 pointer-events-none">
              <PhoneIcon />
            </span>
            <input
              id="phoneNumber"
              type="text"
              placeholder="+254 712 345 678"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pl-10 text-sm text-zinc-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        {/* Country */}
        <div className="animate-fade-in-up [animation-delay:250ms]">
          <label htmlFor="country" className="text-sm font-medium text-zinc-900 mb-1.5 block">Country</label>
          <div className="relative flex items-center">
            <span className="absolute left-3 pointer-events-none">
              <GlobeIcon />
            </span>
            <select
              id="country"
              value={formData.country}
              onChange={handleSelectChange}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pl-10 pr-10 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
            >
              <option value="" className="text-slate-400">Select your country</option>
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
            <span className="absolute right-3">
              <ChevronDownIcon />
            </span>
          </div>
        </div>

        {/* Password */}
        <div className="animate-fade-in-up [animation-delay:300ms]">
          <label htmlFor="password" className="text-sm font-medium text-zinc-900 mb-1.5 block">Password</label>
          <div className="relative flex items-center">
            <span className="absolute left-3 pointer-events-none">
              <LockIcon />
            </span>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              value={formData.password}
              onChange={handleInputChange}
              required
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

        {/* Confirm Password */}
        <div className="animate-fade-in-up [animation-delay:350ms]">
          <label htmlFor="confirmPassword" className="text-sm font-medium text-zinc-900 mb-1.5 block">Confirm Password</label>
          <div className="relative flex items-center">
            <span className="absolute left-3 pointer-events-none">
              <LockIcon />
            </span>
            <input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pl-10 pr-11 text-sm text-zinc-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 focus:outline-none"
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? <EyeIcon /> : <EyeOffIcon />}
            </button>
          </div>
        </div>

        {/* Account Type */}
        <div className="animate-fade-in-up [animation-delay:400ms]">
          <label className="text-sm font-medium text-zinc-900 mb-1.5 block">Account Type</label>
          <div className="flex w-full rounded-xl border border-slate-200 overflow-hidden bg-white">
            <button
              type="button"
              onClick={() => setAccountType("traveler")}
              className={`w-1/2 py-3 text-sm font-medium transition-all duration-150 ${accountType === "traveler"
                ? "bg-zinc-900 text-white"
                : "text-slate-500 hover:bg-slate-50"
                }`}
            >
              Traveler
            </button>
            <button
              type="button"
              onClick={() => setAccountType("transporter")}
              className={`w-1/2 py-3 text-sm font-medium transition-all duration-150 border-l border-slate-200 ${accountType === "transporter"
                ? "bg-zinc-900 text-white"
                : "text-slate-500 hover:bg-slate-50"
                }`}
            >
              Transporter
            </button>
          </div>
        </div>

        {/* Terms */}
        <div className="flex items-start gap-2.5 animate-fade-in-up [animation-delay:450ms]">
          <input
            type="checkbox"
            id="agreedToTerms"
            checked={formData.agreedToTerms}
            onChange={handleInputChange}
            className="mt-0.5 cursor-pointer accent-emerald-600 w-4 h-4"
          />
          <label htmlFor="terms" className="text-sm text-slate-500 leading-snug">
            I have read and agree to the{" "}
            <a
              href="https://res.cloudinary.com/dge3lt4u6/image/upload/v1766858233/Terms_of_use_and_condition_of_service_y3gdjj.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 font-medium hover:text-emerald-700 transition-colors underline underline-offset-2"
            >
              Terms of Use &amp; Conditions
            </a>
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <div className="animate-fade-in-up [animation-delay:475ms] p-3 rounded-xl bg-red-50 border border-red-200">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Submit */}
        <div className="animate-fade-in-up [animation-delay:500ms] pt-1">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-400 text-white font-semibold py-3 px-4 rounded-xl active:scale-[0.98] transition-all duration-150 text-center block text-sm disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>
        </div>
      </form>

      <div className="border-t border-slate-100 my-6" />

      <div className="text-center animate-fade-in-up [animation-delay:550ms]">
        <p className="text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/signin" className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
