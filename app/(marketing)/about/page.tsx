// ─── Icons ────────────────────────────────────────────────────────────────────

function SafetyIcon() {
  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

function AwardIcon() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  );
}

function TrendingUpIcon() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gray-50 pt-32 pb-20 overflow-hidden">
        {/* Decorative element */}
        <div className="absolute top-20 right-0 w-[40rem] h-[40rem] pointer-events-none select-none hidden lg:block">
          <span className="text-[20rem] font-black text-slate-100/60 leading-none tracking-tighter">
            S
          </span>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl">
            <p className="animate-fade-in-up text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-4">
              About SmatWay
            </p>
            <h1
              className="animate-fade-in-up text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter leading-none text-zinc-900 mb-6"
              style={{ animationDelay: "80ms" }}
            >
              Connecting travelers
              <br />
              and transporters
            </h1>
            <p
              className="animate-fade-in-up text-xl text-slate-500 max-w-lg leading-relaxed"
              style={{ animationDelay: "160ms" }}
            >
              We&apos;re building the infrastructure that makes travel accessible, safe, and affordable for everyone across the world.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter leading-none text-zinc-900 mb-12">
              Our Story
            </h2>

            <div className="space-y-6">
              <p className="text-base text-slate-600 leading-relaxed">
                SmatWay was born from a simple observation: traveling shouldn&apos;t be complicated or unsafe. We saw countless travelers struggling to find reliable transportation, while transporters struggled to fill their vehicles efficiently.
              </p>

              {/* Highlight quote */}
              <div className="border-l-2 border-emerald-600 pl-6 py-2 my-8">
                <p className="text-lg text-zinc-900 font-medium leading-relaxed">
                  Our platform bridges this gap by connecting verified transporters with travelers who need reliable, affordable transportation. We&apos;ve built a community based on trust, safety, and transparency.
                </p>
              </div>

              <p className="text-base text-slate-600 leading-relaxed">
                Since our launch, we&apos;ve helped thousands of travelers reach their destinations safely while providing transporters with a steady stream of customers. Our technology ensures secure payments, real-time tracking, and verified identities for peace of mind.
              </p>

              <p className="text-base text-slate-600 leading-relaxed">
                Today, SmatWay continues to grow, connecting more communities and making travel easier, safer, and more accessible for everyone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
            {/* Mission */}
            <div className="pb-12 md:pb-0 md:pr-16">
              <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-4">
                Our Mission
              </p>
              <p className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 leading-snug">
                To make travel accessible, safe, and affordable for everyone across the world.
              </p>
            </div>

            {/* Vision */}
            <div className="pt-12 md:pt-0 md:pl-16">
              <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-4">
                Our Vision
              </p>
              <p className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 leading-snug">
                To become the world&apos;s leading transportation platform connecting communities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter leading-none text-zinc-900 mb-4">
              Our Values
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              What we believe in and stand for.
            </p>
          </div>

          {/* Asymmetric grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Safety First - large dark card */}
            <div className="bg-zinc-950 rounded-2xl p-10 border border-zinc-800 animate-fade-in-up" style={{ animationDelay: "0ms" }}>
              <div className="text-emerald-400 mb-6">
                <SafetyIcon />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Safety First</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Your safety is our top priority with verified transporters and secure payments. Every transporter undergoes background checks and vehicle inspections.
              </p>
            </div>

            {/* Community + Quality stacked */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-8 border border-slate-200/50 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] animate-fade-in-up" style={{ animationDelay: "100ms" }}>
                <div className="text-emerald-600 mb-4">
                  <HeartIcon />
                </div>
                <h3 className="text-xl font-semibold text-zinc-900 mb-2">Community Driven</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Built by travelers, for travelers. Join our growing community of riders and drivers.
                </p>
              </div>
              <div className="bg-white rounded-2xl p-8 border border-slate-200/50 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] animate-fade-in-up" style={{ animationDelay: "200ms" }}>
                <div className="text-emerald-600 mb-4">
                  <AwardIcon />
                </div>
                <h3 className="text-xl font-semibold text-zinc-900 mb-2">Quality Service</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  We ensure the highest quality of service for all our users, every single trip.
                </p>
              </div>
            </div>
          </div>

          {/* Innovation - full width horizontal */}
          <div className="bg-white rounded-2xl p-8 md:p-10 border border-slate-200/50 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] animate-fade-in-up" style={{ animationDelay: "300ms" }}>
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="text-emerald-600">
                <TrendingUpIcon />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-zinc-900 mb-2">Innovation</h3>
                <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">
                  Leveraging technology to make travel easier and more accessible. We continuously invest in smarter routing, real-time tracking, and data-driven improvements.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Join CTA */}
      <section className="relative overflow-hidden bg-zinc-950 py-24 lg:py-32">
        {/* Decorative orb */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl">
            <h2 className="text-5xl lg:text-6xl font-bold tracking-tighter leading-none text-white mb-6">
              Join our
              <br />
              community
            </h2>
            <p className="text-base text-slate-400 leading-relaxed max-w-md mb-8">
              Be part of the fastest-growing transportation network. Whether you travel or transport, there&apos;s a place for you.
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
      </section>
    </div>
  );
}
