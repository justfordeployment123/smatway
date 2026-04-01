// ─── Icons ────────────────────────────────────────────────────────────────────

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

function CheckCircleIcon() {
  return (
    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="m9 11 3 3L22 4" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  );
}

function CreditCardIcon() {
  return (
    <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ThumbsUpIcon() {
  return (
    <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 10v12" />
      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
    </svg>
  );
}

function ThumbsDownIcon() {
  return (
    <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 14V2" />
      <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z" />
    </svg>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const features = [
  {
    icon: <ShieldIcon />,
    title: "Verified & Safe",
    description: "Travel with confidence knowing all transporters are verified and insured for your safety.",
  },
  {
    icon: <CreditCardIcon />,
    title: "Secure Payments",
    description: "Pay safely through multiple secure payment methods.",
  },
  {
    icon: <ClockIcon />,
    title: "Real-Time Tracking",
    description: "Track your journey in real-time and share your trip details with family for peace of mind.",
  },
  {
    icon: <UsersIcon />,
    title: "Community Driven",
    description: "Read reviews from fellow travelers and make informed decisions about your journey.",
  },
];

const steps = [
  {
    num: "1",
    title: "Create Your Account",
    description: "Sign up in seconds with your phone number or email. Choose whether you're a traveler or transporter to get started.",
  },
  {
    num: "2",
    title: "Find or Post Routes",
    description: "Travelers can search and book available routes. Transporters can create routes and manage their vehicles.",
  },
  {
    num: "3",
    title: "Travel with Confidence",
    description: "Complete your journey safely with real-time tracking, secure payments, and 24/7 support whenever you need it.",
  },
];

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar() {
  return (
    <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-xl z-50 border-b border-slate-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">

          {/* Logo */}
          <div className="flex items-center space-x-2 md:space-x-3 cursor-pointer group">
            <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 p-2 md:p-2.5 rounded-xl shadow-lg group-hover:shadow-emerald-200 transition-all duration-300">
              <MapPinIcon className="w-5 h-5 md:w-7 md:h-7 text-white" />
            </div>
            <span className="text-xl md:text-3xl font-bold bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 bg-clip-text text-transparent">
              SmatWay
            </span>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center space-x-1">
            <button className="px-5 py-2.5 rounded-lg font-medium transition-all duration-200 text-emerald-600 bg-emerald-50">
              Home
            </button>
            <button className="px-5 py-2.5 rounded-lg font-medium transition-all duration-200 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50/50">
              About
            </button>
            <button className="px-5 py-2.5 rounded-lg font-medium transition-all duration-200 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50/50">
              How It Works
            </button>
            <div className="ml-4 pl-4 border-l border-slate-200">
              <button className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 hover:text-emerald-600 transition-colors">
                <GlobeIcon />
                Language
              </button>
            </div>
          </div>

          {/* CTA */}
          <div className="flex items-center space-x-2 md:space-x-4">
            <button className="hidden md:inline-flex items-center bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold px-5 py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-sm">
              Get Started
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/30 pt-32 pb-20 lg:pt-40 lg:pb-32">
      {/* Decorative blobs */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left */}
          <div className="space-y-8 lg:space-y-10">
            <div className="space-y-6">
              {/* Animated badge */}
              <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-5 py-2.5 rounded-full border border-emerald-200 shadow-sm">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <span className="text-sm font-semibold text-slate-700">
                  World&apos;s #1 Ride Sharing Platform
                </span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight tracking-tight">
                SmatWay, the right way to travel
              </h1>

              <p className="text-xl lg:text-2xl text-slate-600 leading-relaxed max-w-xl">
                Travel with verified transporters and affordable fares across the world
              </p>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center gap-6 text-sm">
              {["Verified & Safe", "Instant Booking", "24/7 Support"].map((item) => (
                <div key={item} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full" />
                  <span className="text-slate-700 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — floating image + cards */}
          <div className="relative lg:block hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-400/20 to-teal-400/20 rounded-[3rem] blur-3xl" />

            <div className="relative">
              <div className="absolute -top-8 -left-8 w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl rotate-12 opacity-80 blur-xl" />
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-3xl -rotate-12 opacity-80 blur-xl" />

              {/* Car card */}
              <div className="relative bg-gradient-to-br from-slate-100 to-slate-50 rounded-[3rem] p-8 shadow-2xl border border-slate-200/50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://purepng.com/public/uploads/large/purepng.com-hyundai-ioniq-white-carcarvehicletransporthyundai-961524653528qvh7u.png"
                  alt="White car - transport"
                  className="w-full h-auto drop-shadow-2xl"
                />
              </div>

              {/* Verified badge — top right */}
              <div className="absolute top-8 right-8 bg-white rounded-2xl shadow-xl p-4 border border-slate-200/50 backdrop-blur-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                    <CheckCircleIcon />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Verified</div>
                    <div className="text-xs text-slate-600">Safe &amp; Trusted</div>
                  </div>
                </div>
              </div>

              {/* Users badge — bottom left */}
              <div className="absolute bottom-8 left-8 bg-white rounded-2xl shadow-xl p-4 border border-slate-200/50 backdrop-blur-xl">
                <div className="flex items-center space-x-3">
                  <div className="flex -space-x-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="https://media.istockphoto.com/id/1437816897/photo/business-woman-manager-or-human-resources-portrait-for-career-success-company-we-are-hiring.jpg?s=612x612&w=0&k=20&c=tyLvtzutRh22j9GqSGI33Z4HpIwv9vL_MZw_xOE19NQ=" alt="User 1" className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="https://images.ctfassets.net/h6goo9gw1hh6/2sNZtFAWOdP1lmQ33VwRN3/24e953b920a9cd0ff2e1d587742a2472/1-intro-photo-final.jpg?w=1200&h=992&fl=progressive&q=70&fm=jpg" alt="User 2" className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="https://www.catholicsingles.com/wp-content/uploads/2020/06/blog-header-3.png" alt="User 3" className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">50K+</div>
                    <div className="text-xs text-slate-600">Happy Users</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────

function Features() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Built for Everyone</h2>
          <p className="text-xl text-slate-600">
            Whether you&apos;re traveling or transporting, we&apos;ve got features designed just for you
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="text-center p-6 rounded-xl bg-slate-50 hover:bg-white hover:shadow-xl transition-all duration-300 border border-slate-200 group"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl mb-4 text-emerald-600 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
              <div className="mb-3 min-h-12">
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
              <div className="flex justify-center gap-2 mt-4">
                <button className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-600 text-white">
                  For Travelers
                </button>
                <button className="px-3 py-1 rounded-full text-xs font-medium bg-slate-200 text-slate-600 hover:bg-slate-300 transition-colors">
                  For Transporters
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────

function HowItWorks() {
  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">How It Works</h2>
          <p className="text-xl text-slate-600">Get started in three simple steps</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.title} className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all">
              <div className="absolute -top-6 left-8">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {step.num}
                </div>
              </div>
              <div className="mt-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{step.title}</h3>
                <p className="text-slate-600 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Feedback ─────────────────────────────────────────────────────────────────

function Feedback() {
  return (
    <div className="py-16 px-4 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">We Value Your Feedback</h2>
          <p className="text-xl text-slate-600 font-medium">If satisfied, tell others. If not, tell us.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Satisfied */}
          <div className="bg-white rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300 border-2 border-emerald-200">
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full mb-6">
                <ThumbsUpIcon />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Satisfied?</h3>
              <p className="text-slate-600 mb-6">Share your positive experience with others</p>
            </div>
          </div>

          {/* Not Satisfied */}
          <div className="bg-white rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300 border-2 border-red-200">
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-red-500 to-red-600 rounded-full mb-6">
                <ThumbsDownIcon />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Not Satisfied?</h3>
              <p className="text-slate-600 mb-2">How may we serve you better?</p>
              <p className="text-slate-600">
                Message us:{" "}
                <a href="mailto:tellus@smatway.com" className="text-emerald-600 hover:underline">
                  tellus@smatway.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CTA ──────────────────────────────────────────────────────────────────────

function CTA() {
  return (
    <section className="py-20 bg-gradient-to-br from-emerald-600 to-teal-600 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl lg:text-5xl font-bold mb-6">Ready to Get Started?</h2>
        <p className="text-xl mb-8 opacity-90">
          Join thousands of travelers and transporters already using Smatway
        </p>
        <button className="bg-white text-emerald-600 px-10 py-5 rounded-xl text-lg font-semibold hover:bg-slate-50 transition-all shadow-lg hover:shadow-2xl transform hover:-translate-y-1">
          Get Started Today
        </button>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-lg">
                <MapPinIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Smatway</span>
            </div>
            <p className="text-slate-400">Connecting travelers and transporters across the World</p>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-slate-400">
              <li><a href="/about" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="/how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
            </ul>
          </div>

          {/* Legal */}
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Feedback />
      <CTA />
      <Footer />
    </div>
  );
}
