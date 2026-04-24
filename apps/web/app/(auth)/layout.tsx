import Link from "next/link";

function CheckIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ShieldIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function LockIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function ClockIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function StarIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function LeftPanel() {
  const routes = [
    { from: "Lahore", to: "Islamabad", note: "8 min" },
    { from: "Karachi", to: "Hyderabad", note: "3 seats" },
    { from: "Multan", to: "Lahore", note: "22 min" },
    { from: "Rawalpindi", to: "Peshawar", note: "5 seats" },
    { from: "Faisalabad", to: "Karachi", note: "12 min" },
  ];

  return (
    <div className="relative hidden lg:block lg:w-[48%] xl:w-[45%] h-full overflow-hidden text-white"
      style={{ backgroundColor: "#09090b" }}
    >
      {/* Layered base — deep navy with emerald glow off-axis */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 10% 5%, rgba(16,185,129,0.18), transparent 55%)," +
            "radial-gradient(ellipse 60% 50% at 90% 95%, rgba(20,184,166,0.14), transparent 60%)," +
            "linear-gradient(180deg, #0a0a0c 0%, #0b0d10 50%, #09090b 100%)",
        }}
      />

      {/* Blueprint grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 40%, black 30%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 40%, black 30%, transparent 80%)",
        }}
      />

      {/* Soft aurora blob — slow drift */}
      <div
        className="pointer-events-none absolute -top-24 -left-10 h-[460px] w-[460px] rounded-full blur-[120px] animate-pulse"
        style={{ background: "radial-gradient(circle, rgba(16,185,129,0.28), transparent 70%)", animationDuration: "8s" }}
      />
      <div
        className="pointer-events-none absolute -bottom-24 -right-10 h-[380px] w-[380px] rounded-full blur-[110px] animate-pulse"
        style={{ background: "radial-gradient(circle, rgba(251,191,36,0.14), transparent 70%)", animationDuration: "10s", animationDelay: "2s" }}
      />

      {/* Grain */}
      <div className="grain pointer-events-none absolute inset-0 opacity-40" />

      {/* Giant faded quote mark — editorial decoration */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 right-[-10px] select-none font-[var(--font-display)] text-[22rem] leading-none text-emerald-400/[0.07]"
      >
        &ldquo;
      </div>

      {/* Hairline accents */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-emerald-500/30 to-transparent z-20" />

      {/* ─── Content (scrolls independently if viewport is short) ─── */}
      <div className="relative z-10 h-full overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden flex flex-col p-10 xl:p-12">
        {/* Brand lockup */}
        <Link href="/" className="group inline-flex items-center gap-2.5">
          <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-[0_8px_24px_-8px_rgba(16,185,129,0.6)]">
            <span className="font-[var(--font-display)] text-base font-bold text-white">S</span>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
          <span className="font-[var(--font-display)] text-[17px] font-semibold tracking-tight text-white">SmatWay</span>
        </Link>

        {/* Live pulse chip */}
        <div className="mt-10 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-500/[0.08] px-3 py-1.5 backdrop-blur">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-80" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Live · 247 trips today
          </span>
        </div>

        {/* Editorial hero phrase */}
        <h2 className="mt-8 font-[var(--font-display)] text-[2.75rem] font-semibold leading-[1.02] tracking-tight text-white xl:text-5xl">
          Travel with <span className="italic text-emerald-300">people you trust</span>, on roads you know.
        </h2>
        <p className="mt-5 max-w-md text-[15px] leading-relaxed text-zinc-400">
          Verified drivers. Upfront pricing. Live tracking for the people who wait for you to arrive.
        </p>

        {/* Testimonial block */}
        <div className="relative mt-10 max-w-md">
          <div className="absolute -left-2 -top-4 select-none font-[var(--font-display)] text-5xl leading-none text-emerald-400/30">&ldquo;</div>
          <blockquote className="pl-6 pr-2">
            <p className="text-[15.5px] leading-relaxed text-zinc-200">
              The share link is the feature I didn&apos;t know I needed. My family sees me move. They sleep better. So do I.
            </p>
            <footer className="mt-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-pink-600 text-sm font-semibold text-white">M</div>
              <div>
                <div className="text-[13px] font-semibold text-white">Maria L.</div>
                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">Daily commuter · Islamabad</div>
              </div>
              <div className="ml-auto flex items-center gap-0.5 text-amber-400">
                {[0, 1, 2, 3, 4].map((s) => <StarIcon key={s} />)}
              </div>
            </footer>
          </blockquote>
        </div>

        {/* Live route ticker */}
        <div className="relative mt-auto pt-10">
          <div className="mb-3 flex items-center justify-between">
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">Departing now</div>
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-400">↗ live feed</div>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[#0a0a0c] to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[#0a0a0c] to-transparent" />
            <div className="flex w-max animate-marquee items-center gap-8 whitespace-nowrap py-3 pl-10">
              {[...routes, ...routes].map((r, i) => (
                <div key={i} className="flex items-center gap-2.5 text-[12px]">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                  <span className="font-medium text-zinc-200">{r.from} <span className="text-zinc-500">→</span> {r.to}</span>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-400/80">· {r.note}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Trust stats strip */}
          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5 backdrop-blur-sm">
              <div className="flex items-center gap-1 text-amber-400">
                <StarIcon className="w-3 h-3" />
                <span className="font-mono text-lg font-semibold tabular-nums text-white">4.9</span>
              </div>
              <div className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.15em] text-zinc-500">Avg rating</div>
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5 backdrop-blur-sm">
              <div className="font-mono text-lg font-semibold tabular-nums text-white">50K+</div>
              <div className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.15em] text-zinc-500">Travelers</div>
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5 backdrop-blur-sm">
              <div className="font-mono text-lg font-semibold tabular-nums text-white">97%</div>
              <div className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.15em] text-zinc-500">On-time</div>
            </div>
          </div>

          {/* Trust badges */}
          <div className="mt-5 flex flex-wrap gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium text-zinc-300 backdrop-blur-sm">
              <ShieldIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified drivers</span>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium text-zinc-300 backdrop-blur-sm">
              <LockIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>Escrow payments</span>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium text-zinc-300 backdrop-blur-sm">
              <ClockIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>24/7 support</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-[100dvh] overflow-hidden">
      <LeftPanel />

      {/* Right panel — light with subtle emerald mesh. Only this side scrolls. */}
      <div className="h-full w-full flex-1 overflow-y-auto"
        style={{ backgroundColor: "#fafaf8" }}
      >
        {/* min-h-full wrapper so mesh + grain stretch to the full scrollable content, not just the viewport */}
        <div className="relative flex min-h-full w-full justify-center p-6 md:p-10 lg:p-12">
          {/* Base mesh — now covers the full scroll length */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 60% 50% at 0% 100%, rgba(16,185,129,0.12), transparent 65%)," +
                "radial-gradient(ellipse 50% 40% at 100% 0%, rgba(16,185,129,0.08), transparent 65%)," +
                "linear-gradient(180deg, #ffffff 0%, #fafaf7 50%, #f4f8f5 100%)",
            }}
          />
          <div className="grain pointer-events-none absolute inset-0 opacity-40" />

          {/* Mobile-only top accent hairline */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent lg:hidden" />

          {/* my-auto centers vertically when content fits; lets long forms scroll naturally */}
          <div className="relative z-10 my-auto w-full max-w-md">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
