"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "motion/react";

// ─── Reusable scroll-reveal wrapper ──────────────────────────────────────────

function Reveal({
  children,
  className = "",
  delay = 0,
  y = 40,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
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

function ArrowRightIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
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

function StarIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function QuoteIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" opacity="0.12">
      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
    </svg>
  );
}

function MapPinIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

// ─── Data ──────────────────────────────────────────────────────────────────────

const stats = [
  { value: "50K+", label: "Active travelers" },
  { value: "12K+", label: "Verified transporters" },
  { value: "4.9", label: "Average rating", suffix: "/5" },
  { value: "98%", label: "On-time arrivals" },
];

const features = [
  {
    icon: <ShieldIcon className="w-6 h-6" />,
    title: "Verified & Safe",
    description: "Every transporter undergoes identity verification, license checks, and vehicle inspection before their first trip.",
    image: "https://images.pexels.com/photos/4393668/pexels-photo-4393668.jpeg?auto=compress&cs=tinysrgb&w=1200",
    imageLabel: "Identity and safety checks",
  },
  {
    icon: <CreditCardIcon className="w-6 h-6" />,
    title: "Secure Payments",
    description: "Funds held in escrow until your journey completes. Multiple payment methods, zero hidden fees.",
    image: "https://images.pexels.com/photos/3769135/pexels-photo-3769135.jpeg?auto=compress&cs=tinysrgb&w=1200",
    imageLabel: "Protected digital payments",
  },
  {
    icon: <ClockIcon className="w-6 h-6" />,
    title: "Real-Time Tracking",
    description: "Monitor your journey live. Share your trip link with family so they always know where you are.",
    image: "https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg?auto=compress&cs=tinysrgb&w=1200",
    imageLabel: "Live route visibility",
  },
  {
    icon: <UsersIcon className="w-6 h-6" />,
    title: "Community Driven",
    description: "Ratings and verified reviews from real passengers give you the clarity to choose confidently.",
    image: "https://images.pexels.com/photos/2422265/pexels-photo-2422265.jpeg?auto=compress&cs=tinysrgb&w=1200",
    imageLabel: "Real passenger community",
  },
];

const steps = [
  {
    num: "01",
    title: "Create your account",
    description: "Sign up with your phone or email in under a minute. Choose traveler or transporter.",
    image: "https://images.pexels.com/photos/4393668/pexels-photo-4393668.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    num: "02",
    title: "Find or post routes",
    description: "Search available routes by city and date. Transporters post schedules and set fares.",
    image: "https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    num: "03",
    title: "Travel with confidence",
    description: "Book, pay securely, track in real time. Rate your experience when you arrive.",
    image: "https://images.pexels.com/photos/2422265/pexels-photo-2422265.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
];

const testimonials = [
  {
    name: "Sarah K.",
    role: "Frequent Traveler",
    text: "SmatWay changed intercity travel for me — verified drivers, real-time tracking, and I always know exactly what I'm paying.",
    rating: 5,
    avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=300",
  },
  {
    name: "Ahmed R.",
    role: "Fleet Owner",
    text: "Managing my fleet through SmatWay has been seamless. The booking system fills seats consistently, payments always on time.",
    rating: 5,
    avatar: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300",
  },
  {
    name: "Maria L.",
    role: "Daily Commuter",
    text: "The real-time tracking gives my family peace of mind. I share my trip link every morning. That's priceless.",
    rating: 5,
    avatar: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=300",
  },
];

const routes = [
  {
    from: "Lahore",
    to: "Islamabad",
    price: "PKR 1,500",
    time: "4h 30m",
    image: "https://images.pexels.com/photos/1496373/pexels-photo-1496373.jpeg?auto=compress&cs=tinysrgb&w=1600",
  },
  {
    from: "Karachi",
    to: "Hyderabad",
    price: "PKR 800",
    time: "2h 45m",
    image: "https://images.pexels.com/photos/3849167/pexels-photo-3849167.jpeg?auto=compress&cs=tinysrgb&w=1600",
  },
  {
    from: "Islamabad",
    to: "Peshawar",
    price: "PKR 600",
    time: "2h 15m",
    image: "https://images.pexels.com/photos/11791795/pexels-photo-11791795.jpeg?auto=compress&cs=tinysrgb&w=1600",
  },
  {
    from: "Multan",
    to: "Lahore",
    price: "PKR 1,200",
    time: "5h 00m",
    image: "https://images.pexels.com/photos/8423875/pexels-photo-8423875.jpeg?auto=compress&cs=tinysrgb&w=1600",
  },
];

// ─── Hero (previous version — kept exactly as requested, with subtle professional polish) ─────────────────────────────────────

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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2.5 bg-white/80 backdrop-blur-sm border border-emerald-200/50 px-4 py-2 rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[13px] font-medium text-slate-600 tracking-wide">Trusted by 50,000+ travelers across the world</span>
            </motion.div>

            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="font-[var(--font-display)] text-[3.5rem] sm:text-[4.25rem] lg:text-[5rem] leading-[1.02] tracking-[-0.03em] text-zinc-900">
                Travel the way<br />
                <span className="relative inline-block">
                  <span className="text-emerald-600">it should be.</span>
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none" preserveAspectRatio="none">
                    <motion.path
                      d="M2 8c50-6 100-6 150-2s100 2 146-4"
                      stroke="rgba(16,185,129,0.3)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
                    />
                  </svg>
                </span>
              </h1>
            </motion.div>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="text-[17px] text-slate-500 leading-[1.7] max-w-[44ch]"
            >
              Connect with verified transporters. Book affordable routes across the world — safely, instantly, with full visibility every step of the way.
            </motion.p>

            {/* Trust items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap gap-x-8 gap-y-3"
            >
              {["Verified drivers", "Live tracking", "24/7 support"].map((item, i) => (
                <motion.div
                  key={item}
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 + i * 0.08, duration: 0.5 }}
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircleIcon className="w-3 h-3 text-emerald-600" />
                  </div>
                  <span className="text-sm text-slate-600 font-medium">{item}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap items-center gap-4"
            >
              <Link
                href="/signin"
                className="group inline-flex items-center gap-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold px-7 py-3.5 rounded-2xl transition-all duration-200 active:scale-[0.98] shadow-[0_1px_2px_rgba(0,0,0,0.1),0_4px_12px_rgba(0,0,0,0.08)]"
              >
                Start for free
                <ArrowRightIcon className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center gap-2 text-zinc-600 font-medium px-2 py-3.5 hover:text-zinc-900 transition-colors duration-200 text-sm"
              >
                <span className="underline underline-offset-4 decoration-slate-300 hover:decoration-slate-500 transition-colors">See how it works</span>
              </Link>
            </motion.div>
          </div>

          {/* Right — visual */}
          <motion.div
            className="relative hidden lg:block"
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="relative">
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
              <motion.div
                className="animate-float absolute -top-5 right-6 bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] border border-slate-100 px-5 py-3.5 flex items-center gap-3"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="w-10 h-10 bg-linear-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CheckCircleIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-bold text-zinc-900">Verified</div>
                  <div className="text-xs text-slate-400 font-medium">Licensed & Inspected</div>
                </div>
              </motion.div>

              {/* Rating badge */}
              <motion.div
                className="animate-float absolute -bottom-5 left-6 bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] border border-slate-100 px-5 py-3.5 flex items-center gap-3"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
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
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Stats ────────────────────────────────────────────────────────────────────

function Stats() {
  return (
    <section className="relative bg-white border-y border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-200/60">
          {stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.08} className="py-10 md:py-14 px-6 md:px-8 text-center group">
              <div className="font-[var(--font-display)] text-3xl md:text-4xl text-zinc-900 tracking-tight mb-1.5 group-hover:text-emerald-600 transition-colors duration-300">
                {stat.value}
                {stat.suffix && <span className="text-xl text-slate-400">{stat.suffix}</span>}
              </div>
              <div className="text-sm text-slate-400 font-medium">{stat.label}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Journey Showcase ────────────────────────────────────────────────────────

function JourneyShowcase() {
  return (
    <section className="relative py-20 lg:py-28 bg-[#f3f5f4] overflow-hidden">
      <div className="absolute inset-0 grain" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          <Reveal className="lg:col-span-8 h-full">
            <motion.div
              className="relative h-full min-h-[420px] rounded-[2rem] overflow-hidden border border-slate-200/80 shadow-[0_22px_60px_-24px_rgba(0,0,0,0.2)]"
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: "url('https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg?auto=compress&cs=tinysrgb&w=2000')",
                }}
                animate={{ scale: [1, 1.08, 1], x: [0, 6, 0] }}
                transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
              />

              <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/35 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-7 lg:p-10">
                <div className="inline-flex items-center gap-2 bg-white/12 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full text-xs font-semibold text-white/90 mb-4">
                  Live route footage
                </div>
                <h3 className="text-2xl lg:text-3xl font-semibold tracking-tight text-white max-w-[28ch]">
                  See the journey before you book it
                </h3>
                <p className="text-sm lg:text-base text-white/75 mt-3 max-w-[55ch] leading-relaxed">
                  Real road conditions, route rhythm, and arrival confidence in one glance.
                </p>
              </div>
            </motion.div>
          </Reveal>

          <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
            <Reveal delay={0.08}>
              <motion.div
                className="relative rounded-3xl overflow-hidden border border-slate-200/80 bg-white shadow-sm min-h-[200px]"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: "url('https://images.pexels.com/photos/304664/pexels-photo-304664.jpeg?auto=compress&cs=tinysrgb&w=1200')" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-0 p-5">
                  <p className="text-white font-semibold tracking-tight">Professional transport standards</p>
                  <p className="text-white/80 text-xs mt-1">Vehicles, routes, and operators verified end-to-end.</p>
                </div>
              </motion.div>
            </Reveal>

            <Reveal delay={0.15}>
              <motion.div
                className="relative rounded-3xl overflow-hidden border border-slate-200/80 bg-white shadow-sm min-h-[200px]"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: "url('https://images.pexels.com/photos/3769135/pexels-photo-3769135.jpeg?auto=compress&cs=tinysrgb&w=1200')" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-0 p-5">
                  <p className="text-white font-semibold tracking-tight">Designed for real commutes</p>
                  <p className="text-white/80 text-xs mt-1">From daily riders to fleet teams, every flow is practical.</p>
                </div>
              </motion.div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Popular Routes ───────────────────────────────────────────────────────────

function PopularRoutes() {
  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="mb-12">
          <p className="text-sm font-semibold text-emerald-600 uppercase tracking-[0.15em] mb-4">Popular routes</p>
          <h2 className="font-[var(--font-display)] text-3xl md:text-4xl text-zinc-900 tracking-tight leading-[1.1]">
            Where will you go next?
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {routes.map((route, i) => (
            <Reveal key={route.from + route.to} delay={i * 0.08}>
              <motion.div
                className="group relative bg-white rounded-3xl border border-slate-200/70 p-6 cursor-pointer hover:border-emerald-200 transition-all duration-300 shadow-sm hover:shadow-xl"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="relative h-36 rounded-2xl overflow-hidden mb-5">
                  <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url('${route.image}')` }} />
                  <div className="absolute inset-0 bg-linear-to-t from-black/45 via-black/10 to-transparent" />
                  <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white/80 backdrop-blur-sm text-zinc-700 border border-white/80">
                    Popular corridor
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-2xl bg-emerald-100 flex items-center justify-center">
                    <MapPinIcon className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                    {route.from}
                    <svg className="w-4 h-4 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                    {route.to}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">{route.time}</span>
                  <span className="text-sm font-bold text-emerald-600">{route.price}</span>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────

function Features() {
  return (
    <section className="relative py-24 lg:py-32 bg-[#fafaf8] overflow-hidden">
      <div className="absolute inset-0 grain" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <Reveal className="mb-16 max-w-2xl">
          <p className="text-sm font-semibold text-emerald-600 uppercase tracking-[0.15em] mb-4">Why SmatWay</p>
          <h2 className="font-[var(--font-display)] text-4xl md:text-5xl text-zinc-900 tracking-tight leading-[1.1] mb-5">
            Built for everyone<br />on the road
          </h2>
          <p className="text-[17px] text-slate-500 leading-relaxed">
            Whether you&apos;re heading to the next city or managing a fleet, every feature is designed around your safety and convenience.
          </p>
        </Reveal>

        {/* Clean 2×2 grid — uniform emerald theme, higher contrast cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.1}>
              <motion.div
                className="group relative bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="relative h-44 overflow-hidden">
                  <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url('${f.image}')` }} />
                  <div className="absolute inset-0 bg-linear-to-t from-black/55 via-black/10 to-transparent" />
                  <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/85 text-zinc-700 border border-white/80 backdrop-blur-sm text-[10px] font-semibold">
                    {f.imageLabel}
                  </div>
                  <div className="absolute -bottom-7 left-6 w-14 h-14 rounded-3xl bg-white border border-slate-200 shadow-md flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform duration-500">
                    {f.icon}
                  </div>
                </div>

                <div className="p-8 lg:p-10 pt-11">
                  <h3 className="text-xl font-bold text-zinc-900 mb-3 tracking-tight">{f.title}</h3>
                  <p className="text-slate-500 text-[15px] leading-relaxed">{f.description}</p>
                  <div className="mt-6 flex items-center gap-2 text-emerald-600 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all">
                    Learn more
                    <ArrowRightIcon className="w-3.5 h-3.5" />
                  </div>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────

function HowItWorks() {
  return (
    <section className="py-24 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <Reveal className="mb-16">
          <p className="text-sm font-semibold text-emerald-600 uppercase tracking-[0.15em] mb-4">How it works</p>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <h2 className="font-[var(--font-display)] text-4xl md:text-5xl text-zinc-900 tracking-tight leading-[1.1]">
              Three steps to go
            </h2>
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors whitespace-nowrap group"
            >
              Full guide
              <ArrowRightIcon className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </Reveal>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-[3.5rem] left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px z-0 overflow-hidden">
            <motion.div
              className="h-full bg-linear-to-r from-slate-300 via-emerald-300 to-slate-300"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformOrigin: "left" }}
            />
          </div>

          {steps.map((step, i) => (
            <Reveal key={step.num} delay={0.15 + i * 0.15}>
              <motion.div
                className="group relative bg-white rounded-3xl border border-slate-200/70 p-8 lg:p-10 shadow-sm hover:shadow-2xl transition-all duration-300"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="relative h-32 rounded-2xl overflow-hidden mb-6">
                  <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url('${step.image}')` }} />
                  <div className="absolute inset-0 bg-linear-to-t from-black/45 via-black/5 to-transparent" />
                </div>
                <div className="relative z-10 w-14 h-14 rounded-3xl bg-zinc-950 flex items-center justify-center mb-8 shadow-inner group-hover:shadow-xl transition-shadow duration-500">
                  <span className="text-sm font-bold text-white font-mono">{step.num}</span>
                </div>
                <h3 className="text-lg font-bold text-zinc-900 mb-3 tracking-tight">{step.title}</h3>
                <p className="text-slate-500 text-[15px] leading-relaxed">{step.description}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

function Testimonials() {
  return (
    <section className="relative py-24 lg:py-32 bg-zinc-950 overflow-hidden">
      <div className="absolute inset-0 grain" />

      <motion.div
        className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] rounded-full blur-[150px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)",
        }}
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />

      <div
        className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="mb-16 max-w-2xl">
          <p className="text-sm font-semibold text-emerald-400 uppercase tracking-[0.15em] mb-4">
            What people say
          </p>
          <h2 className="font-[var(--font-display)] text-4xl md:text-5xl text-white tracking-tight leading-[1.1]">
            Trusted by thousands
          </h2>
        </Reveal>

        {/* ✅ Updated grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-fr">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.12}>
              {/* ✅ Updated card */}
              <motion.div
                className="group relative h-full flex flex-col bg-white/[0.04] backdrop-blur-sm rounded-3xl border border-white/[0.06] p-8 lg:p-10 hover:bg-white/[0.07] hover:border-white/[0.1] transition-all duration-300"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
              >
                <QuoteIcon className="w-10 h-10 text-white mb-6" />

                {/* ✅ flex-grow added */}
                <p className="text-[15px] text-zinc-300 leading-relaxed mb-8 group-hover:text-zinc-200 transition-colors duration-500 flex-grow">
                  &ldquo;{t.text}&rdquo;
                </p>

                <div className="h-px bg-linear-to-r from-white/10 via-white/5 to-transparent mb-6" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="w-10 h-10 rounded-2xl object-cover border border-white/20"
                    />
                    <div>
                      <div className="text-sm font-bold text-white">
                        {t.name}
                      </div>
                      <div className="text-xs text-zinc-500 font-medium">
                        {t.role}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <StarIcon
                        key={j}
                        className="w-3.5 h-3.5 text-amber-400"
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Feedback ─────────────────────────────────────────────────────────────────

function Feedback() {
  return (
    <section className="py-24 lg:py-32 bg-[#fafaf8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid md:grid-cols-2 gap-6 auto-rows-fr">

          {/* ================= SATISFIED ================= */}
          <Reveal>
            <motion.div
              className="group relative h-full rounded-3xl p-[1px] bg-gradient-to-br from-emerald-500/30 via-transparent to-transparent hover:from-emerald-400/60 transition-all duration-500"
              whileHover={{ y: -6 }}
            >
              {/* inner card */}
              <div className="relative h-full flex flex-col justify-between rounded-3xl bg-zinc-950/90 backdrop-blur-xl p-10 lg:p-12 overflow-hidden">

                {/* glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-700">
                  <div className="absolute -bottom-20 -right-20 w-[300px] h-[300px] bg-emerald-500/10 blur-[100px] rounded-full" />
                </div>

                {/* icon */}
                <div className="relative z-10 w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center mb-8 group-hover:scale-110 transition duration-500">
                  <svg className="w-6 h-6 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M7 10v12" />
                    <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
                  </svg>
                </div>

                {/* content */}
                <div className="flex-grow">
                  <h3 className="text-3xl font-semibold text-white mb-4 tracking-tight">
                    Satisfied?
                  </h3>
                  <p className="text-zinc-400 leading-relaxed mb-8 max-w-[36ch]">
                    Share your experience. A recommendation goes further than any advertisement.
                  </p>
                </div>

                {/* CTA */}
                <Link
                  href="/signin"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-600/20 hover:shadow-emerald-500/30"
                >
                  Share your story
                  <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </motion.div>
          </Reveal>

          {/* ================= NOT SATISFIED ================= */}
          <Reveal delay={0.1}>
            <motion.div
              className="group relative h-full rounded-3xl p-[1px] bg-gradient-to-br from-red-400/30 via-transparent to-transparent hover:from-red-400/60 transition-all duration-500"
              whileHover={{ y: -6 }}
            >
              {/* inner */}
              <div className="relative h-full flex flex-col justify-between rounded-3xl bg-white p-10 lg:p-12 overflow-hidden">

                {/* soft hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-700">
                  <div className="absolute -top-20 -left-20 w-[280px] h-[280px] bg-red-400/10 blur-[90px] rounded-full" />
                </div>

                {/* icon */}
                <div className="relative z-10 w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-8 group-hover:scale-110 transition duration-500">
                  <svg className="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M17 14V2" />
                    <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z" />
                  </svg>
                </div>

                {/* content */}
                <div className="flex-grow">
                  <h3 className="text-3xl font-semibold text-zinc-900 mb-4 tracking-tight">
                    Not satisfied?
                  </h3>
                  <p className="text-slate-500 leading-relaxed mb-8 max-w-[36ch]">
                    Tell us directly. Every piece of feedback makes the platform better for everyone.
                  </p>
                </div>

                {/* CTA */}
                <a
                  href="mailto:tellus@smatway.com"
                  className="text-sm font-semibold text-red-500 hover:text-red-600 transition underline underline-offset-4 decoration-red-200 hover:decoration-red-400"
                >
                  tellus@smatway.com
                </a>
              </div>
            </motion.div>
          </Reveal>

        </div>
      </div>
    </section>
  );
}

// ─── CTA ──────────────────────────────────────────────────────────────────────

function CTA() {
  return (
    <section className="relative overflow-hidden bg-zinc-950 py-28 lg:py-36">
      <div className="absolute inset-0 grain" />
      <motion.div
        className="absolute right-[-10%] top-[20%] w-[600px] h-[600px] rounded-full blur-[150px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.15, 1], x: [0, 20, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-1/4 -right-20 w-[400px] h-px bg-linear-to-l from-transparent via-emerald-500/10 to-transparent"
          animate={{ x: [0, -30, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-2/3 -right-10 w-[300px] h-px bg-linear-to-l from-transparent via-emerald-500/5 to-transparent"
          animate={{ x: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <Reveal>
            <p className="text-emerald-400 text-sm font-semibold uppercase tracking-[0.15em] mb-6">Get started today</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="font-[var(--font-display)] text-5xl lg:text-6xl text-white tracking-tight leading-[1.05] mb-6">
              Ready to travel<br />smarter?
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-[17px] text-zinc-400 leading-relaxed mb-12 max-w-[44ch]">
              Join thousands of travelers and transporters who moved away from uncertainty and chose a platform that works.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/signin"
                className="group inline-flex items-center gap-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 active:scale-[0.97] shadow-[0_0_24px_rgba(16,185,129,0.2)] hover:shadow-[0_0_40px_rgba(16,185,129,0.3)]"
              >
                Create free account
                <ArrowRightIcon className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center gap-2 text-zinc-400 hover:text-white font-medium px-2 py-4 transition-colors duration-300 text-sm group"
              >
                <span className="underline underline-offset-4 decoration-zinc-700 group-hover:decoration-zinc-500 transition-colors duration-300">Learn how it works</span>
              </Link>
            </div>
          </Reveal>
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
      <JourneyShowcase />
      <PopularRoutes />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Feedback />
      <CTA />
    </>
  );
}