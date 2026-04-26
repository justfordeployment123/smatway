"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Page, PageHeader } from "@/app/dashboard/_Components/ui";
import {
  initializePaystackPayment,
  initializeFlutterwavePayment,
  getBooking,
} from "@/lib/api";
import { ProviderLogo } from "@/components/ProviderLogo";

type Provider = "paystack" | "flutterwave";

/**
 * Per-currency provider config. `recommended` flags the picker badge,
 * `hidden` removes the option entirely for that currency (because it
 * either can't process there or the experience is materially worse than
 * the alternative).
 *
 * Decisions:
 *   - NGN: Paystack recommended (best card UX in Nigeria), Flutterwave shown.
 *   - KES: Flutterwave recommended (M-Pesa rail). Paystack shown — it does
 *     support KES cards but most travelers want M-Pesa.
 *   - GHS: Paystack recommended for cards, Flutterwave for MoMo — show both.
 *   - ZAR / EGP: Paystack recommended, Flutterwave shown as fallback.
 *   - UGX / RWF / TZS / ZMW / XOF: Paystack hidden (no real local rail);
 *     Flutterwave only and recommended.
 *   - Anything else (USD etc.): show both, neither flagged recommended.
 */
type CurrencyConfig = {
  paystack: { hidden?: boolean; recommended?: boolean; blurb: string };
  flutterwave: { hidden?: boolean; recommended?: boolean; blurb: string };
};

const CURRENCY_CONFIG: Record<string, CurrencyConfig> = {
  NGN: {
    paystack: { recommended: true, blurb: "Card, bank transfer, USSD. Most familiar checkout for Nigerian travelers." },
    flutterwave: { blurb: "Card, bank transfer, USSD. Alternative if your bank rejects Paystack." },
  },
  KES: {
    paystack: { blurb: "Card-only checkout. Use this if you don't have an M-Pesa account." },
    flutterwave: { recommended: true, blurb: "Pay with M-Pesa or card. STK push prompt arrives on your phone." },
  },
  GHS: {
    paystack: { recommended: true, blurb: "Card, bank, MTN/Vodafone/AirtelTigo MoMo. Best Ghanaian checkout." },
    flutterwave: { blurb: "Mobile money (MTN/Vodafone/AirtelTigo) and card." },
  },
  ZAR: {
    paystack: { recommended: true, blurb: "Card and EFT. Best South African checkout." },
    flutterwave: { blurb: "Card payments." },
  },
  EGP: {
    paystack: { recommended: true, blurb: "Card payments via Paystack Egypt." },
    flutterwave: { blurb: "Card payments." },
  },
  UGX: {
    paystack: { hidden: true, blurb: "" },
    flutterwave: { recommended: true, blurb: "MTN MoMo, Airtel Money, or card." },
  },
  RWF: {
    paystack: { hidden: true, blurb: "" },
    flutterwave: { recommended: true, blurb: "MTN MoMo, Airtel Money, or card." },
  },
  TZS: {
    paystack: { hidden: true, blurb: "" },
    flutterwave: { recommended: true, blurb: "Vodacom M-Pesa, Tigo Pesa, Airtel Money, or card." },
  },
  ZMW: {
    paystack: { hidden: true, blurb: "" },
    flutterwave: { recommended: true, blurb: "MTN MoMo, Airtel Money, Zamtel Kwacha, or card." },
  },
  XOF: {
    paystack: { hidden: true, blurb: "" },
    flutterwave: { recommended: true, blurb: "Orange Money, MTN MoMo, Wave, or card." },
  },
};

const FALLBACK_CONFIG: CurrencyConfig = {
  paystack: { blurb: "Cards, bank transfer, USSD. Best for Nigeria, Ghana, Kenya, South Africa, Egypt." },
  flutterwave: { blurb: "Cards, bank transfer, mobile money. Wider coverage incl. UK/US/EU + most of Africa." },
};

function configFor(currency: string | undefined): CurrencyConfig {
  if (!currency) return FALLBACK_CONFIG;
  return CURRENCY_CONFIG[currency.toUpperCase()] ?? FALLBACK_CONFIG;
}

/**
 * Payment kickoff page. User picks a provider, we initialize the corresponding
 * checkout session on the API, then redirect to the provider's hosted
 * checkout. Once they complete payment they come back to /pay/callback.
 *
 * The picker is currency-aware: providers that don't have a sensible rail
 * for the booking's currency are hidden, and the remaining ones get a
 * "Recommended" badge based on which is the best local fit.
 */
export default function PayPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = use(params);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<Provider | null>(null);
  const [currency, setCurrency] = useState<string | undefined>();
  // Which payment rails the transporter is set up to receive on. Drives
  // the picker — we only collect on rails we can release on later.
  const [supportedProviders, setSupportedProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBooking(bookingId)
      .then((b) => {
        setCurrency(b?.transport?.currency);
        const raw: string[] = b?.transport?.payoutProviders ?? [];
        const lower = raw
          .map((p) => p.toLowerCase())
          .filter((p): p is Provider => p === "paystack" || p === "flutterwave");
        setSupportedProviders(lower);
      })
      .catch(() => { /* leave currency undefined + supportedProviders empty */ })
      .finally(() => setLoading(false));
  }, [bookingId]);

  async function startPaystack() {
    setBusy("paystack");
    setError(null);
    try {
      const res = await initializePaystackPayment(bookingId);
      window.location.href = res.authorizationUrl;
    } catch (e) {
      setBusy(null);
      setError(e instanceof Error ? e.message : "Could not start Paystack payment");
    }
  }

  async function startFlutterwave() {
    setBusy("flutterwave");
    setError(null);
    try {
      const res = await initializeFlutterwavePayment(bookingId);
      window.location.href = res.authorizationUrl;
    } catch (e) {
      setBusy(null);
      setError(e instanceof Error ? e.message : "Could not start Flutterwave payment");
    }
  }

  function start(p: Provider) {
    return p === "paystack" ? startPaystack() : startFlutterwave();
  }

  const cfg = configFor(currency);
  // Per-provider visibility = transporter has it configured AND the
  // currency makes sense for it. The transporter check is strict: if
  // they configured only Paystack, we hide Flutterwave even if the
  // currency would technically work — collecting on a rail we can't
  // release on leaves money stuck in the wrong provider's balance.
  // (`loading` state above renders skeletons; this code path only runs
  // once we have the real `supportedProviders` array.)
  const supports = (id: Provider) => supportedProviders.includes(id);
  const providers: Array<{ id: Provider; label: string; blurb: string; recommended: boolean }> = [
    !cfg.paystack.hidden && supports("paystack") && {
      id: "paystack" as const,
      label: "Paystack",
      blurb: cfg.paystack.blurb,
      recommended: !!cfg.paystack.recommended,
    },
    !cfg.flutterwave.hidden && supports("flutterwave") && {
      id: "flutterwave" as const,
      label: "Flutterwave",
      blurb: cfg.flutterwave.blurb,
      recommended: !!cfg.flutterwave.recommended,
    },
  ].filter(Boolean) as Array<{ id: Provider; label: string; blurb: string; recommended: boolean }>;

  return (
    <Page>
      <PageHeader
        kicker="Checkout"
        title="Choose how to pay"
        subtitle={
          currency
            ? `Charged in ${currency.toUpperCase()}. Pick a provider — you'll be redirected to their secure checkout and brought back here when done.`
            : "Pick a payment provider. You'll be redirected to their secure checkout page and brought back here when done."
        }
      />

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-2xl border border-slate-200/70 bg-white p-5 animate-pulse h-24" />
          ))}
        </div>
      ) : providers.length === 0 ? (
        // Edge case: transporter hasn't set up any payout account yet, so
        // the picker has nothing to show. Block the pay flow and tell the
        // traveler what's happening — collecting on a rail we can't
        // release on would leave the money stuck.
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm font-semibold text-amber-900">Driver hasn't set up payouts yet</p>
          <p className="mt-1.5 text-xs text-amber-800 leading-relaxed">
            Your driver hasn't connected a bank account to receive earnings. They'll need to add one before you can pay — message them via the chat, or wait for them to set it up.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {providers.map((p) => {
            const isBusy = busy === p.id;
            return (
              <button
                key={p.id}
                onClick={() => start(p.id)}
                disabled={!!busy}
                className="w-full text-left rounded-2xl border border-slate-200/70 bg-white p-5 transition-all hover:border-emerald-300 hover:shadow-[0_4px_14px_-6px_rgba(16,185,129,0.18)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-4"
              >
                {/* Real brand logo, not a placeholder gradient — gives the
                    traveler immediate visual recognition of which checkout
                    they're about to land on. White tile with a thin ring
                    to keep the logo readable on hover. */}
                <div className="w-11 h-11 rounded-xl bg-white ring-1 ring-slate-200/80 flex items-center justify-center">
                  <ProviderLogo provider={p.id} size={26} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[14px] font-semibold text-zinc-950">{p.label}</span>
                    {p.recommended && (
                      <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-slate-500 mt-1 leading-relaxed">{p.blurb}</p>
                </div>
                <div className="shrink-0">
                  {isBusy ? (
                    <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span className="text-emerald-600 text-xs font-semibold">Continue →</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-6 text-center">
        <Link
          href="/dashboard/my-bookings"
          className="text-xs font-medium text-slate-500 hover:text-zinc-900"
        >
          ← Back to my bookings
        </Link>
      </div>

      <p className="mt-6 text-[11px] text-slate-400 text-center leading-relaxed">
        Both options are PCI-DSS certified. Payment goes to SmatWay's escrow first;
        we release it to your driver once you confirm arrival.
      </p>
    </Page>
  );
}
