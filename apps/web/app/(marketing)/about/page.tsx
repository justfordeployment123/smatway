// ─── Icons ────────────────────────────────────────────────────────────────────

function ArrowRightIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function SafetyIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

function AwardIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  );
}

function TrendingUpIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const values = [
  {
    icon: <SafetyIcon />,
    title: "Safety First",
    description: "Your safety is the baseline, not a feature. Every transporter is verified, every payment is protected.",
    dark: true,
  },
  {
    icon: <HeartIcon />,
    title: "Community Driven",
    description: "Built by travelers, for travelers. Real reviews from real passengers, not curated testimonials.",
    dark: false,
  },
  {
    icon: <AwardIcon />,
    title: "Quality Service",
    description: "We hold every interaction to a high standard — from booking to arrival.",
    dark: false,
  },
  {
    icon: <TrendingUpIcon />,
    title: "Innovation",
    description: "Technology should get out of your way. We build tools that work, not tools that impress.",
    dark: false,
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <div className="pt-16">

      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div>
              <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-4">About SmatWay</p>
              <h1 className="text-5xl lg:text-6xl font-bold text-zinc-900 tracking-tighter leading-tight mb-6">
                Connecting the world,<br />one journey at a time.
              </h1>
              <p className="text-lg text-slate-500 leading-relaxed max-w-[45ch]">
                SmatWay is a transportation platform that connects travelers with verified transporters. We make travel accessible, predictable, and safe — for everyone on the road.
              </p>
            </div>
            {/* Right — decorative stat grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "50K+", label: "Active users" },
                { value: "120+", label: "Cities covered" },
                { value: "98%", label: "Trip completion" },
                { value: "4.8", label: "Average rating" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <div className="text-3xl font-bold text-zinc-900 tracking-tight font-mono mb-1">{stat.value}</div>
                  <div className="text-sm text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Our Story ─────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1fr_2fr] gap-16 items-start">
            <div>
              <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-3">Our story</p>
              <h2 className="text-3xl font-bold text-zinc-900 tracking-tight leading-tight">
                Why we built this
              </h2>
            </div>
            <div className="space-y-6 text-slate-600 leading-relaxed">
              <p className="text-lg">
                SmatWay was built from a straightforward observation: finding reliable transport shouldn&apos;t require luck. We watched travelers settle for uncertain options while transporters struggled to fill seats — and saw a clear gap.
              </p>
              <p className="border-l-2 border-emerald-600 pl-5 text-slate-700 italic">
                &ldquo;The hardest part of any journey shouldn&apos;t be figuring out how to get there.&rdquo;
              </p>
              <p>
                Our platform bridges that gap by connecting verified transporters with travelers who need reliable, affordable transportation. We&apos;ve built a community grounded in trust, safety, and transparency — where both sides of a journey can operate with confidence.
              </p>
              <p>
                Since launch, we&apos;ve helped thousands of travelers reach their destinations safely while giving transporters a steady, manageable stream of bookings. Today, SmatWay continues to grow — connecting more communities and making travel easier for everyone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Mission & Vision ──────────────────────────────────────────────────── */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
            <div className="py-10 md:py-0 md:pr-12">
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-4">Mission</p>
              <h3 className="text-2xl font-bold text-zinc-900 tracking-tight mb-4">
                Make travel accessible, safe, and affordable for everyone.
              </h3>
              <p className="text-slate-500 leading-relaxed text-sm">
                We believe that where you&apos;re going shouldn&apos;t be limited by how hard it is to get there. Our mission is to remove the friction from transportation for people across the world.
              </p>
            </div>
            <div className="py-10 md:py-0 md:pl-12">
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-4">Vision</p>
              <h3 className="text-2xl font-bold text-zinc-900 tracking-tight mb-4">
                Become the world&apos;s most trusted transportation platform.
              </h3>
              <p className="text-slate-500 leading-relaxed text-sm">
                We&apos;re building toward a future where any person, in any city, can find a verified, affordable ride within minutes — and any transporter can run a sustainable business on our platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Our Values ────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-3">Our values</p>
            <h2 className="text-3xl font-bold text-zinc-900 tracking-tight">What we stand for</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Safety First — dark featured */}
            <div className="bg-zinc-950 rounded-2xl p-8 flex flex-col justify-between min-h-[200px]">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6">
                <SafetyIcon />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Safety First</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Your safety is the baseline, not a feature. Every transporter is verified, every payment protected.
                </p>
              </div>
            </div>

            {/* Stack: Community + Quality */}
            <div className="flex flex-col gap-5">
              <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm flex gap-4 items-start">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0 mt-0.5">
                  <HeartIcon />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-zinc-900 mb-1">Community Driven</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">Built by travelers, for travelers. Real reviews from real passengers.</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm flex gap-4 items-start">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0 mt-0.5">
                  <AwardIcon />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-zinc-900 mb-1">Quality Service</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">We hold every interaction to a high standard — from booking to arrival.</p>
                </div>
              </div>
            </div>

            {/* Innovation — full width horizontal */}
            <div className="md:col-span-2 bg-emerald-600 rounded-2xl p-8 flex items-center gap-8">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <TrendingUpIcon />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Innovation</h3>
                <p className="text-emerald-100 text-sm leading-relaxed max-w-[55ch]">
                  Technology should get out of your way. We build tools that work — not tools that impress. Every feature we ship makes a real journey easier.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Join CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl">
            <p className="text-emerald-400 text-sm font-semibold uppercase tracking-wider mb-4">Join us</p>
            <h2 className="text-4xl font-bold text-white tracking-tighter leading-tight mb-5">
              Be part of a growing community.
            </h2>
            <p className="text-zinc-400 text-base leading-relaxed mb-8">
              Thousands of travelers and transporters have already switched to a platform built around trust and transparency.
            </p>
            <a
              href="/signin"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 active:scale-[0.98]"
            >
              Get started today
              <ArrowRightIcon />
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
