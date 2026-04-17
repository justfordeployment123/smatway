// ─── Icons ────────────────────────────────────────────────────────────────────

function SearchIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function CarIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" /><path d="M9 17h6" /><circle cx="17" cy="17" r="2" />
    </svg>
  );
}

function CreditCardIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}

function QrCodeIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect width="5" height="5" x="3" y="3" rx="1" /><rect width="5" height="5" x="16" y="3" rx="1" />
      <rect width="5" height="5" x="3" y="16" rx="1" />
      <path d="M21 16h-3a2 2 0 0 0-2 2v3" /><path d="M21 21v.01" />
      <path d="M12 7v3a2 2 0 0 1-2 2H7" /><path d="M3 12h.01" /><path d="M12 3h.01" />
      <path d="M12 16v.01" /><path d="M16 12h1" /><path d="M21 12v.01" /><path d="M12 21v-1" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const travelerSteps = [
  { num: "01", icon: <SearchIcon />, title: "Search for routes", items: ["Browse routes across multiple cities", "View departure times and fares", "Check transporter ratings", "Filter by date and transport type"] },
  { num: "02", icon: <CarIcon />, title: "Choose your ride", items: ["Compare different transporters", "Read verified passenger reviews", "View vehicle details", "Check available seats"] },
  { num: "03", icon: <CreditCardIcon />, title: "Book and pay securely", items: ["Pay with available payment options", "Instant booking confirmation", "Get your booking reference", "Payment protected until trip completion"] },
  { num: "04", icon: <QrCodeIcon />, title: "Get your QR code", items: ["Download your booking QR", "Show code to driver at departure", "Share your trip link with family", "Track your journey live"] },
  { num: "05", icon: <CheckCircleIcon />, title: "Complete your journey", items: ["Board using your QR code", "Travel with full platform support", "Rate and review your experience"] },
];

const transporterSteps = [
  { num: "01", icon: <UsersIcon />, title: "Create your account", items: ["Submit registration documents", "Driver license and background check", "Set up payment details"] },
  { num: "02", icon: <CarIcon />, title: "Add your vehicles", items: ["Upload vehicle registration", "Add photos and seating capacity", "Submit insurance certificates"] },
  { num: "03", icon: <CalendarIcon />, title: "Create routes", items: ["Set departure and destination cities", "Define times, dates, and fares", "Add route descriptions"] },
  { num: "04", icon: <UsersIcon />, title: "Receive bookings", items: ["Instant booking notifications", "Manage confirmations in real time", "Track seat availability"] },
  { num: "05", icon: <CreditCardIcon />, title: "Get paid", items: ["Automatic payment processing", "Funds transferred after trip completion", "Transparent fee structure"] },
];

const safetyPoints = [
  { icon: <ShieldIcon />, title: "Verified Transporters", description: "All transporters go through rigorous checks — background verification, license review, and vehicle inspection." },
  { icon: <UsersIcon />, title: "Real-Time Tracking", description: "Share your trip with family. They can monitor your journey live for full peace of mind." },
  { icon: <CreditCardIcon />, title: "Secure Payments", description: "All payments are encrypted. Funds are held until trip completion." },
  { icon: <CheckCircleIcon />, title: "24/7 Support", description: "Our team is available around the clock. Emergency contact available at any point in your journey." },
];

// ─── Components ───────────────────────────────────────────────────────────────

type Step = { num: string; icon: React.ReactNode; title: string; items: string[] };

function StepList({ steps, accent }: { steps: Step[]; accent: "emerald" | "blue" }) {
  const iconBg = accent === "emerald" ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600";
  const numText = accent === "emerald" ? "text-emerald-600" : "text-blue-600";

  return (
    <div className="space-y-0">
      {steps.map((step, i) => (
        <div
          key={step.num}
          className="animate-fade-in-up flex gap-5 py-8 border-b border-slate-100 last:border-0"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-white border border-slate-200/60 flex items-center justify-center shadow-sm">
            <span className={`text-xs font-bold font-mono ${numText}`}>{step.num}</span>
          </div>
          <div className="flex-1 pt-1">
            <div className="flex items-center gap-2.5 mb-3">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${iconBg}`}>
                {step.icon}
              </div>
              <h3 className="text-base font-semibold text-zinc-900 tracking-tight">{step.title}</h3>
            </div>
            <ul className="space-y-1.5">
              {step.items.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-500">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-slate-300 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HowItWorksPage() {
  return (
    <div className="pt-16">

      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-4">How it works</p>
            <h1 className="text-5xl lg:text-6xl font-bold text-zinc-900 tracking-tighter leading-tight mb-6">
              Simple steps to<br />start your journey.
            </h1>
            <p className="text-lg text-slate-500 leading-relaxed max-w-[45ch]">
              Whether you&apos;re a traveler or a transporter, getting started on SmatWay is quick and straightforward.
            </p>
          </div>
        </div>
      </section>

      {/* ── For Travelers ─────────────────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1fr_2fr] gap-16 items-start">
            <div>
              <div className="inline-flex items-center bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full mb-5">
                For travelers
              </div>
              <h2 className="text-3xl font-bold text-zinc-900 tracking-tight leading-tight mb-4">
                Book your journey in five steps
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                From search to arrival, every step is designed to be fast, clear, and secure.
              </p>
            </div>
            <StepList steps={travelerSteps} accent="emerald" />
          </div>
        </div>
      </section>

      {/* ── For Transporters ──────────────────────────────────────────────────── */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1fr_2fr] gap-16 items-start">
            <div>
              <div className="inline-flex items-center bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full mb-5">
                For transporters
              </div>
              <h2 className="text-3xl font-bold text-zinc-900 tracking-tight leading-tight mb-4">
                Start earning with your vehicles
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                Set up your fleet, publish routes, and receive bookings — all from one dashboard.
              </p>
            </div>
            <StepList steps={transporterSteps} accent="blue" />
          </div>
        </div>
      </section>

      {/* ── Safety ────────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-3">Safety</p>
            <h2 className="text-3xl font-bold text-zinc-900 tracking-tight">Your safety is built in</h2>
          </div>
          <div className="grid md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            {safetyPoints.map((point) => (
              <div key={point.title} className="py-8 md:py-0 md:px-8 first:pl-0 last:pr-0">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4">
                  {point.icon}
                </div>
                <h3 className="text-sm font-semibold text-zinc-900 mb-2">{point.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{point.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-zinc-950 py-16">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl">
            <p className="text-emerald-400 text-sm font-semibold uppercase tracking-wider mb-4">Get started</p>
            <h2 className="text-4xl font-bold text-white tracking-tighter leading-tight mb-5">
              Ready to start your journey?
            </h2>
            <p className="text-zinc-400 leading-relaxed mb-8">
              Join thousands of travelers and transporters already using SmatWay every day.
            </p>
            <a
              href="/signin"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 active:scale-[0.98]"
            >
              Start your journey
              <ArrowRightIcon />
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
