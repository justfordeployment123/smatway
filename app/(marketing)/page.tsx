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

// ─── Data ──────────────────────────────────────────────────────────────────────

const features = [
  {
    icon: <ShieldIcon />,
    title: "Verified & Safe",
    description: "Every transporter goes through identity verification, license checks, and vehicle inspection before their first trip.",
    featured: true,
  },
  {
    icon: <CreditCardIcon />,
    title: "Secure Payments",
    description: "Funds held in escrow until your journey completes. Multiple payment methods, zero hidden fees.",
    featured: false,
  },
  {
    icon: <ClockIcon />,
    title: "Real-Time Tracking",
    description: "Monitor your journey live. Share your trip link with family so they always know where you are.",
    featured: false,
  },
  {
    icon: <UsersIcon />,
    title: "Community Driven",
    description: "Ratings and verified reviews from real passengers give you the clarity to choose confidently.",
    featured: true,
  },
];

const steps = [
  {
    num: "01",
    title: "Create your account",
    description: "Sign up with your phone or email in under a minute. Choose your role — traveler or transporter — and you're ready.",
  },
  {
    num: "02",
    title: "Find or post routes",
    description: "Travelers search available routes by city and date. Transporters post schedules, set fares, and manage their fleet.",
  },
  {
    num: "03",
    title: "Travel with confidence",
    description: "Book, pay securely, and track your journey in real time. Rate your experience when you arrive.",
  },
];

// ─── Sections ──────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gray-50 pt-28 pb-20 lg:pt-36 lg:pb-28">
      {/* Subtle background blobs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-50 rounded-full blur-3xl opacity-60 translate-x-1/3 -translate-y-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-50 rounded-full blur-3xl opacity-50 -translate-x-1/4 translate-y-1/4 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left — content */}
          <div className="space-y-8">
            {/* Badge */}
            <div
              className="animate-fade-in-up inline-flex items-center gap-2 bg-white border border-emerald-200/60 px-4 py-2 rounded-full shadow-sm"
              style={{ animationDelay: "0ms" }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-sm font-medium text-slate-700">Trusted by 50,000+ travelers</span>
            </div>

            {/* Headline */}
            <div
              className="animate-fade-in-up"
              style={{ animationDelay: "80ms" }}
            >
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-zinc-900 leading-[1.05] tracking-tighter">
                The right way<br />
                <span className="text-emerald-600">to travel.</span>
              </h1>
            </div>

            {/* Subtext */}
            <p
              className="animate-fade-in-up text-lg text-slate-500 leading-relaxed max-w-[42ch]"
              style={{ animationDelay: "160ms" }}
            >
              Connect with verified transporters and book affordable routes across the world — safely, instantly, with full visibility.
            </p>

            {/* Trust items */}
            <div
              className="animate-fade-in-up flex flex-wrap gap-x-6 gap-y-3"
              style={{ animationDelay: "240ms" }}
            >
              {["Verified & Safe", "Instant Booking", "24/7 Support"].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="text-sm text-slate-600 font-medium">{item}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div
              className="animate-fade-in-up flex flex-wrap gap-4"
              style={{ animationDelay: "320ms" }}
            >
              <a
                href="/signin"
                className="inline-flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 active:scale-[0.98]"
              >
                Start for free
                <ArrowRightIcon />
              </a>
              <a
                href="/how-it-works"
                className="inline-flex items-center gap-2 bg-white border border-slate-200 text-zinc-900 font-medium px-6 py-3 rounded-xl hover:bg-gray-50 transition-all duration-200 text-sm"
              >
                See how it works
              </a>
            </div>
          </div>

          {/* Right — visual */}
          <div className="relative hidden lg:block">
            <div className="relative">
              {/* Car card */}
              <div className="relative bg-white rounded-[2.5rem] p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] border border-slate-200/50 overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-br from-emerald-50/40 to-transparent pointer-events-none" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://purepng.com/public/uploads/large/purepng.com-hyundai-ioniq-white-carcarvehicletransporthyundai-961524653528qvh7u.png"
                  alt="SmatWay vehicle"
                  className="w-full h-auto drop-shadow-xl relative z-10"
                />
              </div>

              {/* Verified badge — floats */}
              <div className="animate-float absolute -top-4 right-4 bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-slate-200/50 px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 bg-linear-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CheckCircleIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-zinc-900">Verified</div>
                  <div className="text-xs text-slate-400">Safe &amp; Trusted</div>
                </div>
              </div>

              {/* Users badge — floats with delay */}
              <div
                className="animate-float absolute -bottom-4 left-4 bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-slate-200/50 px-4 py-3 flex items-center gap-3"
                style={{ animationDelay: "1.5s" }}
              >
                <div className="flex -space-x-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://picsum.photos/seed/traveler1/40/40" alt="" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://picsum.photos/seed/traveler2/40/40" alt="" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://picsum.photos/seed/traveler3/40/40" alt="" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-zinc-900">50K+</div>
                  <div className="text-xs text-slate-400">Active users</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header — left aligned */}
        <div className="mb-14 max-w-2xl">
          <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-3">Why SmatWay</p>
          <h2 className="text-4xl font-bold text-zinc-900 tracking-tight leading-tight mb-4">
            Built for everyone on the road
          </h2>
          <p className="text-lg text-slate-500 leading-relaxed">
            Whether you&apos;re heading to the next city or running a fleet, every feature is designed around your safety and convenience.
          </p>
        </div>

        {/* Asymmetric grid: featured dark + regular + regular + featured emerald */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Featured: Verified & Safe — spans 2 cols */}
          <div className="md:col-span-2 bg-zinc-950 text-white rounded-2xl p-8 flex flex-col justify-between min-h-[200px] ring-1 ring-zinc-800">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5">
              <ShieldIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Verified &amp; Safe</h3>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-[40ch]">
                Every transporter undergoes identity verification, license checks, and vehicle inspection before their first trip.
              </p>
            </div>
          </div>

          {/* Regular: Secure Payments */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between min-h-[200px]">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-5">
              <CreditCardIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 mb-2">Secure Payments</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Funds held in escrow until your journey completes. Multiple methods, zero hidden fees.
              </p>
            </div>
          </div>

          {/* Regular: Real-Time Tracking */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between min-h-[200px]">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-5">
              <ClockIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 mb-2">Real-Time Tracking</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Monitor your journey live. Share your trip link with family so they always know where you are.
              </p>
            </div>
          </div>

          {/* Featured: Community Driven — spans 2 cols */}
          <div className="md:col-span-2 bg-emerald-600 text-white rounded-2xl p-8 flex flex-col justify-between min-h-[200px] ring-1 ring-emerald-500">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-5">
              <UsersIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Community Driven</h3>
              <p className="text-emerald-100 text-sm leading-relaxed max-w-[40ch]">
                Ratings and verified reviews from real passengers give you the clarity to choose confidently every time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="py-16 bg-gray-50 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-3">How it works</p>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <h2 className="text-3xl font-bold text-zinc-900 tracking-tight leading-tight">
              Up and running in three steps
            </h2>
            <a
              href="/how-it-works"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors whitespace-nowrap"
            >
              Full guide
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Steps — horizontal cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map((step, i) => (
            <div
              key={step.num}
              className="animate-fade-in-up bg-white rounded-2xl border border-slate-200 shadow-sm p-7"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="w-10 h-10 rounded-xl bg-zinc-950 flex items-center justify-center mb-5">
                <span className="text-sm font-bold text-white font-mono">{step.num}</span>
              </div>
              <h3 className="text-base font-semibold text-zinc-900 mb-2 tracking-tight">{step.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Feedback() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-5 items-start">
          {/* Left — satisfied */}
          <div className="bg-zinc-950 rounded-2xl p-10 flex flex-col justify-between min-h-[260px]">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-6">
              <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 10v12" /><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white tracking-tight mb-3">Satisfied?</h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-6 max-w-[32ch]">
                Share your experience. A recommendation goes further than any advertisement.
              </p>
              <a
                href="/signin"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors active:scale-[0.98]"
              >
                Share your story
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Right — not satisfied */}
          <div className="bg-gray-50 rounded-2xl p-10 border border-slate-200/60 border-l-4 border-l-red-400 flex flex-col justify-between min-h-[260px]">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center mb-6">
              <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 14V2" /><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-zinc-900 tracking-tight mb-3">Not satisfied?</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-4 max-w-[32ch]">
                Tell us directly. Every piece of feedback makes the platform better for everyone.
              </p>
              <a href="mailto:tellus@smatway.com" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
                tellus@smatway.com →
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
    <section className="relative overflow-hidden bg-zinc-950 py-24">
      {/* Decorative emerald glow */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute left-1/4 bottom-0 w-[300px] h-[300px] bg-teal-600/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-emerald-400 text-sm font-semibold uppercase tracking-wider mb-4">Get started today</p>
          <h2 className="text-5xl lg:text-6xl font-bold text-white tracking-tighter leading-tight mb-6">
            Ready to travel<br />smarter?
          </h2>
          <p className="text-lg text-zinc-400 leading-relaxed mb-10 max-w-[40ch]">
            Join thousands of travelers and transporters who moved away from uncertainty and chose a platform that works.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="/signin"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-7 py-3.5 rounded-xl transition-all duration-200 active:scale-[0.98]"
            >
              Create free account
              <ArrowRightIcon />
            </a>
            <a
              href="/how-it-works"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white font-medium px-7 py-3.5 rounded-xl transition-all duration-200 text-sm border border-white/10"
            >
              Learn how it works
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
      <Features />
      <HowItWorks />
      <Feedback />
      <CTA />
    </>
  );
}
