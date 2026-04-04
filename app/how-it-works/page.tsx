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

function SearchIcon() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function CarIcon() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" />
      <path d="M9 17h6" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  );
}

function CreditCardIcon() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}

function QrCodeIcon() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="5" height="5" x="3" y="3" rx="1" />
      <rect width="5" height="5" x="16" y="3" rx="1" />
      <rect width="5" height="5" x="3" y="16" rx="1" />
      <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
      <path d="M21 21v.01" />
      <path d="M12 7v3a2 2 0 0 1-2 2H7" />
      <path d="M3 12h.01" />
      <path d="M12 3h.01" />
      <path d="M12 16v.01" />
      <path d="M16 12h1" />
      <path d="M21 12v.01" />
      <path d="M12 21v-1" />
    </svg>
  );
}

function CheckCircleIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="m9 11 3 3L22 4" />
    </svg>
  );
}

function UsersIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
}

function ShieldIcon({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  );
}

// ─── Shared Components ────────────────────────────────────────────────────────

function Navbar() {
  return (
    <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-xl z-50 border-b border-slate-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          <a href="/" className="flex items-center space-x-2 md:space-x-3 cursor-pointer group">
            <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 p-2 md:p-2.5 rounded-xl shadow-lg group-hover:shadow-emerald-200 transition-all duration-300">
              <MapPinIcon className="w-5 h-5 md:w-7 md:h-7 text-white" />
            </div>
            <span className="text-xl md:text-3xl font-bold bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 bg-clip-text text-transparent">
              SmatWay
            </span>
          </a>

          <div className="hidden md:flex items-center space-x-1">
            <a href="/" className="px-5 py-2.5 rounded-lg font-medium transition-all duration-200 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50/50">Home</a>
            <a href="/about" className="px-5 py-2.5 rounded-lg font-medium transition-all duration-200 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50/50">About</a>
            <a href="/how-it-works" className="px-5 py-2.5 rounded-lg font-medium transition-all duration-200 text-emerald-600 bg-emerald-50">How It Works</a>
            <div className="ml-4 pl-4 border-l border-slate-200">
              <button className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 hover:text-emerald-600 transition-colors">
                <GlobeIcon />
                Language
              </button>
            </div>
          </div>

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

function CheckItem({ text, color = "emerald" }: { text: string; color?: "emerald" | "blue" }) {
  return (
    <li className="flex items-center space-x-2 text-slate-700">
      <CheckCircleIcon className={`w-5 h-5 text-${color}-600 flex-shrink-0`} />
      <span>{text}</span>
    </li>
  );
}

// ─── Step Card ────────────────────────────────────────────────────────────────

type StepProps = {
  num: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  items: string[];
  accent: "emerald" | "blue";
};

function StepCard({ num, icon, title, description, items, accent }: StepProps) {
  const circleClass = accent === "emerald"
    ? "bg-gradient-to-br from-emerald-500 to-teal-600"
    : "bg-gradient-to-br from-blue-500 to-cyan-600";
  const iconColor = accent === "emerald" ? "text-emerald-600" : "text-blue-600";

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start">
      <div className="flex-shrink-0">
        <div className={`w-20 h-20 ${circleClass} rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg`}>
          {num}
        </div>
      </div>
      <div className="flex-grow bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow p-6">
        <div className="flex items-start gap-4">
          <div className={`${iconColor} mt-1`}>{icon}</div>
          <div className="flex-grow">
            <h3 className="text-2xl font-bold text-slate-900 mb-3">{title}</h3>
            <p className="text-lg text-slate-600 mb-4">{description}</p>
            <ul className="space-y-2">
              {items.map((item) => (
                <CheckItem key={item} text={item} color={accent} />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const travelerSteps: StepProps[] = [
  {
    num: "1", accent: "emerald",
    icon: <SearchIcon />,
    title: "Search for Routes",
    description: "Find available routes by entering your departure and destination cities",
    items: [
      "Browse routes across multiple cities",
      "View departure times and fares",
      "Check transporter ratings and reviews",
      "Filter by date and preferences",
    ],
  },
  {
    num: "2", accent: "emerald",
    icon: <CarIcon />,
    title: "Choose Your Ride",
    description: "Select the route that best fits your schedule and budget",
    items: [
      "Compare different transporters",
      "Read passenger reviews",
      "View vehicle details and photos",
      "Check available seats",
    ],
  },
  {
    num: "3", accent: "emerald",
    icon: <CreditCardIcon />,
    title: "Book & Pay Securely",
    description: "Complete your booking with secure payment options",
    items: [
      "Pay securely with available payment options",
      "Receive instant booking confirmation",
      "Get booking reference number",
      "Payment protected and secure",
    ],
  },
  {
    num: "4", accent: "emerald",
    icon: <QrCodeIcon />,
    title: "Get Your QR Code",
    description: "Receive a unique QR code for your journey",
    items: [
      "Download your booking QR code",
      "Show code to driver at departure",
      "Track your journey in real-time",
      "Share trip details with family",
    ],
  },
  {
    num: "5", accent: "emerald",
    icon: <CheckCircleIcon className="w-8 h-8" />,
    title: "Complete Your Journey",
    description: "Travel safely and rate your experience",
    items: [
      "Board using your QR code",
      "Enjoy your safe journey",
      "Track arrival time",
      "Rate and review your experience",
    ],
  },
];

const transporterSteps: StepProps[] = [
  {
    num: "1", accent: "blue",
    icon: <UsersIcon className="w-8 h-8" />,
    title: "Create Your Account",
    description: "Sign up as a transporter and complete verification",
    items: [
      "Provide business registration details",
      "Submit driver's license and documents",
      "Complete background verification",
      "Set up payment details",
    ],
  },
  {
    num: "2", accent: "blue",
    icon: <CarIcon />,
    title: "Add Your Vehicles",
    description: "Register your vehicles on the platform",
    items: [
      "Upload vehicle registration documents",
      "Add vehicle photos and details",
      "Specify seating capacity",
      "Submit insurance certificates",
    ],
  },
  {
    num: "3", accent: "blue",
    icon: <CalendarIcon />,
    title: "Create Routes",
    description: "Set up your routes and schedules",
    items: [
      "Define departure and destination cities",
      "Set departure times and dates",
      "Specify fares and pricing",
      "Add route descriptions",
    ],
  },
  {
    num: "4", accent: "blue",
    icon: <UsersIcon className="w-8 h-8" />,
    title: "Receive Bookings",
    description: "Get notified when travelers book your routes",
    items: [
      "Instant booking notifications",
      "View passenger details",
      "Manage booking confirmations",
      "Track seat availability",
    ],
  },
  {
    num: "5", accent: "blue",
    icon: <CreditCardIcon />,
    title: "Get Paid",
    description: "Receive payments directly to your account",
    items: [
      "Automatic payment processing",
      "Funds transferred after trip completion",
      "View transaction history",
      "Transparent fee structure",
    ],
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />

      <div className="pt-20">

        {/* Hero */}
        <section className="relative bg-gradient-to-br from-emerald-600 to-teal-600 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl font-bold mb-6">How It Works</h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              Simple steps to start your journey or grow your transportation business
            </p>
          </div>
        </section>

        {/* For Travelers */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">For Travelers</h2>
              <p className="text-xl text-slate-600">Book your journey in five easy steps</p>
            </div>
            <div className="space-y-12">
              {travelerSteps.map((step) => (
                <StepCard key={step.num + step.title} {...step} />
              ))}
            </div>
          </div>
        </section>

        {/* For Transporters */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">For Transporters</h2>
              <p className="text-xl text-slate-600">Start earning with your vehicles today</p>
            </div>
            <div className="space-y-12">
              {transporterSteps.map((step) => (
                <StepCard key={step.num + step.title} {...step} />
              ))}
            </div>
          </div>
        </section>

        {/* Safety First */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">Safety First</h2>
              <p className="text-xl text-slate-600">Your safety is our top priority</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">

              <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow p-6 text-center">
                <div className="text-emerald-600 mb-4 flex justify-center">
                  <ShieldIcon className="w-12 h-12" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Verified Transporters</h3>
                <p className="text-slate-600">All transporters go through a rigorous verification process including background checks, license verification, and vehicle inspection to ensure your safety.</p>
              </div>

              <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow p-6 text-center">
                <div className="text-emerald-600 mb-4 flex justify-center">
                  <UsersIcon className="w-12 h-12" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Real-Time Tracking</h3>
                <p className="text-slate-600">Share your trip details with family and friends. They can track your journey in real-time for added peace of mind throughout your travel.</p>
              </div>

              <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow p-6 text-center">
                <div className="text-emerald-600 mb-4 flex justify-center">
                  <CheckCircleIcon className="w-12 h-12" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Secure Payments</h3>
                <p className="text-slate-600">All payments are processed through secure, encrypted channels. Your financial information is protected, and payments are held until trip completion.</p>
              </div>

              <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow p-6 text-center">
                <div className="text-emerald-600 mb-4 flex justify-center">
                  <ShieldIcon className="w-12 h-12" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">24/7 Support</h3>
                <p className="text-slate-600">Our support team is available around the clock to assist you with any issues. Emergency SOS button available in the app for immediate help.</p>
              </div>

            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-br from-emerald-600 to-teal-600 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-xl mb-8 opacity-90">Join thousands of travelers and transporters using SmatWay every day</p>
            <button className="bg-white text-emerald-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-slate-50 transition-all shadow-lg hover:shadow-xl">
              Start Your Journey
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}
