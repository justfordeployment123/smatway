"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

type Route = { from: string; to: string; note: string };

const ROUTES: Route[] = [
  { from: "Lahore", to: "Islamabad", note: "8 min" },
  { from: "Karachi", to: "Hyderabad", note: "3 seats" },
  { from: "Multan", to: "Lahore", note: "22 min" },
  { from: "Rawalpindi", to: "Peshawar", note: "5 seats" },
  { from: "Faisalabad", to: "Karachi", note: "12 min" },
];

const INTERVAL_MS = 3200;

export default function RouteTicker() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % ROUTES.length), INTERVAL_MS);
    return () => clearInterval(t);
  }, []);

  const r = ROUTES[i];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm">
      {/* Height matches content — one line — so the rotator doesn't jump */}
      <div className="relative flex h-11 items-center justify-between px-4">
        <div className="relative flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-2.5 text-[12px]"
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              <span className="truncate font-medium text-zinc-200">
                {r.from} <span className="text-zinc-500">→</span> {r.to}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="relative ml-3 shrink-0">
          <AnimatePresence mode="wait">
            <motion.span
              key={`note-${i}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="inline-block font-mono text-[10px] uppercase tracking-wider text-emerald-400/80"
            >
              · {r.note}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex h-1 w-full gap-[3px] px-4 pb-2">
        {ROUTES.map((_, idx) => (
          <motion.span
            key={idx}
            className="h-[2px] flex-1 rounded-full bg-white/10"
            animate={{ backgroundColor: idx === i ? "rgba(16,185,129,0.85)" : "rgba(255,255,255,0.08)" }}
            transition={{ duration: 0.4 }}
          />
        ))}
      </div>
    </div>
  );
}
