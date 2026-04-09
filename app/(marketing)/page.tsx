// ─── Icons ────────────────────────────────────────────────────────────────────

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
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  );
}

function CreditCardIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ThumbsUpIcon() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 10v12" />
      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
    </svg>
  );
}

function ThumbsDownIcon() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 14V2" />
      <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z" />
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

// ─── Data ─────────────────────────────────────────────────────────────────────

const features = [
  { icon: <ShieldIcon />, title: "Verified & Safe", description: "Travel with confidence knowing all transporters are verified and insured for your safety.", featured: true },
  { icon: <CreditCardIcon />, title: "Secure Payments", description: "Pay safely through multiple secure payment methods with encrypted transactions.", featured: false },
  { icon: <ClockIcon />, title: "Real-Time Tracking", description: "Track your journey in real-time and share your trip details with family for peace of mind.", featured: false },
  { icon: <UsersIcon />, title: "Community Driven", description: "Read reviews from fellow travelers and make informed decisions about your journey.", featured: true },
];

const steps = [
  { num: "01", title: "Create Your Account", description: "Sign up in seconds with your phone number or email. Choose whether you're a traveler or transporter to get started." },
  { num: "02", title: "Find or Post Routes", description: "Travelers can search and book available routes. Transporters can create routes and manage their vehicles." },
  { num: "03", title: "Travel with Confidence", description: "Complete your journey safely with real-time tracking, secure payments, and 24/7 support whenever you need it." },
];

// ─── Sections ─────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gray-50 pt-28 pb-20 lg:pt-36 lg:pb-28">
      {/* Decorative blobs */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-emerald-100/40 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-teal-100/30 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <div className="space-y-8 lg:space-y-10">
            <div className="space-y-6">
              {/* Badge */}
              <div
                className="animate-fade-in-up inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200/50 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]"
                style={{ animationDelay: "0ms" }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-xs font-semibold text-slate-600 tracking-wide uppercase">
                  World&apos;s #1 Ride Sharing Platform
                </span>
              </div>

              {/* Heading */}
              <h1
                className="animate-fade-in-up text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter leading-none text-zinc-900"
                style={{ animationDelay: "100ms" }}
              >
                SmatWay, the right way to travel
              </h1>

              {/* Subtext */}
              <p
                className="animate-fade-in-up text-base text-slate-600 leading-relaxed max-w-[65ch]"
                style={{ animationDelay: "200ms" }}
              >
                Travel with verified transporters and affordable fares across the world.
                Book your ride in seconds, track in real-time, arrive safely.
              </p>
            </div>

            {/* Trust badges */}
            <div
              className="animate-fade-in-up flex flex-wrap items-center gap-6 text-sm"
              style={{ animationDelay: "300ms" }}
            >
              {["Verified & Safe", "Instant Booking", "24/7 Support"].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />
                  <span className="text-slate-600 font-medium">{item}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div
              className="animate-fade-in-up"
              style={{ animationDelay: "400ms" }}
            >
              <a
                href="/signin"
                className="inline-flex items-center gap-2 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold px-7 py-3.5 rounded-xl transition-all duration-200 text-sm active:scale-[0.98] active:-translate-y-[1px]"
              >
                Get Started Free
                <ArrowRightIcon />
              </a>
            </div>
          </div>

          {/* Right visual */}
          <div className="relative hidden lg:block">
            <div className="absolute inset-0 bg-linear-to-tr from-emerald-200/20 to-teal-200/20 rounded-[3rem] blur-3xl" />
            <div className="relative">
              {/* Decorative shapes */}
              <div className="absolute -top-8 -left-8 w-24 h-24 bg-linear-to-br from-emerald-400/30 to-teal-500/30 rounded-2xl rotate-12 blur-xl" />
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-linear-to-br from-teal-400/30 to-emerald-500/30 rounded-3xl -rotate-12 blur-xl" />

              {/* Main image container */}
              <div className="relative bg-linear-to-br from-slate-100 to-slate-50 rounded-[3rem] p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-200/50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://purepng.com/public/uploads/large/purepng.com-hyundai-ioniq-white-carcarvehicletransporthyundai-961524653528qvh7u.png"
                  alt="White car - transport"
                  className="w-full h-auto drop-shadow-2xl"
                />
              </div>

              {/* Verified floating card */}
              <div className="animate-float absolute top-8 right-8 bg-white rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] p-4 border border-slate-200/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-linear-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                    <CheckCircleIcon />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-zinc-900">Verified</div>
                    <div className="text-xs text-slate-500">Safe &amp; Trusted</div>
                  </div>
                </div>
              </div>

              {/* Users floating card */}
              <div className="animate-float absolute bottom-8 left-8 bg-white rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] p-4 border border-slate-200/50" style={{ animationDelay: "1s" }}>
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="https://picsum.photos/seed/rider1/100/100" alt="User" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="https://picsum.photos/seed/rider2/100/100" alt="User" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="https://picsum.photos/seed/rider3/100/100" alt="User" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-zinc-900">50K+</div>
                    <div className="text-xs text-slate-500">Happy Users</div>
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

function Features() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header - left aligned */}
        <div className="mb-16 max-w-2xl">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter leading-none text-zinc-900 mb-4">
            Built for Everyone
          </h2>
          <p className="text-base text-slate-600 leading-relaxed max-w-[65ch]">
            Whether you&apos;re traveling or transporting, we&apos;ve got features designed just for you.
          </p>
        </div>

        {/* Asymmetric grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Row 1: Featured (2 cols) + Regular (1 col) */}
          <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200/50 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] p-8 animate-fade-in-up" style={{ animationDelay: "0ms" }}>
            <div className="rounded-xl bg-emerald-50 p-3 w-12 h-12 flex items-center justify-center text-emerald-600">
              {features[0].icon}
            </div>
            <h3 className="text-xl font-semibold text-zinc-900 mt-4 mb-2">{features[0].title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed max-w-md">{features[0].description}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/50 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] p-8 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            <div className="rounded-xl bg-emerald-50 p-3 w-12 h-12 flex items-center justify-center text-emerald-600">
              {features[1].icon}
            </div>
            <h3 className="text-xl font-semibold text-zinc-900 mt-4 mb-2">{features[1].title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{features[1].description}</p>
          </div>

          {/* Row 2: Regular (1 col) + Featured (2 cols) */}
          <div className="bg-white rounded-2xl border border-slate-200/50 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] p-8 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            <div className="rounded-xl bg-emerald-50 p-3 w-12 h-12 flex items-center justify-center text-emerald-600">
              {features[2].icon}
            </div>
            <h3 className="text-xl font-semibold text-zinc-900 mt-4 mb-2">{features[2].title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{features[2].description}</p>
          </div>
          <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200/50 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] p-8 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
            <div className="rounded-xl bg-emerald-50 p-3 w-12 h-12 flex items-center justify-center text-emerald-600">
              {features[3].icon}
            </div>
            <h3 className="text-xl font-semibold text-zinc-900 mt-4 mb-2">{features[3].title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed max-w-md">{features[3].description}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header - left aligned */}
        <div className="mb-16 max-w-2xl">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter leading-none text-zinc-900 mb-4">
            How It Works
          </h2>
          <p className="text-base text-slate-600 leading-relaxed max-w-[65ch]">
            Get started in three simple steps. No complicated setup, no hidden fees.
          </p>
        </div>

        {/* Stacked timeline cards */}
        <div className="relative max-w-3xl">
          {/* Vertical connector line */}
          <div className="absolute left-8 top-16 bottom-16 w-px bg-slate-200 hidden md:block" />

          <div className="space-y-8">
            {steps.map((step, index) => (
              <div
                key={step.num}
                className="animate-fade-in-up relative"
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <div className="bg-white rounded-2xl border border-slate-200/50 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] p-8 pl-24 md:pl-28 relative overflow-hidden">
                  {/* Large decorative number */}
                  <span className="absolute -left-2 top-1/2 -translate-y-1/2 text-7xl md:text-8xl font-black text-emerald-50 select-none pointer-events-none leading-none">
                    {step.num}
                  </span>

                  {/* Content */}
                  <div className="relative z-10">
                    <h3 className="text-xl font-semibold text-zinc-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed max-w-lg">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Feedback() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header - left aligned */}
        <div className="mb-16 max-w-2xl">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter leading-none text-zinc-900 mb-4">
            We Value Your Feedback
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            If satisfied, tell others. If not, tell us.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          {/* Satisfied - dark premium card */}
          <div className="bg-emerald-950 rounded-2xl p-8 border border-emerald-900/50 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)]">
            <div className="text-emerald-400 mb-6">
              <ThumbsUpIcon />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Satisfied?</h3>
            <p className="text-sm text-emerald-200/70 leading-relaxed">
              Share your positive experience with others and help the community grow.
            </p>
          </div>

          {/* Not satisfied - white card with red accent */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200/50 border-l-4 border-l-red-400 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]">
            <div className="text-red-500 mb-6">
              <ThumbsDownIcon />
            </div>
            <h3 className="text-xl font-semibold text-zinc-900 mb-2">Not Satisfied?</h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-3">
              How may we serve you better?
            </p>
            <a
              href="mailto:tellus@smatway.com"
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors duration-200"
            >
              tellus@smatway.com
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="relative overflow-hidden bg-zinc-950 py-24 lg:py-32">
      {/* Decorative emerald orb */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-24 -translate-y-1/2 w-48 h-48 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-5xl lg:text-6xl font-bold tracking-tighter leading-none text-white mb-6">
              Ready to<br />
              get started?
            </h2>
            <p className="text-base text-slate-400 leading-relaxed max-w-md mb-8">
              Join thousands of travelers and transporters already using SmatWay every day.
            </p>
            <a
              href="/signin"
              className="inline-flex items-center gap-2 bg-white text-zinc-900 font-semibold px-7 py-3.5 rounded-xl transition-all duration-200 text-sm hover:bg-slate-100 active:scale-[0.98] active:-translate-y-[1px]"
            >
              Get Started Today
              <ArrowRightIcon />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

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
