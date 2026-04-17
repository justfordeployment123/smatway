"use client";

import Link from "next/link";
import { motion, useInView } from "motion/react";
import { useRef } from "react";

// ─── Reusable Reveal Component ─────────────────────────────────────────────
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
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ─── Icons ─────────────────────────────────────────────────────────────────
function ArrowRightIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function CheckCircleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="m9 11 3 3L22 4" />
    </svg>
  );
}

// ─── Data ──────────────────────────────────────────────────────────────────
const stats = [
  { value: "50K+", label: "Active travelers" },
  { value: "12K+", label: "Verified transporters" },
  { value: "4.9", label: "Average rating", suffix: "/5" },
  { value: "98%", label: "On-time arrivals" },
];

const features = [
  {
    icon: "🛡️",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2070",
    title: "Verified & Safe",
    description: "Every transporter undergoes identity verification, license checks, and vehicle inspection before their first trip.",
  },
  {
    icon: "💳",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=2070",
    title: "Secure Payments",
    description: "Funds held in escrow until your journey completes. Multiple payment methods, zero hidden fees.",
  },
  {
    icon: "📍",
    image: "https://images.unsplash.com/photo-1492144534652-916f4b5c2a8f?q=80&w=2070",
    title: "Real-Time Tracking",
    description: "Monitor your journey live. Share your trip link with family so they always know where you are.",
  },
  {
    icon: "👥",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=2070",
    title: "Community Driven",
    description: "Ratings and verified reviews from real passengers give you the clarity to choose confidently.",
  },
];

const routes = [
  { from: "Lahore", to: "Islamabad", price: "PKR 1,500", time: "4h 30m", image: "https://images.unsplash.com/photo-1544620347-c4fd70a2e7d1?q=80&w=2070" },
  { from: "Karachi", to: "Hyderabad", price: "PKR 800", time: "2h 45m", image: "https://images.unsplash.com/photo-1585503418530-9f4f6e9c9b0e?q=80&w=2070" },
  { from: "Islamabad", to: "Peshawar", price: "PKR 600", time: "2h 15m", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2070" },
  { from: "Multan", to: "Lahore", price: "PKR 1,200", time: "5h 00m", image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2070" },
];

const testimonials = [
  {
    name: "Sarah K.",
    role: "Frequent Traveler",
    text: "SmatWay changed intercity travel for me — verified drivers, real-time tracking, and I always know exactly what I'm paying.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150",
  },
  {
    name: "Ahmed R.",
    role: "Fleet Owner",
    text: "Managing my fleet through SmatWay has been seamless. The booking system fills seats consistently, payments always on time.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150",
  },
  {
    name: "Maria L.",
    role: "Daily Commuter",
    text: "The real-time tracking gives my family peace of mind. I share my trip link every morning. That's priceless.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150",
  },
];

// ─── Hero Section (with beautiful background) ───────────────────────────────
function Hero() {
  return (
    <section className="relative min-h-[100dvh] flex items-center overflow-hidden bg-zinc-950">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=2070"
          alt="Highway travel"
          className="w-full h-full object-cover opacity-75"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/40" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-10">
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 px-5 py-2.5 rounded-full">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-white/90 text-sm font-medium">Trusted by 50,000+ travelers</span>
            </div>

            <h1 className="text-6xl lg:text-7xl font-bold tracking-tighter text-white leading-none">
              Travel the way<br />
              <span className="text-emerald-400">it should be.</span>
            </h1>

            <p className="text-xl text-white/80 max-w-lg">
              Connect with verified transporters. Book safe, affordable intercity rides with real-time tracking.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/signin"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-8 py-4 rounded-2xl flex items-center gap-3 transition-all active:scale-[0.97]"
              >
                Start for free
                <ArrowRightIcon />
              </Link>
              <Link
                href="/how-it-works"
                className="border border-white/30 hover:bg-white/10 text-white px-8 py-4 rounded-2xl transition-all"
              >
                See how it works
              </Link>
            </div>
          </div>

          <div className="hidden lg:block">
            <img
              src="https://images.unsplash.com/photo-1550355291-bbee04a92027?q=80&w=2070"
              alt="Modern vehicle"
              className="rounded-3xl shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Stats Section ─────────────────────────────────────────────────────────
function Stats() {
  return (
    <section className="bg-white border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100">
          {stats.map((stat, i) => (
            <Reveal key={i} delay={i * 0.05} className="py-12 px-8 text-center">
              <div className="text-4xl md:text-5xl font-bold text-zinc-900 tracking-tight">
                {stat.value}
                {stat.suffix && <span className="text-2xl text-slate-400">{stat.suffix}</span>}
              </div>
              <div className="text-sm text-slate-500 mt-2 font-medium">{stat.label}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Popular Routes ────────────────────────────────────────────────────────
function PopularRoutes() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <Reveal>
          <p className="uppercase text-emerald-600 font-semibold tracking-widest text-sm mb-3">Popular Routes</p>
          <h2 className="text-4xl font-bold tracking-tight text-zinc-900">Where will you go next?</h2>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {routes.map((route, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <motion.div
                whileHover={{ y: -8 }}
                className="group bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all"
              >
                <div className="h-56 overflow-hidden">
                  <img
                    src={route.image}
                    alt={`${route.from} to ${route.to}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <div className="p-6">
                  <div className="font-semibold text-lg mb-1">{route.from} → {route.to}</div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">{route.time}</span>
                    <span className="font-bold text-emerald-600">{route.price}</span>
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

// ─── Features Section ──────────────────────────────────────────────────────
function Features() {
  return (
    <section className="py-24 bg-[#fafaf8]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <Reveal className="max-w-2xl mb-16">
          <p className="uppercase tracking-widest text-emerald-600 text-sm font-semibold">Why SmatWay</p>
          <h2 className="text-5xl font-bold tracking-tight text-zinc-900 mt-4">Built for everyone on the road</h2>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -6 }}
                className="group bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-2xl h-full"
              >
                <div className="relative h-80">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20" />
                  <div className="absolute top-8 left-8 text-5xl">{feature.icon}</div>
                </div>

                <div className="p-10">
                  <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How It Works (kept simple but clean) ─────────────────────────────────
function HowItWorks() {
  const steps = [
    { num: "01", title: "Create your account", description: "Sign up with your phone or email in under a minute." },
    { num: "02", title: "Find or post routes", description: "Search available routes by city and date." },
    { num: "03", title: "Travel with confidence", description: "Book, pay securely, track in real time." },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <Reveal className="mb-16">
          <p className="text-emerald-600 uppercase tracking-widest text-sm font-semibold">How it works</p>
          <h2 className="text-5xl font-bold tracking-tight text-zinc-900 mt-3">Three steps to go</h2>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <Reveal key={i} delay={i * 0.15}>
              <div className="bg-white border border-slate-200 rounded-3xl p-10 hover:shadow-xl transition-all">
                <div className="text-4xl font-bold text-emerald-600 mb-6">{step.num}</div>
                <h3 className="text-2xl font-semibold mb-4">{step.title}</h3>
                <p className="text-slate-600">{step.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials ──────────────────────────────────────────────────────────
function Testimonials() {
  return (
    <section className="py-24 bg-zinc-950 text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <Reveal>
          <p className="uppercase text-emerald-400 text-sm font-semibold tracking-widest">Testimonials</p>
          <h2 className="text-5xl font-bold tracking-tight mt-3">Trusted by thousands</h2>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          {testimonials.map((t, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10">
                <div className="flex items-center gap-4 mb-8">
                  <img src={t.avatar} alt={t.name} className="w-14 h-14 rounded-2xl object-cover" />
                  <div>
                    <div className="font-semibold">{t.name}</div>
                    <div className="text-sm text-zinc-400">{t.role}</div>
                  </div>
                </div>
                <p className="text-zinc-300 italic leading-relaxed">“{t.text}”</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Feedback & CTA (kept from your original) ───────────────────────────────
function Feedback() {
  return (
    <section className="py-24 bg-[#fafaf8]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Satisfied */}
          <Reveal>
            <div className="bg-zinc-900 rounded-3xl p-12 text-white h-full flex flex-col">
              <div className="text-6xl mb-8">😊</div>
              <h3 className="text-4xl font-semibold mb-6">Satisfied?</h3>
              <p className="text-zinc-400 mb-10 flex-grow">Share your experience. A recommendation goes further than any advertisement.</p>
              <Link href="/signin" className="bg-emerald-600 hover:bg-emerald-500 px-8 py-4 rounded-2xl inline-flex items-center gap-3 w-fit">
                Share your story
                <ArrowRightIcon />
              </Link>
            </div>
          </Reveal>

          {/* Not Satisfied */}
          <Reveal delay={0.1}>
            <div className="bg-white rounded-3xl p-12 h-full flex flex-col border border-slate-200">
              <div className="text-6xl mb-8">😕</div>
              <h3 className="text-4xl font-semibold mb-6 text-zinc-900">Not satisfied?</h3>
              <p className="text-slate-600 mb-10 flex-grow">Tell us directly. Every piece of feedback makes the platform better.</p>
              <a href="mailto:tellus@smatway.com" className="text-red-600 hover:text-red-700 font-semibold underline">tellus@smatway.com</a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="bg-zinc-950 py-28 text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
        <Reveal>
          <h2 className="text-6xl font-bold tracking-tight">Ready to travel smarter?</h2>
          <p className="text-xl text-zinc-400 mt-6 max-w-2xl mx-auto">Join thousands who chose a better way to travel.</p>
        </Reveal>

        <Reveal delay={0.2} className="mt-12">
          <Link
            href="/signin"
            className="inline-flex items-center gap-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-lg px-12 py-5 rounded-2xl transition-all"
          >
            Create free account
            <ArrowRightIcon className="w-5 h-5" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <>
      <Hero />
      <Stats />
      <PopularRoutes />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Feedback />
      <CTA />
    </>
  );
}