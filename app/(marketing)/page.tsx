"use client";

import { useEffect, useRef } from "react";

// ─── Scroll reveal hook ───────────────────────────────────────────────────────

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    const children = el.querySelectorAll(".reveal");
    children.forEach((child) => observer.observe(child));

    return () => observer.disconnect();
  }, []);

  return ref;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function CheckCircleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="m9 11 3 3L22 4" />
    </svg>
  );
}

function ShieldIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  );
}

function CreditCardIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  );
}

function ClockIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function UsersIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ArrowRightIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function StarIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function QuoteIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" opacity="0.15">
      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
    </svg>
  );
}

// ─── Data ──────────────────────────────────────────────────────────────────────

const stats = [
  { value: "50K+", label: "Active travelers" },
  { value: "12K+", label: "Verified transporters" },
  { value: "4.9", label: "Average rating" },
  { value: "98%", label: "On-time arrivals" },
];

const steps = [
  {
    num: "01",
    title: "Create your account",
    description: "Sign up with your phone or email in under a minute. Choose your role — traveler or transporter.",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <line x1="19" y1="8" x2="19" y2="14" />
        <line x1="22" y1="11" x2="16" y2="11" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Find or post routes",
    description: "Travelers search available routes by city and date. Transporters post schedules and set fares.",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Travel with confidence",
    description: "Book, pay securely, and track your journey in real time. Rate your experience when you arrive.",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <path d="m9 11 3 3L22 4" />
      </svg>
    ),
  },
];

const testimonials = [
  {
    name: "Sarah K.",
    role: "Frequent Traveler",
    text: "I used to stress about intercity travel. SmatWay changed that completely — verified drivers, real-time tracking, and I always know exactly what I'm paying.",
    rating: 5,
    avatar: "SK",
  },
  {
    name: "Ahmed R.",
    role: "Fleet Owner",
    text: "Managing my fleet through SmatWay has been seamless. The booking system fills my seats consistently, and the payments are always on time.",
    rating: 5,
    avatar: "AR",
  },
  {
    name: "Maria L.",
    role: "Daily Commuter",
    text: "The real-time tracking gives my family peace of mind. I share my trip link every morning and they can follow along. That's priceless.",
    rating: 5,
    avatar: "ML",
  },
];

// ─── Sections ──────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#fafaf8] pt-32 pb-24 lg:pt-40 lg:pb-32">
      {/* Ambient background */}
      <div className="absolute inset-0 grain" />
      <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-emerald-100/40 rounded-full blur-[120px] translate-x-1/4 -translate-y-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-100/30 rounded-full blur-[100px] -translate-x-1/4 translate-y-1/4 pointer-events-none" />
      {/* Decorative grid dots */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* Left — content */}
          <div className="space-y-10">
            {/* Badge */}
            <div
              className="animate-fade-in-up inline-flex items-center gap-2.5 bg-white/80 backdrop-blur-sm border border-emerald-200/50 px-4 py-2 rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
              style={{ animationDelay: "0ms" }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[13px] font-medium text-slate-600 tracking-wide">Trusted by 50,000+ travelers across the world</span>
            </div>

            {/* Headline */}
            <div className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
              <h1 className="font-[var(--font-display)] text-[3.5rem] sm:text-[4.25rem] lg:text-[5rem] leading-[1.02] tracking-[-0.03em] text-zinc-900">
                Travel the way<br />
                <span className="relative inline-block">
                  <span className="text-emerald-600">it should be.</span>
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none" preserveAspectRatio="none">
                    <path d="M2 8c50-6 100-6 150-2s100 2 146-4" stroke="rgba(16,185,129,0.3)" strokeWidth="3" strokeLinecap="round" className="animate-fade-in-up" style={{ animationDelay: "800ms" }} />
                  </svg>
                </span>
              </h1>
            </div>

            {/* Subtext */}
            <p
              className="animate-fade-in-up text-[17px] text-slate-500 leading-[1.7] max-w-[44ch]"
              style={{ animationDelay: "200ms" }}
            >
              Connect with verified transporters. Book affordable routes across the world — safely, instantly, with full visibility every step of the way.
            </p>

            {/* Trust items */}
            <div
              className="animate-fade-in-up flex flex-wrap gap-x-8 gap-y-3"
              style={{ animationDelay: "300ms" }}
            >
              {["Verified drivers", "Live tracking", "24/7 support"].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircleIcon className="w-3 h-3 text-emerald-600" />
                  </div>
                  <span className="text-sm text-slate-600 font-medium">{item}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div
              className="animate-fade-in-up flex flex-wrap items-center gap-4"
              style={{ animationDelay: "400ms" }}
            >
              <a
                href="/signin"
                className="group inline-flex items-center gap-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold px-7 py-3.5 rounded-2xl transition-all duration-200 active:scale-[0.98] shadow-[0_1px_2px_rgba(0,0,0,0.1),0_4px_12px_rgba(0,0,0,0.08)]"
              >
                Start for free
                <ArrowRightIcon className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
              <a
                href="/how-it-works"
                className="inline-flex items-center gap-2 text-zinc-600 font-medium px-2 py-3.5 hover:text-zinc-900 transition-colors duration-200 text-sm"
              >
                <span className="underline underline-offset-4 decoration-slate-300 hover:decoration-slate-500 transition-colors">See how it works</span>
              </a>
            </div>
          </div>

          {/* Right — visual */}
          <div className="relative hidden lg:block">
            <div className="relative animate-scale-in" style={{ animationDelay: "300ms" }}>
              {/* Main card */}
              <div className="relative bg-white rounded-[2rem] p-10 shadow-[0_24px_80px_-12px_rgba(0,0,0,0.06)] border border-slate-200/60 overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-br from-emerald-50/30 via-transparent to-teal-50/20 pointer-events-none" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://purepng.com/public/uploads/large/purepng.com-hyundai-ioniq-white-carcarvehicletransporthyundai-961524653528qvh7u.png"
                  alt="SmatWay vehicle"
                  className="w-full h-auto drop-shadow-2xl relative z-10"
                />
              </div>

              {/* Verified badge */}
              <div className="animate-float absolute -top-5 right-6 bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] border border-slate-100 px-5 py-3.5 flex items-center gap-3">
                <div className="w-10 h-10 bg-linear-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0 animate-glow-pulse">
                  <CheckCircleIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-bold text-zinc-900">Verified</div>
                  <div className="text-xs text-slate-400 font-medium">Licensed & Inspected</div>
                </div>
              </div>

              {/* Rating badge */}
              <div
                className="animate-float absolute -bottom-5 left-6 bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] border border-slate-100 px-5 py-3.5 flex items-center gap-3"
                style={{ animationDelay: "1.5s" }}
              >
                <div className="flex -space-x-1.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <StarIcon key={i} className="w-4 h-4 text-amber-400" />
                  ))}
                </div>
                <div>
                  <div className="text-sm font-bold text-zinc-900">4.9/5</div>
                  <div className="text-xs text-slate-400 font-medium">12K+ reviews</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const ref = useReveal();

  return (
    <section ref={ref} className="relative bg-white border-y border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-200/60">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="reveal py-10 md:py-14 px-6 md:px-8 text-center group"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="font-[var(--font-display)] text-3xl md:text-4xl text-zinc-900 tracking-tight mb-1.5 group-hover:text-emerald-600 transition-colors duration-300">
                {stat.value}
              </div>
              <div className="text-sm text-slate-400 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const ref = useReveal();

  return (
    <section ref={ref} className="relative py-24 lg:py-32 bg-[#fafaf8] overflow-hidden">
      <div className="absolute inset-0 grain" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="reveal mb-16 max-w-2xl">
          <p className="text-sm font-semibold text-emerald-600 uppercase tracking-[0.15em] mb-4">Why SmatWay</p>
          <h2 className="font-[var(--font-display)] text-4xl md:text-5xl text-zinc-900 tracking-tight leading-[1.1] mb-5">
            Built for everyone<br />on the road
          </h2>
          <p className="text-[17px] text-slate-500 leading-relaxed">
            Whether you&apos;re heading to the next city or managing a fleet, every feature is designed around your safety and convenience.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {/* Featured: Verified & Safe — 4 cols */}
          <div className="reveal md:col-span-4 group relative bg-zinc-950 text-white rounded-3xl p-10 lg:p-12 flex flex-col justify-between min-h-[300px] overflow-hidden card-shine" style={{ transitionDelay: "100ms" }}>
            <div className="absolute inset-0 bg-linear-to-br from-emerald-950/20 via-transparent to-teal-950/10 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none transition-all duration-700 group-hover:bg-emerald-500/10 group-hover:w-[400px] group-hover:h-[400px]" />
            {/* Decorative line pattern */}
            <div className="absolute top-0 right-0 w-48 h-48 pointer-events-none opacity-[0.03]">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="absolute border-t border-white" style={{ top: `${i * 20}%`, right: 0, width: `${100 - i * 15}%` }} />
              ))}
            </div>
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-8 group-hover:bg-emerald-500/25 transition-colors duration-500">
                <ShieldIcon className="w-7 h-7" />
              </div>
            </div>
            <div className="relative z-10">
              <h3 className="font-[var(--font-display)] text-2xl lg:text-3xl mb-3">Verified &amp; Safe</h3>
              <p className="text-zinc-400 text-[15px] leading-relaxed max-w-[48ch] group-hover:text-zinc-300 transition-colors duration-500">
                Every transporter undergoes identity verification, license checks, and vehicle inspection before their first trip. Your safety is non-negotiable.
              </p>
            </div>
          </div>

          {/* Secure Payments — 2 cols */}
          <div className="reveal md:col-span-2 group bg-white rounded-3xl p-8 lg:p-9 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[300px] hover-lift border-gradient-hover" style={{ transitionDelay: "200ms" }}>
            <div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-6 group-hover:bg-emerald-100 group-hover:border-emerald-200 transition-colors duration-500">
                <CreditCardIcon className="w-6 h-6" />
              </div>
              <div className="w-full h-px bg-linear-to-r from-slate-200/80 via-slate-200/40 to-transparent mb-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900 mb-3 tracking-tight">Secure Payments</h3>
              <p className="text-slate-500 text-[15px] leading-relaxed">
                Funds held in escrow until arrival. Multiple methods, zero hidden fees.
              </p>
              <div className="mt-5 flex items-center gap-2 text-emerald-600 text-sm font-semibold opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                Learn more <ArrowRightIcon className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Real-Time Tracking — 2 cols */}
          <div className="reveal md:col-span-2 group bg-white rounded-3xl p-8 lg:p-9 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[300px] hover-lift border-gradient-hover" style={{ transitionDelay: "300ms" }}>
            <div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-6 group-hover:bg-emerald-100 group-hover:border-emerald-200 transition-colors duration-500">
                <ClockIcon className="w-6 h-6" />
              </div>
              <div className="w-full h-px bg-linear-to-r from-slate-200/80 via-slate-200/40 to-transparent mb-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900 mb-3 tracking-tight">Real-Time Tracking</h3>
              <p className="text-slate-500 text-[15px] leading-relaxed">
                Monitor live. Share your trip link so loved ones always know where you are.
              </p>
              <div className="mt-5 flex items-center gap-2 text-emerald-600 text-sm font-semibold opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                Learn more <ArrowRightIcon className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Featured: Community Driven — 4 cols */}
          <div className="reveal md:col-span-4 group relative bg-emerald-600 text-white rounded-3xl p-10 lg:p-12 flex flex-col justify-between min-h-[300px] overflow-hidden card-shine" style={{ transitionDelay: "400ms" }}>
            <div className="absolute inset-0 bg-linear-to-br from-emerald-500/30 via-transparent to-teal-700/20 pointer-events-none" />
            <div className="absolute top-0 right-0 w-[250px] h-[250px] bg-white/5 rounded-full blur-[60px] pointer-events-none transition-all duration-700 group-hover:bg-white/10 group-hover:w-[350px] group-hover:h-[350px]" />
            {/* Decorative circles */}
            <div className="absolute bottom-6 right-6 pointer-events-none opacity-[0.06]">
              <div className="w-32 h-32 rounded-full border border-white" />
              <div className="absolute inset-4 rounded-full border border-white" />
              <div className="absolute inset-8 rounded-full border border-white" />
            </div>
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center mb-8 group-hover:bg-white/25 transition-colors duration-500">
                <UsersIcon className="w-7 h-7 text-white" />
              </div>
            </div>
            <div className="relative z-10">
              <h3 className="font-[var(--font-display)] text-2xl lg:text-3xl mb-3">Community Driven</h3>
              <p className="text-emerald-100/80 text-[15px] leading-relaxed max-w-[48ch] group-hover:text-white/90 transition-colors duration-500">
                Ratings and verified reviews from real passengers give you the clarity to choose confidently. Every ride builds trust.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const ref = useReveal();

  return (
    <section ref={ref} className="py-24 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="reveal mb-16">
          <p className="text-sm font-semibold text-emerald-600 uppercase tracking-[0.15em] mb-4">How it works</p>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <h2 className="font-[var(--font-display)] text-4xl md:text-5xl text-zinc-900 tracking-tight leading-[1.1]">
              Three steps to go
            </h2>
            <a
              href="/how-it-works"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors whitespace-nowrap group"
            >
              Full guide
              <ArrowRightIcon className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </div>
        </div>

        {/* Steps — connected cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-[3.5rem] left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-linear-to-r from-slate-300 via-emerald-300 to-slate-300 z-0" />

          {steps.map((step, i) => (
            <div
              key={step.num}
              className="reveal group relative bg-[#fafaf8] rounded-3xl border border-slate-200/60 p-8 lg:p-10 hover-lift border-gradient-hover"
              style={{ transitionDelay: `${(i + 1) * 120}ms` }}
            >
              {/* Step number + icon */}
              <div className="flex items-center gap-4 mb-8">
                <div className="relative z-10 w-14 h-14 rounded-2xl bg-zinc-950 flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.15)] group-hover:shadow-[0_4px_20px_rgba(0,0,0,0.25)] transition-shadow duration-500">
                  <span className="text-sm font-bold text-white font-mono">{step.num}</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 opacity-0 -translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                  {step.icon}
                </div>
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-3 tracking-tight">{step.title}</h3>
              <p className="text-slate-500 text-[15px] leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const ref = useReveal();

  return (
    <section ref={ref} className="relative py-24 lg:py-32 bg-zinc-950 overflow-hidden">
      <div className="absolute inset-0 grain" />
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      {/* Decorative grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="reveal mb-16 max-w-2xl">
          <p className="text-sm font-semibold text-emerald-400 uppercase tracking-[0.15em] mb-4">What people say</p>
          <h2 className="font-[var(--font-display)] text-4xl md:text-5xl text-white tracking-tight leading-[1.1]">
            Trusted by thousands
          </h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className="reveal group relative bg-white/[0.04] backdrop-blur-sm rounded-3xl border border-white/[0.06] p-8 lg:p-10 hover:bg-white/[0.07] hover:border-white/[0.10] transition-all duration-500"
              style={{ transitionDelay: `${(i + 1) * 120}ms` }}
            >
              <QuoteIcon className="w-10 h-10 text-white mb-6" />
              <p className="text-[15px] text-zinc-300 leading-relaxed mb-8 group-hover:text-zinc-200 transition-colors duration-500">&ldquo;{t.text}&rdquo;</p>
              <div className="h-px bg-linear-to-r from-white/10 via-white/5 to-transparent mb-6" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{t.name}</div>
                    <div className="text-xs text-zinc-500 font-medium">{t.role}</div>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <StarIcon key={j} className="w-3.5 h-3.5 text-amber-400" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Feedback() {
  const ref = useReveal();

  return (
    <section ref={ref} className="py-24 lg:py-32 bg-[#fafaf8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-6 items-stretch">
          {/* Satisfied */}
          <div className="reveal relative bg-zinc-950 rounded-3xl p-10 lg:p-12 flex flex-col justify-between min-h-[320px] overflow-hidden group card-shine" style={{ transitionDelay: "100ms" }}>
            <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none transition-all duration-700 group-hover:bg-emerald-500/10" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center mb-8 group-hover:bg-emerald-500/25 transition-colors duration-500">
                <svg className="w-6 h-6 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 10v12" /><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
                </svg>
              </div>
            </div>
            <div className="relative z-10">
              <h3 className="font-[var(--font-display)] text-3xl text-white mb-4">Satisfied?</h3>
              <p className="text-zinc-400 text-[15px] leading-relaxed mb-8 max-w-[36ch]">
                Share your experience. A recommendation goes further than any advertisement.
              </p>
              <a
                href="/signin"
                className="group/btn inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-all duration-200 active:scale-[0.98]"
              >
                Share your story
                <ArrowRightIcon className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:translate-x-1" />
              </a>
            </div>
          </div>

          {/* Not satisfied */}
          <div className="reveal relative bg-white rounded-3xl p-10 lg:p-12 border border-slate-200/60 flex flex-col justify-between min-h-[320px] group hover-lift" style={{ transitionDelay: "200ms" }}>
            <div className="absolute top-8 right-8 w-1 h-20 bg-linear-to-b from-red-400/50 to-transparent rounded-full" />
            <div>
              <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-8 group-hover:bg-red-100 group-hover:border-red-200 transition-colors duration-500">
                <svg className="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 14V2" /><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z" />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="font-[var(--font-display)] text-3xl text-zinc-900 mb-4">Not satisfied?</h3>
              <p className="text-slate-500 text-[15px] leading-relaxed mb-6 max-w-[36ch]">
                Tell us directly. Every piece of feedback makes the platform better for everyone.
              </p>
              <a href="mailto:tellus@smatway.com" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors underline underline-offset-4 decoration-emerald-200 hover:decoration-emerald-400">
                tellus@smatway.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="relative overflow-hidden bg-zinc-950 py-28 lg:py-36">
      <div className="absolute inset-0 grain" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-600/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute left-1/4 bottom-0 w-[400px] h-[400px] bg-teal-600/5 rounded-full blur-[100px] pointer-events-none" />
      {/* Decorative lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -right-20 w-[400px] h-px bg-linear-to-l from-transparent via-emerald-500/10 to-transparent" />
        <div className="absolute top-2/3 -right-10 w-[300px] h-px bg-linear-to-l from-transparent via-emerald-500/5 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="animate-fade-in-up text-emerald-400 text-sm font-semibold uppercase tracking-[0.15em] mb-6">Get started today</p>
          <h2 className="animate-fade-in-up font-[var(--font-display)] text-5xl lg:text-6xl text-white tracking-tight leading-[1.05] mb-6" style={{ animationDelay: "100ms" }}>
            Ready to travel<br />smarter?
          </h2>
          <p className="animate-fade-in-up text-[17px] text-zinc-400 leading-relaxed mb-12 max-w-[44ch]" style={{ animationDelay: "200ms" }}>
            Join thousands of travelers and transporters who moved away from uncertainty and chose a platform that works.
          </p>
          <div className="animate-fade-in-up flex flex-wrap items-center gap-4" style={{ animationDelay: "300ms" }}>
            <a
              href="/signin"
              className="group inline-flex items-center gap-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-200 active:scale-[0.98] shadow-[0_0_24px_rgba(16,185,129,0.2)] hover:shadow-[0_0_32px_rgba(16,185,129,0.3)]"
            >
              Create free account
              <ArrowRightIcon className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
            <a
              href="/how-it-works"
              className="inline-flex items-center gap-2 text-zinc-400 hover:text-white font-medium px-2 py-4 transition-colors duration-200 text-sm"
            >
              <span className="underline underline-offset-4 decoration-zinc-700 hover:decoration-zinc-500 transition-colors">Learn how it works</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <>
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Feedback />
      <CTA />
    </>
  );
}
