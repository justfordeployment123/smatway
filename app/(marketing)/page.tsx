"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "motion/react";

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

// ─── ImageLoadContext ─────────────────────────────────────────────────────────

const ImageLoadContext = React.createContext<((id: string) => void) | undefined>(undefined);

// ─── LazyImageContainer ───────────────────────────────────────────────────────
// Wraps images to shrink container while image loads, expanding when ready

function LazyImageContainer({
  children,
  aspectRatio = "aspect-[4/3]",
  className = "",
}: {
  children: React.ReactNode;
  aspectRatio?: string;
  className?: string;
}) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const imageIdRef = useRef<string>("");

  useEffect(() => {
    if (!imageIdRef.current) {
      imageIdRef.current = Math.random().toString(36).substring(2, 11);
    }
  }, []);

  const handleImageLoad = (id: string) => {
    if (id === imageIdRef.current) {
      setIsImageLoaded(true);
    }
  };

  return (
    <ImageLoadContext.Provider value={handleImageLoad}>
      <div
        className={`relative overflow-hidden transition-all duration-300 ease-out will-change-auto ${
          isImageLoaded ? aspectRatio : "h-auto"
        } ${className}`}
        style={{
          contentVisibility: "auto",
        }}
      >
        {children}
      </div>
    </ImageLoadContext.Provider>
  );
}

function SmartImage({
  src,
  alt,
  className,
  fallbackSrc,
}: {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc: string;
}) {
  const [resolvedSrc, setResolvedSrc] = useState(src);
  const imageIdRef = useRef<string>("");
  const onImageLoad = React.useContext(ImageLoadContext);

  useEffect(() => {
    if (!imageIdRef.current) {
      imageIdRef.current = Math.random().toString(36).substring(2, 11);
    }
  }, []);

  useEffect(() => {
    setResolvedSrc(src);
  }, [src]);

  const handleLoad = () => {
    onImageLoad?.(imageIdRef.current);
  };

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={resolvedSrc}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      fetchPriority="low"
      onLoad={handleLoad}
      onError={() => {
        if (resolvedSrc !== fallbackSrc) {
          setResolvedSrc(fallbackSrc);
        }
      }}
    />
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

function CheckIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 12 5 5L20 7" />
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

function PhoneIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  );
}

function RouteIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="19" r="3" />
      <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
      <circle cx="18" cy="5" r="3" />
    </svg>
  );
}

function TicketIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="M13 5v2" /><path d="M13 17v2" /><path d="M13 11v2" />
    </svg>
  );
}

// ─── Data (ALL IMAGE URLs VERIFIED & WORKING) ────────────────────────────────

const stats = [
  { value: "50K+", label: "Active travelers", icon: <UsersIcon className="w-6 h-6" /> },
  { value: "12K+", label: "Verified transporters", icon: <RouteIcon className="w-6 h-6" /> },
  { value: "4.9", label: "Average rating", suffix: "/5", icon: <StarIcon className="w-6 h-6" /> },
  { value: "98%", label: "On-time arrivals", icon: <ClockIcon className="w-6 h-6" /> },
];

const features = [
  {
    icon: <ShieldIcon className="w-7 h-7" />,
    title: "Verified & Safe",
    description: "Every transporter undergoes identity verification, license checks, and vehicle inspection before their first trip.",
    image: "https://images.unsplash.com/photo-1590012314607-cda9d9b699ae?w=600&h=400&fit=crop&q=80",
    imageAlt: "Driver identity verification process",
  },
  {
    icon: <CreditCardIcon className="w-7 h-7" />,
    title: "Secure Payments",
    description: "Funds held in escrow until your journey completes. Multiple payment methods, zero hidden fees.",
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&h=400&fit=crop&q=80",
    imageAlt: "Secure mobile payment transaction",
  },
  {
    icon: <ClockIcon className="w-7 h-7" />,
    title: "Real-Time Tracking",
    description: "Monitor your journey live. Share your trip link with family so they always know where you are.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop&q=80",
    imageAlt: "Real-time GPS tracking dashboard",
  },
  {
    icon: <UsersIcon className="w-7 h-7" />,
    title: "Community Driven",
    description: "Ratings and verified reviews from real passengers give you the clarity to choose confidently.",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop&q=80",
    imageAlt: "Community of people collaborating",
  },
];

const steps = [
  {
    num: "01",
    title: "Create your account",
    description: "Sign up with your phone or email in under a minute. Choose traveler or transporter.",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=500&h=600&fit=crop&q=80",
    imageAlt: "Person signing up on mobile phone",
  },
  {
    num: "02",
    title: "Find or post routes",
    description: "Search available routes by city and date. Transporters post schedules and set fares.",
    image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=500&h=600&fit=crop&q=80",
    imageAlt: "Map showing travel routes between cities",
  },
  {
    num: "03",
    title: "Travel with confidence",
    description: "Book, pay securely, track in real time. Rate your experience when you arrive.",
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500&h=600&fit=crop&q=80",
    imageAlt: "Happy travelers on an open road trip",
  },
];

const testimonials = [
  {
    name: "Sarah K.",
    role: "Frequent Traveler",
    text: "SmatWay changed intercity travel for me — verified drivers, real-time tracking, and I always know exactly what I'm paying.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&q=80",
  },
  {
    name: "Ahmed R.",
    role: "Fleet Owner",
    text: "Managing my fleet through SmatWay has been seamless. The booking system fills seats consistently, payments always on time.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80",
  },
  {
    name: "Maria L.",
    role: "Daily Commuter",
    text: "The real-time tracking gives my family peace of mind. I share my trip link every morning. That's priceless.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&q=80",
  },
];

const routes = [
  { from: "Lahore", to: "Islamabad", price: "PKR 1,500", time: "4h 30m", image: "https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?w=400&h=250&fit=crop&q=80" },
  { from: "Karachi", to: "Hyderabad", price: "PKR 800", time: "2h 45m", image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&h=250&fit=crop&q=80" },
  { from: "Islamabad", to: "Peshawar", price: "PKR 600", time: "2h 15m", image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop&q=80" },
  { from: "Multan", to: "Lahore", price: "PKR 1,200", time: "5h 00m", image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=250&fit=crop&q=80" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// HERO — Uses your uploaded car video (/car.mp4) + car.png as fallback
// ═══════════════════════════════════════════════════════════════════════════════

function Hero() {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [fallbackImageError, setFallbackImageError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaUnavailable = !videoLoaded && fallbackImageError;

  useEffect(() => {
    if (!videoLoaded) {
      return;
    }

    const video = videoRef.current;
    if (!video) {
      return;
    }

    const playPromise = video.play();
    if (playPromise) {
      playPromise.catch(() => {
        // Autoplay can still be blocked in some browsers; the poster/fallback remains visible.
      });
    }
  }, [videoLoaded]);

  return (
    <section className="relative overflow-hidden bg-[#fafaf8] pt-32 pb-24 lg:pt-40 lg:pb-32">
      <div className="absolute inset-0 grain" />
      <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-emerald-100/80 rounded-full blur-[120px] translate-x-1/4 -translate-y-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-100/30 rounded-full blur-[100px] -translate-x-1/4 translate-y-1/4 pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)", backgroundSize: "32px 32px" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left — content */}
          <div className="space-y-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2.5 bg-white/80 backdrop-blur-sm border border-emerald-200/50 px-4 py-2 rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[13px] font-medium text-slate-600 tracking-wide">Trusted by 50,000+ travelers across the world</span>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}>
              <h1 className="font-[var(--font-display)] text-[3.5rem] sm:text-[4.25rem] lg:text-[5rem] leading-[1.02] tracking-[-0.03em] text-zinc-900">
                Travel the way<br />
                <span className="relative inline-block">
                  <span className="text-emerald-600">it should be.</span>
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none" preserveAspectRatio="none">
                    <motion.path d="M2 8c50-6 100-6 150-2s100 2 146-4" stroke="rgba(16,185,129,0.3)" strokeWidth="3" strokeLinecap="round"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }} />
                  </svg>
                </span>
              </h1>
            </motion.div>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="text-[17px] text-slate-500 leading-[1.7] max-w-[44ch]">
              Connect with verified transporters. Book affordable routes across the world — safely, instantly, with full visibility every step of the way.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }} className="flex flex-wrap gap-x-8 gap-y-3">
              {["Verified drivers", "Live tracking", "24/7 support"].map((item, i) => (
                <motion.div key={item} className="flex items-center gap-2" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 + i * 0.08, duration: 0.5 }}>
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <CheckCircleIcon className="w-3 h-3 text-emerald-600" />
                  </div>
                  <span className="text-sm text-slate-600 font-medium">{item}</span>
                </motion.div>
              ))}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }} className="flex flex-wrap items-center gap-4">
              <Link href="/signin" className="group inline-flex items-center gap-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold px-7 py-3.5 rounded-2xl transition-all duration-200 active:scale-[0.98] shadow-[0_1px_2px_rgba(0,0,0,0.1),0_4px_12px_rgba(0,0,0,0.08)]">
                Start for free
                <ArrowRightIcon className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link href="/how-it-works" className="inline-flex items-center gap-2 text-zinc-600 font-medium px-2 py-3.5 hover:text-zinc-900 transition-colors duration-200 text-sm">
                <span className="underline underline-offset-4 decoration-slate-300 hover:decoration-slate-500 transition-colors">See how it works</span>
              </Link>
            </motion.div>
          </div>

          {/* Right — Car video hero */}
          <motion.div className="relative hidden lg:block" initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}>
            <div className="relative">
              <div className="relative bg-white rounded-[2rem] overflow-hidden shadow-[0_24px_80px_-12px_rgba(0,0,0,0.1)] border border-slate-200/60">
                <div
                  className={`relative bg-gradient-to-br from-slate-50 to-emerald-50/40 ${mediaUnavailable ? "min-h-[220px]" : "aspect-[4/3]"}`}
                >
                  {/* Your uploaded car-in-motion video */}
                  <video
                    ref={videoRef}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                    poster="/car.png"
                    onLoadedMetadata={() => setVideoLoaded(true)}
                    onCanPlay={() => setVideoLoaded(true)}
                    onPlaying={() => setVideoLoaded(true)}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${videoLoaded ? "opacity-100" : "opacity-0"}`}
                  >
                    <source src="/car1.mp4" type="video/mp4" />
                  </video>
                  {/* Fallback: your car.png while video loads */}
                  {!videoLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center p-6">
                      {fallbackImageError ? (
                        <div className="w-full h-full min-h-[180px] rounded-2xl border border-slate-200/70 bg-gradient-to-br from-slate-100 via-white to-emerald-50/60" />
                      ) : (
                        <div >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src="/car.png"
                            alt="SmatWay vehicle"
                            className="w-full h-full object-contain"
                            onLoad={() => setFallbackImageError(false)}
                            onError={() => setFallbackImageError(true)}
                          />
                        </div>
                      )}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />

                  {/* Live route overlay */}
                  <div className="absolute bottom-5 left-5 right-5 z-10">
                    <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/50">
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">Live Trip</span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">ETA 2h 15m</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center gap-0.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white shadow" />
                          <div className="w-px h-5 bg-emerald-300" />
                          <div className="w-2.5 h-2.5 rounded-full border-2 border-emerald-400 bg-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-bold text-zinc-900">Lahore</div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full my-1.5 overflow-hidden">
                            <motion.div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                              initial={{ width: "0%" }} animate={{ width: "62%" }} transition={{ duration: 2, delay: 1.2, ease: "easeOut" }} />
                          </div>
                          <div className="text-xs font-bold text-zinc-900">Islamabad</div>
                        </div>
                        <div className="text-right">
                          <div className="text-base font-bold text-zinc-900">62%</div>
                          <div className="text-[10px] text-slate-400">complete</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              <motion.div className="absolute -top-5 right-6 bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-slate-100 px-5 py-3.5 flex items-center gap-3 z-20"
                animate={{ y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CheckCircleIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-bold text-zinc-900">Verified</div>
                  <div className="text-xs text-slate-400 font-medium">Licensed & Inspected</div>
                </div>
              </motion.div>

              <motion.div className="absolute -bottom-5 left-6 bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-slate-100 px-5 py-3.5 flex items-center gap-3 z-20"
                animate={{ y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}>
                <div className="flex -space-x-1.5">
                  {[1, 2, 3, 4, 5].map((i) => <StarIcon key={i} className="w-4 h-4 text-amber-400" />)}
                </div>
                <div>
                  <div className="text-sm font-bold text-zinc-900">4.9/5</div>
                  <div className="text-xs text-slate-400 font-medium">12K+ reviews</div>
                </div>
              </motion.div>

              <div className="absolute top-1/2 -translate-y-1/2 -left-4 z-20">
                <motion.div
                  className="bg-white rounded-xl shadow-lg border border-slate-100 px-4 py-2.5 flex items-center gap-2 will-change-transform"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                >
                  <div className="flex -space-x-2">
                    {["https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=32&h=32&fit=crop&q=60",
                      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&q=60",
                      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&q=60"
                    ].map((src, i) => (
                      <SmartImage key={i} src={src} fallbackSrc="https://picsum.photos/seed/smatway-avatar-fallback/64/64" alt="Active traveler" className="w-7 h-7 rounded-full border-2 border-white object-cover" />
                    ))}
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-zinc-900">+2.4K</div>
                    <div className="text-slate-400">this week</div>
                  </div>
                </motion.div>
              </div>
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
    <section className="relative bg-zinc-950 border-y border-white/[0.06] overflow-hidden">
      <div className="absolute inset-0 grain" />
      <motion.div className="absolute -top-20 left-[10%] w-[350px] h-[350px] rounded-full pointer-events-none opacity-40 blur-[100px]"
        style={{ background: "radial-gradient(circle, rgba(16,185,129,0.5) 0%, transparent 70%)" }}
        animate={{ x: [0, 40, 0], scale: [1, 1.2, 1] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="absolute -bottom-16 right-[15%] w-[300px] h-[300px] rounded-full pointer-events-none opacity-30 blur-[90px]"
        style={{ background: "radial-gradient(circle, rgba(20,184,166,0.5) 0%, transparent 70%)" }}
        animate={{ x: [0, -30, 0], scale: [1.1, 0.9, 1.1] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/[0.06]">
          {stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.08} className="group cursor-pointer py-10 md:py-14 px-6 md:px-8 text-center rounded-2xl transition-all duration-300 hover:bg-white/[0.03] hover:-translate-y-1">
              <div className="mb-2 inline-flex items-center justify-center text-emerald-400">{stat.icon}</div>
              <div className="font-[var(--font-display)] text-3xl md:text-4xl text-white tracking-tight mb-1.5 group-hover:text-emerald-400 transition-colors duration-300">
                {stat.value}{stat.suffix && <span className="text-xl text-zinc-500">{stat.suffix}</span>}
              </div>
              <div className="text-sm text-zinc-400 font-medium">{stat.label}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Popular Routes ───────────────────────────────────────────────────────────

function PopularRoutes() {
  return (
    <section className="relative py-20 lg:py-28 bg-zinc-950 overflow-hidden">
      <div className="absolute inset-0 grain" />
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, #fff 2px, transparent 2px)", backgroundSize: "32px 32px" }} />
      <div className="mesh-1 absolute -top-32 right-[10%] w-[600px] h-[600px] rounded-full pointer-events-none opacity-30 blur-[100px]" style={{ background: "radial-gradient(circle, #10b981 0%, transparent 70%)" }} />
      <div className="mesh-2 absolute -bottom-24 -left-20 w-[500px] h-[500px] rounded-full pointer-events-none opacity-25 blur-[90px]" style={{ background: "radial-gradient(circle, #14b8a6 0%, transparent 70%)" }} />
      <div className="mesh-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full pointer-events-none opacity-10 blur-[80px]" style={{ background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)" }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="mb-12">
          <p className="text-sm font-semibold text-emerald-400 uppercase tracking-[0.15em] mb-4">Popular routes</p>
          <h2 className="font-[var(--font-display)] text-3xl md:text-4xl text-white tracking-tight leading-[1.1]">Where will you go next?</h2>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {routes.map((route, i) => (
            <Reveal key={route.from + route.to} delay={i * 0.08}>
              <motion.div className="group relative bg-white/5 backdrop-blur-sm rounded-3xl border border-white/8 overflow-hidden cursor-pointer hover:border-emerald-400/30 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-emerald-500/5"
                whileHover={{ y: -4 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
                <LazyImageContainer aspectRatio="h-36" className="rounded-t-3xl">
                  <div className="relative w-full h-full overflow-hidden">
                    <SmartImage src={route.image} fallbackSrc="https://picsum.photos/seed/smatway-route-fallback/800/500" alt={`${route.from} to ${route.to}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                    <div className="absolute bottom-3 left-4 flex items-center gap-1.5 text-white text-sm font-bold drop-shadow-md">
                      {route.from}
                      <svg className="w-4 h-4 text-white/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                      {route.to}
                    </div>
                  </div>
                </LazyImageContainer>
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ClockIcon className="w-4 h-4 text-zinc-500" />
                      <span className="text-xs text-zinc-400 font-medium">{route.time}</span>
                    </div>
                    <span className="text-sm font-bold text-emerald-400">{route.price}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Book now <ArrowRightIcon className="w-3 h-3" />
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

// ─── Features ─────────────────────────────────────────────────────────────────

function Features() {
  return (
    <section className="relative py-24 lg:py-32 bg-[#f5f7f4] overflow-hidden">
      <div className="absolute inset-0 grain" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(16,185,129,0.14),transparent_45%),radial-gradient(circle_at_85%_10%,rgba(20,184,166,0.14),transparent_42%),radial-gradient(circle_at_55%_90%,rgba(59,130,246,0.10),transparent_40%)]" />
      <div className="absolute inset-0 opacity-[0.18]" style={{ backgroundImage: "linear-gradient(rgba(15,23,42,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.08) 1px, transparent 1px)", backgroundSize: "56px 56px" }} />
      <motion.div
        className="absolute -top-44 -right-24 w-[760px] h-[760px] rounded-full pointer-events-none blur-[130px]"
        style={{ background: "radial-gradient(circle, rgba(16,185,129,0.22) 0%, rgba(16,185,129,0.05) 42%, transparent 72%)" }}
        animate={{ x: [0, 24, 0], y: [0, -18, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-28 -left-20 w-[560px] h-[560px] rounded-full pointer-events-none blur-[110px]"
        style={{ background: "radial-gradient(circle, rgba(20,184,166,0.18) 0%, rgba(20,184,166,0.04) 45%, transparent 72%)" }}
        animate={{ x: [0, -18, 0], y: [0, 16, 0], scale: [1.06, 0.96, 1.06] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="mb-16 max-w-2xl">
          <p className="text-sm font-semibold text-emerald-600 uppercase tracking-[0.15em] mb-4">Why SmatWay</p>
          <h2 className="font-[var(--font-display)] text-4xl md:text-5xl text-zinc-900 tracking-tight leading-[1.1] mb-5">Built for everyone<br />on the road</h2>
          <p className="text-[17px] text-slate-500 leading-relaxed">Whether you&apos;re heading to the next city or managing a fleet, every feature is designed around your safety and convenience.</p>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.1}>
              <motion.div className="group relative bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300"
                whileHover={{ y: -4 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
                <LazyImageContainer aspectRatio="h-48" className="rounded-t-3xl">
                  <div className="relative w-full h-full overflow-hidden">
                    <SmartImage src={f.image} fallbackSrc="https://picsum.photos/seed/smatway-feature-fallback/1000/700" alt={f.imageAlt} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
                    <div className="absolute -bottom-5 left-8 w-14 h-14 rounded-2xl bg-white shadow-lg border border-slate-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform duration-500">
                      {f.icon}
                    </div>
                  </div>
                </LazyImageContainer>
                <div className="p-8 pt-10 lg:p-10 lg:pt-12">
                  <h3 className="text-xl font-bold text-zinc-900 mb-3 tracking-tight">{f.title}</h3>
                  <p className="text-slate-500 text-[15px] leading-relaxed">{f.description}</p>
                  <div className="mt-6 flex items-center gap-2 text-emerald-600 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all">
                    Learn more <ArrowRightIcon className="w-3.5 h-3.5" />
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

// ─── App Preview (uses car.png in mockup) ─────────────────────────────────────

function AppPreview() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <section ref={ref} className="relative py-24 lg:py-32 bg-zinc-950 overflow-hidden">
      <div className="absolute inset-0 grain" />
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      <div className="mesh-1 absolute top-[-15%] left-[20%] w-[600px] h-[600px] rounded-full pointer-events-none opacity-20 blur-[110px]" style={{ background: "radial-gradient(circle, #10b981 0%, transparent 70%)" }} />
      <div className="mesh-3 absolute bottom-[-10%] right-[5%] w-[450px] h-[450px] rounded-full pointer-events-none opacity-15 blur-[90px]" style={{ background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)" }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <Reveal>
            <motion.div className="relative flex justify-center" style={{ y }}>
              <div className="relative">
                <div className="relative w-[280px] sm:w-[320px] bg-zinc-900 rounded-[3rem] p-3 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.2)]">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-zinc-900 rounded-b-3xl z-20" />
                  <div className="relative rounded-[2.3rem] overflow-hidden bg-gradient-to-b from-emerald-50 to-white aspect-[9/19.5]">
                    <div className="absolute inset-0 p-5 pt-12 flex flex-col">
                      <div className="text-center mb-4"><div className="text-zinc-400 text-[10px] font-medium">9:41</div></div>
                      <div className="mb-5">
                        <div className="text-lg font-bold text-zinc-900 mb-1">Good morning!</div>
                        <div className="text-xs text-slate-400">Where are you headed today?</div>
                      </div>
                      <div className="bg-white rounded-2xl border border-slate-200 p-3.5 mb-4 shadow-sm">
                        <div className="flex items-center gap-2">
                          <MapPinIcon className="w-4 h-4 text-emerald-500" />
                          <span className="text-xs text-slate-300">Search routes...</span>
                        </div>
                      </div>
                      <div className="bg-emerald-600 rounded-2xl p-4 mb-4 text-white">
                        <div className="text-[10px] font-semibold uppercase tracking-wider opacity-80 mb-2">Upcoming Trip</div>
                        <div className="text-sm font-bold mb-1">Lahore → Islamabad</div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] opacity-80">Tomorrow, 8:00 AM</span>
                          <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-lg">PKR 1,500</span>
                        </div>
                      </div>
                      <div className="bg-white rounded-2xl border border-slate-100 p-3 shadow-sm flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/car.png" alt="Vehicle" className="w-16 h-10 object-contain" />
                        <div className="flex-1">
                          <div className="text-[11px] font-bold text-zinc-900">Kamran A.</div>
                          <div className="flex items-center gap-1">
                            <StarIcon className="w-2.5 h-2.5 text-amber-400" />
                            <span className="text-[9px] text-slate-400">4.9 · Sedan</span>
                          </div>
                        </div>
                        <div className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">Assigned</div>
                      </div>
                    </div>
                  </div>
                </div>
                <motion.div className="absolute -right-16 top-1/4 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 w-52"
                  animate={{ y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center"><CheckCircleIcon className="w-4 h-4 text-emerald-600" /></div>
                    <div className="text-xs font-bold text-zinc-900">Booking Confirmed</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/car.png" alt="Vehicle" className="w-10 h-6 object-contain" />
                    <div>
                      <div className="text-xs font-medium text-zinc-700">White Sedan</div>
                      <div className="flex items-center gap-0.5"><StarIcon className="w-3 h-3 text-amber-400" /><span className="text-[10px] text-slate-400">4.9 · 1.2K trips</span></div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </Reveal>

          <div className="space-y-8">
            <Reveal>
              <p className="text-sm font-semibold text-emerald-400 uppercase tracking-[0.15em] mb-4">Mobile App</p>
              <h2 className="font-[var(--font-display)] text-4xl md:text-5xl text-white tracking-tight leading-[1.1] mb-5">Everything in<br />your pocket</h2>
              <p className="text-[17px] text-zinc-300 leading-relaxed max-w-[44ch]">Book rides, track journeys, manage payments, and rate transporters — all from our intuitive mobile app.</p>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="space-y-4">
                {[
                  { title: "Instant Notifications", desc: "Get real-time updates on bookings, driver assignments, and trip status." },
                  { title: "Offline Tickets", desc: "Download your booking confirmation — works even without internet." },
                  { title: "Family Sharing", desc: "Share your live trip link so loved ones can track you in real time." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-start p-4 rounded-2xl hover:bg-white/5 transition-colors duration-200">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5"><CheckIcon className="w-5 h-5 text-emerald-600" /></div>
                    <div>
                      <h4 className="text-sm font-bold text-white mb-1">{item.title}</h4>
                      <p className="text-sm text-zinc-400 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={0.25}>
              <div className="flex items-center gap-4 pt-4">
                <Link href="/signup" className="inline-flex items-center gap-2.5 bg-zinc-900 hover:bg-zinc-800 text-white px-5 py-3 rounded-xl transition-all duration-200 hover:-translate-y-0.5 cursor-pointer">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" /></svg>
                  <div className="text-left"><div className="text-[9px] leading-none opacity-70">Download on the</div><div className="text-sm font-semibold leading-tight">App Store</div></div>
                </Link>
                <Link href="/signin" className="inline-flex items-center gap-2.5 bg-zinc-900 hover:bg-zinc-800 text-white px-5 py-3 rounded-xl transition-all duration-200 hover:-translate-y-0.5 cursor-pointer">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302a1 1 0 0 1 0 1.38l-2.302 2.302L15.7 13.5l2-1.5-2-1.5 1.998-1.992zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z" /></svg>
                  <div className="text-left"><div className="text-[9px] leading-none opacity-70">Get it on</div><div className="text-sm font-semibold leading-tight">Google Play</div></div>
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────

function HowItWorks() {
  return (
    <section className="relative py-24 lg:py-32 bg-[#f4f7f3] overflow-hidden">
      <div className="absolute inset-0 grain" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_12%,rgba(16,185,129,0.18),transparent_44%),radial-gradient(circle_at_84%_22%,rgba(20,184,166,0.14),transparent_40%),radial-gradient(circle_at_55%_88%,rgba(59,130,246,0.10),transparent_42%)]" />
      <div className="absolute inset-0 opacity-[0.14]" style={{ backgroundImage: "linear-gradient(rgba(15,23,42,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.07) 1px, transparent 1px)", backgroundSize: "52px 52px" }} />
      <motion.div className="absolute top-[8%] left-[4%] w-[320px] h-[320px] rounded-full pointer-events-none opacity-[0.18] blur-[95px]"
        style={{ background: "radial-gradient(circle, rgba(16,185,129,0.6), transparent 70%)" }}
        animate={{ y: [0, -36, 0], x: [0, 24, 0], scale: [1, 1.08, 1] }} transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="absolute top-[38%] right-[7%] w-[260px] h-[260px] rounded-full pointer-events-none opacity-[0.14] blur-[80px]"
        style={{ background: "radial-gradient(circle, rgba(20,184,166,0.55), transparent 70%)" }}
        animate={{ y: [0, 28, 0], x: [0, -20, 0], scale: [0.98, 1.08, 0.98] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1.6 }} />
      <motion.div className="absolute bottom-[4%] left-[38%] w-[360px] h-[360px] rounded-full pointer-events-none opacity-[0.10] blur-[100px]"
        style={{ background: "radial-gradient(circle, rgba(59,130,246,0.45), transparent 70%)" }}
        animate={{ scale: [1, 1.18, 1], x: [0, -26, 0], y: [0, 10, 0] }} transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 0.8 }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="mb-16">
          <p className="text-sm font-semibold text-emerald-600 uppercase tracking-[0.15em] mb-4">How it works</p>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <h2 className="font-[var(--font-display)] text-4xl md:text-5xl text-zinc-900 tracking-tight leading-[1.1]">Three steps to go</h2>
            <Link href="/how-it-works" className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors whitespace-nowrap group">
              Full guide <ArrowRightIcon className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          <div className="hidden md:block absolute top-[12rem] left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px z-0 overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-slate-300 via-emerald-300 to-slate-300" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }}
              viewport={{ once: true }} transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }} style={{ transformOrigin: "left" }} />
          </div>
          {steps.map((step, i) => (
            <Reveal key={step.num} delay={0.15 + i * 0.15}>
              <motion.div className="group relative bg-white rounded-3xl border border-slate-200/70 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300"
                whileHover={{ y: -4 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
                <LazyImageContainer aspectRatio="h-44" className="rounded-t-3xl">
                  <div className="relative w-full h-full overflow-hidden">
                    <SmartImage src={step.image} fallbackSrc="https://picsum.photos/seed/smatway-step-fallback/1000/700" alt={step.imageAlt} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/30 to-transparent" />
                    <div className="absolute -bottom-4 left-8 z-10 w-12 h-12 rounded-2xl bg-zinc-950 flex items-center justify-center shadow-lg">
                      <span className="text-sm font-bold text-white font-mono">{step.num}</span>
                    </div>
                  </div>
                </LazyImageContainer>
                <div className="p-8 pt-10">
                  <h3 className="text-lg font-bold text-zinc-900 mb-3 tracking-tight">{step.title}</h3>
                  <p className="text-slate-500 text-[15px] leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Safety Banner ────────────────────────────────────────────────────────────

function SafetyBanner() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  return (
    <section ref={ref} className="relative overflow-hidden">
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        <LazyImageContainer aspectRatio="" className="w-full h-full">
          <SmartImage src="https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?w=1600&h=600&fit=crop&q=80" fallbackSrc="https://picsum.photos/seed/smatway-safety-fallback/1920/900" alt="Scenic highway at sunset" className="w-full h-full object-cover scale-110" />
        </LazyImageContainer>
      </motion.div>
      <div className="absolute inset-0 bg-zinc-950/70 backdrop-blur-sm" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <Reveal>
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full border border-white/10">
                <ShieldIcon className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">Safety First</span>
              </div>
              <h2 className="font-[var(--font-display)] text-4xl md:text-5xl text-white tracking-tight leading-[1.1]">Your safety is<br />non-negotiable</h2>
              <p className="text-zinc-300 text-[17px] leading-relaxed max-w-[44ch]">Every transporter on our platform is background-checked, vehicle-inspected, and continuously rated by fellow travelers.</p>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="grid grid-cols-2 gap-4">
              {[
                { num: "100%", label: "Background checks", desc: "CNIC & license verified" },
                { num: "24/7", label: "Support team", desc: "Always a call away" },
                { num: "GPS", label: "Live tracking", desc: "Share with family" },
                { num: "256-bit", label: "Encryption", desc: "Bank-grade security" },
              ].map((item, i) => (
                <motion.div key={item.label} className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 + i * 0.1 }}>
                  <div className="text-2xl font-bold text-emerald-400 mb-1">{item.num}</div>
                  <div className="text-sm font-semibold text-white mb-0.5">{item.label}</div>
                  <div className="text-xs text-zinc-400">{item.desc}</div>
                </motion.div>
              ))}
            </div>
          </Reveal>
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
      <motion.div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] rounded-full blur-[150px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)" }}
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }} />
      <div className="absolute inset-0 pointer-events-none opacity-[0.015]" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="mb-16 max-w-2xl">
          <p className="text-sm font-semibold text-emerald-400 uppercase tracking-[0.15em] mb-4">What people say</p>
          <h2 className="font-[var(--font-display)] text-4xl md:text-5xl text-white tracking-tight leading-[1.1]">Trusted by thousands</h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-fr">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.12}>
              <motion.div className="group relative h-full flex flex-col bg-white/[0.04] backdrop-blur-sm rounded-3xl border border-white/[0.06] p-8 lg:p-10 hover:bg-white/[0.07] hover:border-white/[0.1] transition-all duration-300"
                whileHover={{ y: -4 }} transition={{ duration: 0.3 }}>
                <QuoteIcon className="w-10 h-10 text-white mb-6" />
                <p className="text-[15px] text-zinc-300 leading-relaxed mb-8 group-hover:text-zinc-200 transition-colors duration-500 flex-grow">&ldquo;{t.text}&rdquo;</p>
                <div className="h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent mb-6" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <SmartImage src={t.avatar} fallbackSrc="https://picsum.photos/seed/smatway-testimonial-fallback/100/100" alt={t.name} className="w-11 h-11 rounded-2xl object-cover border-2 border-emerald-400/30" />
                    <div>
                      <div className="text-sm font-bold text-white">{t.name}</div>
                      <div className="text-xs text-zinc-500 font-medium">{t.role}</div>
                    </div>
                  </div>
                  <div className="flex gap-0.5">{Array.from({ length: t.rating }).map((_, j) => <StarIcon key={j} className="w-3.5 h-3.5 text-amber-400" />)}</div>
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
    <section className="relative py-24 lg:py-32 bg-zinc-950 overflow-hidden">
      <div className="absolute inset-0 grain" />
      <div className="absolute inset-0 bg-[linear-gradient(118deg,rgba(8,10,11,0.98)_0%,rgba(8,10,11,0.95)_34%,rgba(18,35,31,0.9)_48%,rgba(244,244,240,0.96)_56%,rgba(250,249,246,0.98)_100%)]" />
      <div
        className="absolute inset-0 opacity-[0.28]"
        style={{
          backgroundImage:
            "radial-gradient(120% 90% at 8% 14%, rgba(16,185,129,0.24) 0%, rgba(16,185,129,0.02) 45%, transparent 70%), radial-gradient(85% 70% at 90% 84%, rgba(248,113,113,0.2) 0%, rgba(248,113,113,0.02) 52%, transparent 76%), linear-gradient(120deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 36%), linear-gradient(300deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 42%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.42) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.42) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_48%,rgba(9,9,11,0.3)_100%)]" />
      <motion.div
        className="absolute -top-24 left-[6%] w-[520px] h-[520px] rounded-full pointer-events-none blur-[120px]"
        style={{ background: "radial-gradient(circle, rgba(16,185,129,0.28) 0%, rgba(16,185,129,0.08) 44%, transparent 74%)" }}
        animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-24 right-[6%] w-[540px] h-[540px] rounded-full pointer-events-none blur-[130px]"
        style={{ background: "radial-gradient(circle, rgba(248,113,113,0.24) 0%, rgba(248,113,113,0.06) 46%, transparent 74%)" }}
        animate={{ x: [0, -30, 0], y: [0, 20, 0], scale: [1.08, 0.94, 1.08] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 0.9 }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 w-[420px] h-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none blur-[110px]"
        style={{ background: "radial-gradient(circle, rgba(20,184,166,0.16) 0%, rgba(20,184,166,0.04) 42%, transparent 74%)" }}
        animate={{ scale: [0.95, 1.12, 0.95], opacity: [0.5, 0.7, 0.5] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
      />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-6 auto-rows-fr">
          <Reveal>
            <motion.div className="group relative h-full rounded-3xl p-[1px] bg-gradient-to-br from-emerald-500/30 via-transparent to-transparent hover:from-emerald-400/60 transition-all duration-500" whileHover={{ y: -6 }}>
              <div className="relative h-full flex flex-col justify-between rounded-3xl bg-zinc-950/90 backdrop-blur-xl p-10 lg:p-12 overflow-hidden">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-700"><div className="absolute -bottom-20 -right-20 w-[300px] h-[300px] bg-emerald-500/10 blur-[100px] rounded-full" /></div>
                <div className="relative z-10 w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center mb-8 group-hover:scale-110 transition duration-500">
                  <svg className="w-6 h-6 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7 10v12" /><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" /></svg>
                </div>
                <div className="flex-grow">
                  <h3 className="text-3xl font-semibold text-white mb-4 tracking-tight">Satisfied?</h3>
                  <p className="text-zinc-400 leading-relaxed mb-8 max-w-[36ch]">Share your experience. A recommendation goes further than any advertisement.</p>
                </div>
                <Link href="/signin" className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-600/20 hover:shadow-emerald-500/30">
                  Share your story <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </motion.div>
          </Reveal>
          <Reveal delay={0.1}>
            <motion.div className="group relative h-full rounded-3xl p-[1px] bg-gradient-to-br from-red-400/30 via-transparent to-transparent hover:from-red-400/60 transition-all duration-500" whileHover={{ y: -6 }}>
              <div className="relative h-full flex flex-col justify-between rounded-3xl bg-white p-10 lg:p-12 overflow-hidden">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-700"><div className="absolute -top-20 -left-20 w-[280px] h-[280px] bg-red-400/10 blur-[90px] rounded-full" /></div>
                <div className="relative z-10 w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-8 group-hover:scale-110 transition duration-500">
                  <svg className="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 14V2" /><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z" /></svg>
                </div>
                <div className="flex-grow">
                  <h3 className="text-3xl font-semibold text-zinc-900 mb-4 tracking-tight">Not satisfied?</h3>
                  <p className="text-slate-500 leading-relaxed mb-8 max-w-[36ch]">Tell us directly. Every piece of feedback makes the platform better for everyone.</p>
                </div>
                <a href="mailto:tellus@smatway.com" className="text-sm font-semibold text-red-500 hover:text-red-600 transition underline underline-offset-4 decoration-red-200 hover:decoration-red-400">tellus@smatway.com</a>
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
      <div className="absolute inset-0">
        <LazyImageContainer aspectRatio="" className="w-full h-full">
          <SmartImage src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&h=800&fit=crop&q=80" fallbackSrc="https://picsum.photos/seed/smatway-cta-fallback/1920/1080" alt="Open road" className="w-full h-full object-cover opacity-10" />
        </LazyImageContainer>
      </div>
      <motion.div className="absolute right-[-10%] top-[20%] w-[600px] h-[600px] rounded-full blur-[150px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.15, 1], x: [0, 20, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl">
          <Reveal><p className="text-emerald-400 text-sm font-semibold uppercase tracking-[0.15em] mb-6">Get started today</p></Reveal>
          <Reveal delay={0.1}><h2 className="font-[var(--font-display)] text-5xl lg:text-6xl text-white tracking-tight leading-[1.05] mb-6">Ready to travel<br />smarter?</h2></Reveal>
          <Reveal delay={0.2}><p className="text-[17px] text-zinc-400 leading-relaxed mb-12 max-w-[44ch]">Join thousands of travelers and transporters who moved away from uncertainty and chose a platform that works.</p></Reveal>
          <Reveal delay={0.3}>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/signin" className="group inline-flex items-center gap-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 active:scale-[0.97] shadow-[0_0_24px_rgba(16,185,129,0.2)] hover:shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                Create free account <ArrowRightIcon className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link href="/how-it-works" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white font-medium px-2 py-4 transition-colors duration-300 text-sm group">
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
      <PopularRoutes />
      <Features />
      <AppPreview />
      <HowItWorks />
      <SafetyBanner />
      <Testimonials />
      <Feedback />
      <CTA />
    </>
  );
}