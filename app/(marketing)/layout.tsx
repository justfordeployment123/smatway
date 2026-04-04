"use client";

import { usePathname } from "next/navigation";

function MapPinIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

const navLinks = [
  { href: "/",            label: "Home" },
  { href: "/about",       label: "About" },
  { href: "/how-it-works", label: "How It Works" },
];

function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-xl z-50 border-b border-slate-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">

          {/* Logo */}
          <a href="/" className="flex items-center space-x-2 md:space-x-3 cursor-pointer group">
            <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 p-2 md:p-2.5 rounded-xl shadow-lg group-hover:shadow-emerald-200 transition-all duration-300">
              <MapPinIcon className="w-5 h-5 md:w-7 md:h-7 text-white" />
            </div>
            <span className="text-xl md:text-3xl font-bold bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 bg-clip-text text-transparent">
              SmatWay
            </span>
          </a>

          {/* Nav links */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                    active
                      ? "text-emerald-600 bg-emerald-50"
                      : "text-slate-600 hover:text-emerald-600 hover:bg-emerald-50/50"
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
            <div className="ml-4 pl-4 border-l border-slate-200">
              <button className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 hover:text-emerald-600 transition-colors">
                <GlobeIcon />
                Language
              </button>
            </div>
          </div>

          {/* CTA */}
          <div className="flex items-center space-x-2 md:space-x-4">
            <a href="/signin" className="hidden md:inline-flex items-center bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold px-5 py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-sm">
              Get Started
            </a>
          </div>

        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-lg">
                <MapPinIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Smatway</span>
            </div>
            <p className="text-slate-400">Connecting travelers and transporters across the World</p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-slate-400">
              <li><a href="/about" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="/how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <a href="https://res.cloudinary.com/dge3lt4u6/image/upload/v1766858233/Terms_of_use_and_condition_of_service_y3gdjj.pdf" target="_blank" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="https://res.cloudinary.com/dge3lt4u6/image/upload/v1766858233/Terms_of_use_and_condition_of_service_y3gdjj.pdf" target="_blank" className="hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 text-center text-slate-400">
          <p>© 2024 SmatWay. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}
