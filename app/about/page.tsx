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

function TargetIcon({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function SafetyIcon() {
  return (
    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

function AwardIcon() {
  return (
    <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  );
}

function TrendingUpIcon() {
  return (
    <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg className="w-20 h-20 text-emerald-600 mx-auto mb-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar() {
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
            <a href="/" className="px-5 py-2.5 rounded-lg font-medium transition-all duration-200 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50/50">
              Home
            </a>
            <a href="/about" className="px-5 py-2.5 rounded-lg font-medium transition-all duration-200 text-emerald-600 bg-emerald-50">
              About
            </a>
            <a href="/how-it-works" className="px-5 py-2.5 rounded-lg font-medium transition-all duration-200 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50/50">
              How It Works
            </a>
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />

      <div className="pt-20">

        {/* Hero */}
        <section className="relative bg-gradient-to-br from-emerald-600 to-teal-600 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl font-bold mb-6">About SmatWay</h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              Connecting travelers and transporters across the World
            </p>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">Our Story</h2>
              <div className="w-20 h-1 bg-gradient-to-r from-emerald-600 to-teal-600 mx-auto" />
            </div>
            <div className="max-w-4xl mx-auto">
              <div className="prose prose-lg">
                <p className="text-lg text-slate-700 leading-relaxed mb-6">
                  Smatway was born from a simple observation: traveling shouldn&apos;t be complicated or unsafe. We saw countless travelers struggling to find reliable transportation, while transporters struggled to fill their vehicles efficiently.
                </p>
                <p className="text-lg text-slate-700 leading-relaxed mb-6">
                  Our platform bridges this gap by connecting verified transporters with travelers who need reliable, affordable transportation. We&apos;ve built a community based on trust, safety, and transparency.
                </p>
                <p className="text-lg text-slate-700 leading-relaxed mb-6">
                  Since our launch, we&apos;ve helped thousands of travelers reach their destinations safely while providing transporters with a steady stream of customers. Our technology ensures secure payments, real-time tracking, and verified identities for peace of mind.
                </p>
                <p className="text-lg text-slate-700 leading-relaxed">
                  Today, Smatway continues to grow, connecting more communities and making travel easier, safer, and more accessible for everyone.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8">

              {/* Mission */}
              <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow p-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full mb-6 text-emerald-600">
                    <TargetIcon className="w-16 h-16" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">Our Mission</h3>
                  <p className="text-lg text-slate-600 leading-relaxed">
                    To make travel accessible, safe, and affordable for everyone across the World
                  </p>
                </div>
              </div>

              {/* Vision */}
              <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow p-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full mb-6 text-emerald-600">
                    <MapPinIcon className="w-16 h-16" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">Our Vision</h3>
                  <p className="text-lg text-slate-600 leading-relaxed">
                    To become the World&apos;s leading transportation platform connecting communities
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">Our Values</h2>
              <p className="text-xl text-slate-600">What we believe in and stand for</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

              <div className="bg-white rounded-lg border border-slate-200 text-center hover:shadow-xl transition-shadow p-6">
                <div className="text-emerald-600 mb-4 flex justify-center">
                  <SafetyIcon />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Safety First</h3>
                <p className="text-slate-600">Your safety is our top priority with verified transporters and secure payments</p>
              </div>

              <div className="bg-white rounded-lg border border-slate-200 text-center hover:shadow-xl transition-shadow p-6">
                <div className="text-emerald-600 mb-4 flex justify-center">
                  <HeartIcon />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Community Driven</h3>
                <p className="text-slate-600">Built by travelers, for travelers. Join our growing community</p>
              </div>

              <div className="bg-white rounded-lg border border-slate-200 text-center hover:shadow-xl transition-shadow p-6">
                <div className="text-emerald-600 mb-4 flex justify-center">
                  <AwardIcon />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Quality Service</h3>
                <p className="text-slate-600">We ensure the highest quality of service for all our users</p>
              </div>

              <div className="bg-white rounded-lg border border-slate-200 text-center hover:shadow-xl transition-shadow p-6">
                <div className="text-emerald-600 mb-4 flex justify-center">
                  <TrendingUpIcon />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Innovation</h3>
                <p className="text-slate-600">Leveraging technology to make travel easier and more accessible</p>
              </div>

            </div>
          </div>
        </section>

        {/* Join Our Community */}
        <section className="py-20 bg-gradient-to-br from-slate-50 to-slate-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <UsersIcon />
            <h2 className="text-4xl font-bold text-slate-900 mb-6">Join Our Community</h2>
            <p className="text-xl text-slate-600 mb-8">Be part of the fastest-growing transportation network</p>
            <button className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl">
              Get Started Today
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}
