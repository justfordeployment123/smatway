"use client";

import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";

function MapPinIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function GlobeIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function ChevronDownIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/how-it-works", label: "How It Works" },
];

const languages = [
  { code: "en", label: "English" },
  { code: "ar", label: "Arabic" },
  { code: "pt", label: "Portuguese" },
  { code: "fr", label: "French" },
];

function LanguageDropdown() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(languages[0]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-zinc-900 hover:bg-slate-50 transition-all duration-200"
      >
        <GlobeIcon className="w-4 h-4" />
        <span className="hidden sm:inline">{selected.label}</span>
        <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="animate-dropdown-in absolute right-0 top-full mt-2 w-44 bg-white rounded-2xl border border-slate-200/80 shadow-[0_12px_40px_rgba(0,0,0,0.08)] py-2 z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setSelected(lang);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors duration-150 flex items-center justify-between ${
                selected.code === lang.code
                  ? "text-emerald-600 font-semibold bg-emerald-50/50"
                  : "text-slate-600 hover:bg-slate-50 hover:text-zinc-900"
              }`}
            >
              {lang.label}
              {selected.code === lang.code && (
                <svg className="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m5 12 5 5L20 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-xl z-50 border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5 cursor-pointer group">
            <div className="bg-linear-to-br from-emerald-500 via-emerald-600 to-teal-600 p-2 md:p-2.5 rounded-xl transition-all duration-300">
              <MapPinIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <span className="text-xl md:text-2xl font-bold text-zinc-900 tracking-tight">
              SmatWay
            </span>
          </a>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 font-medium text-sm transition-colors duration-200 ${
                    active
                      ? "text-emerald-600"
                      : "text-slate-500 hover:text-zinc-900"
                  }`}
                >
                  {link.label}
                  {active && (
                    <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-emerald-600 rounded-full" />
                  )}
                </a>
              );
            })}
          </div>

          {/* Right side: Language + CTA */}
          <div className="flex items-center gap-2">
            <LanguageDropdown />
            <a
              href="/signin"
              className="hidden md:inline-flex items-center gap-2 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 text-sm active:scale-[0.98]"
            >
              Get Started
              <ArrowRightIcon />
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="bg-zinc-950 text-white">
      {/* Gradient strip */}
      <div className="h-px bg-linear-to-r from-transparent via-slate-300 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="bg-linear-to-br from-emerald-500 to-teal-600 p-2 rounded-lg">
                <MapPinIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">SmatWay</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Connecting travelers and transporters across the World. Safe, reliable, affordable.
            </p>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-slate-300 mb-5">
              Company
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="/about" className="text-slate-400 hover:text-white transition-colors duration-200 text-sm">
                  About Us
                </a>
              </li>
              <li>
                <a href="/how-it-works" className="text-slate-400 hover:text-white transition-colors duration-200 text-sm">
                  How It Works
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-slate-300 mb-5">
              Legal
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://res.cloudinary.com/dge3lt4u6/image/upload/v1766858233/Terms_of_use_and_condition_of_service_y3gdjj.pdf"
                  target="_blank"
                  className="text-slate-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="https://res.cloudinary.com/dge3lt4u6/image/upload/v1766858233/Terms_of_use_and_condition_of_service_y3gdjj.pdf"
                  target="_blank"
                  className="text-slate-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          {/* Contact placeholder */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-slate-300 mb-5">
              Get in Touch
            </h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              Questions or feedback?<br />
              <a href="mailto:tellus@smatway.com" className="text-emerald-400 hover:text-emerald-300 transition-colors duration-200">
                tellus@smatway.com
              </a>
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-linear-to-r from-transparent via-slate-800 to-transparent" />

        {/* Bottom */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">&copy; {new Date().getFullYear()} SmatWay. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-gray-50" style={{ scrollBehavior: "smooth" }}>
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}
