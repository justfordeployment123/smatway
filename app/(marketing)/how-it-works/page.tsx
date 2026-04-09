// ─── Icons ────────────────────────────────────────────────────────────────────

function SearchIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function CarIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" /><path d="M9 17h6" /><circle cx="17" cy="17" r="2" />
    </svg>
  );
}

function CreditCardIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}

function QrCodeIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="5" height="5" x="3" y="3" rx="1" /><rect width="5" height="5" x="16" y="3" rx="1" />
      <rect width="5" height="5" x="3" y="16" rx="1" />
      <path d="M21 16h-3a2 2 0 0 0-2 2v3" /><path d="M21 21v.01" />
      <path d="M12 7v3a2 2 0 0 1-2 2H7" /><path d="M3 12h.01" /><path d="M12 3h.01" />
      <path d="M12 16v.01" /><path d="M16 12h1" /><path d="M21 12v.01" /><path d="M12 21v-1" />
    </svg>
  );
}

function CheckCircleIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" />
    </svg>
  );
}

function UsersIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" />
    </svg>
  );
}

function ShieldIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
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

type StepData = {
  num: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  items: string[];
};

const travelerSteps: StepData[] = [
  { num: "01", icon: <SearchIcon />, title: "Search for Routes", description: "Find available routes by entering your departure and destination cities.", items: ["Browse routes across multiple cities", "View departure times and fares", "Check transporter ratings and reviews", "Filter by date and preferences"] },
  { num: "02", icon: <CarIcon />, title: "Choose Your Ride", description: "Select the route that best fits your schedule and budget.", items: ["Compare different transporters", "Read passenger reviews", "View vehicle details and photos", "Check available seats"] },
  { num: "03", icon: <CreditCardIcon />, title: "Book & Pay Securely", description: "Complete your booking with secure payment options.", items: ["Pay securely with available payment options", "Receive instant booking confirmation", "Get booking reference number", "Payment protected and secure"] },
  { num: "04", icon: <QrCodeIcon />, title: "Get Your QR Code", description: "Receive a unique QR code for your journey.", items: ["Download your booking QR code", "Show code to driver at departure", "Track your journey in real-time", "Share trip details with family"] },
  { num: "05", icon: <CheckCircleIcon className="w-6 h-6" />, title: "Complete Your Journey", description: "Travel safely and rate your experience.", items: ["Board using your QR code", "Enjoy your safe journey", "Track arrival time", "Rate and review your experience"] },
];

const transporterSteps: StepData[] = [
  { num: "01", icon: <UsersIcon className="w-6 h-6" />, title: "Create Your Account", description: "Sign up as a transporter and complete verification.", items: ["Provide business registration details", "Submit driver's license and documents", "Complete background verification", "Set up payment details"] },
  { num: "02", icon: <CarIcon />, title: "Add Your Vehicles", description: "Register your vehicles on the platform.", items: ["Upload vehicle registration documents", "Add vehicle photos and details", "Specify seating capacity", "Submit insurance certificates"] },
  { num: "03", icon: <CalendarIcon />, title: "Create Routes", description: "Set up your routes and schedules.", items: ["Define departure and destination cities", "Set departure times and dates", "Specify fares and pricing", "Add route descriptions"] },
  { num: "04", icon: <UsersIcon className="w-6 h-6" />, title: "Receive Bookings", description: "Get notified when travelers book your routes.", items: ["Instant booking notifications", "View passenger details", "Manage booking confirmations", "Track seat availability"] },
  { num: "05", icon: <CreditCardIcon />, title: "Get Paid", description: "Receive payments directly to your account.", items: ["Automatic payment processing", "Funds transferred after trip completion", "View transaction history", "Transparent fee structure"] },
];

const safetyItems = [
  { icon: <ShieldIcon className="w-6 h-6" />, title: "Verified Transporters", description: "Rigorous verification including background checks, license verification, and vehicle inspection." },
  { icon: <UsersIcon className="w-6 h-6" />, title: "Real-Time Tracking", description: "Share your trip details with family. They can track your journey in real-time for peace of mind." },
  { icon: <CheckCircleIcon className="w-6 h-6" />, title: "Secure Payments", description: "Encrypted payment channels. Your financial information is protected until trip completion." },
  { icon: <ShieldIcon className="w-6 h-6" />, title: "24/7 Support", description: "Our support team is available around the clock. Emergency SOS button available for immediate help." },
];

// ─── Components ───────────────────────────────────────────────────────────────

function StepCard({ step, index }: { step: StepData; index: number }) {
  return (
    <div
      className="animate-fade-in-up bg-white rounded-2xl border border-slate-200/50 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] p-8 relative overflow-hidden"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Large decorative number */}
      <span className="absolute -right-4 -top-4 text-8xl font-black text-slate-50 select-none pointer-events-none leading-none">
        {step.num}
      </span>

      <div className="relative z-10">
        <div className="rounded-xl bg-emerald-50 p-3 w-12 h-12 flex items-center justify-center text-emerald-600 mb-5">
          {step.icon}
        </div>
        <h3 className="text-xl font-semibold text-zinc-900 mb-2">{step.title}</h3>
        <p className="text-sm text-slate-500 leading-relaxed mb-5">{step.description}</p>
        <ul className="space-y-2">
          {step.items.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HowItWorksPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gray-50 pt-32 pb-20 overflow-hidden">
        {/* Decorative element */}
        <div className="absolute top-16 right-0 w-[40rem] h-[40rem] pointer-events-none select-none hidden lg:block">
          <span className="text-[18rem] font-black text-slate-100/60 leading-none tracking-tighter">
            ?
          </span>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl">
            <p className="animate-fade-in-up text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-4">
              How It Works
            </p>
            <h1
              className="animate-fade-in-up text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter leading-none text-zinc-900 mb-6"
              style={{ animationDelay: "80ms" }}
            >
              Simple steps to
              <br />
              start your journey
            </h1>
            <p
              className="animate-fade-in-up text-xl text-slate-500 max-w-lg leading-relaxed"
              style={{ animationDelay: "160ms" }}
            >
              Whether you&apos;re booking a ride or growing your transportation business, getting started takes minutes.
            </p>
          </div>
        </div>
      </section>

      {/* For Travelers */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter leading-none text-zinc-900 mb-4">
              For Travelers
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              Book your journey in five easy steps. Search, compare, book, and go.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {travelerSteps.map((step, i) => (
              <StepCard key={step.num + step.title} step={step} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* For Transporters */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter leading-none text-zinc-900 mb-4">
              For Transporters
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              Start earning with your vehicles today. Register, create routes, and accept bookings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {transporterSteps.map((step, i) => (
              <StepCard key={step.num + step.title} step={step} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Safety */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter leading-none text-zinc-900 mb-4">
              Safety First
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              Your safety is our top priority. Every measure is in place to protect you.
            </p>
          </div>

          {/* Horizontal list with dividers */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-0">
            {safetyItems.map((item, i) => (
              <div
                key={item.title}
                className={`p-6 md:p-8 ${i > 0 ? "border-t md:border-t-0 md:border-l border-slate-200" : ""}`}
              >
                <div className="text-emerald-600 mb-4">
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-zinc-950 py-24 lg:py-32">
        {/* Decorative orb */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-24 -translate-y-1/2 w-48 h-48 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl">
            <h2 className="text-5xl lg:text-6xl font-bold tracking-tighter leading-none text-white mb-6">
              Ready to
              <br />
              get started?
            </h2>
            <p className="text-base text-slate-400 leading-relaxed max-w-md mb-8">
              Join thousands of travelers and transporters using SmatWay every day.
            </p>
            <a
              href="/signin"
              className="inline-flex items-center gap-2 bg-white text-zinc-900 font-semibold px-7 py-3.5 rounded-xl transition-all duration-200 text-sm hover:bg-slate-100 active:scale-[0.98] active:-translate-y-[1px]"
            >
              Start Your Journey
              <ArrowRightIcon />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
