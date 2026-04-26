"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Page, PageHeader } from "@/app/dashboard/_Components/ui";
import {
  verifyPaystackPayment,
  verifyFlutterwavePayment,
  VerifyPaymentResponse,
} from "@/lib/api";

/**
 * Both providers redirect back here after hosted checkout:
 *
 *   Paystack:    ?reference=...&trxref=...
 *   Flutterwave: ?status=successful&tx_ref=...&transaction_id=...
 *
 * We sniff which params are present to pick the correct verify endpoint.
 * The verify call is authoritative — never trust the redirect alone.
 *
 * Wrapped in Suspense because Next.js requires it for useSearchParams in the
 * App Router.
 */
export default function PayCallbackPage() {
  return (
    <Suspense fallback={<Page><PageHeader kicker="Payment" title="Verifying…" /></Page>}>
      <Inner />
    </Suspense>
  );
}

function Inner() {
  const search = useSearchParams();
  // Paystack params
  const paystackRef = search.get("reference") || search.get("trxref");
  // Flutterwave params
  const flwTxRef = search.get("tx_ref");
  const flwTxId = search.get("transaction_id");
  const flwStatus = search.get("status"); // "successful" | "cancelled" | ...

  // Decide which provider redirected us. Flutterwave gives us tx_ref+transaction_id;
  // Paystack gives reference/trxref. If we somehow have both (shouldn't happen),
  // prefer Flutterwave since its identifier is more specific.
  const provider: "paystack" | "flutterwave" | null = flwTxRef || flwTxId
    ? "flutterwave"
    : paystackRef
    ? "paystack"
    : null;
  const reference = provider === "flutterwave" ? flwTxRef : paystackRef;

  const [state, setState] = useState<"checking" | "success" | "failed" | "pending" | "error">("checking");
  const [result, setResult] = useState<VerifyPaymentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!provider) {
      setState("error");
      setError("Missing payment reference in URL.");
      return;
    }
    if (startedRef.current) return;
    startedRef.current = true;

    // Flutterwave's "cancelled" comes through as ?status=cancelled — short-circuit.
    if (provider === "flutterwave" && flwStatus === "cancelled") {
      setState("failed");
      setResult({
        status: "failed",
        bookingId: "",
        paymentStatus: "FAILED",
        reason: "cancelled",
      });
      return;
    }

    const verifyPromise =
      provider === "paystack"
        ? verifyPaystackPayment(paystackRef!)
        : verifyFlutterwavePayment({
            reference: flwTxRef ?? undefined,
            transactionId: flwTxId ?? undefined,
          });

    verifyPromise
      .then((res) => {
        setResult(res);
        setState(res.status);
      })
      .catch((e) => {
        setState("error");
        setError(e instanceof Error ? e.message : "Could not verify payment");
      });
  }, [provider, paystackRef, flwTxRef, flwTxId, flwStatus]);

  return (
    <Page>
      <PageHeader
        kicker="Payment"
        title={
          state === "checking" ? "Verifying your payment…" :
          state === "success" ? "Payment successful" :
          state === "failed" ? "Payment failed" :
          state === "pending" ? "Payment is still processing" :
          "Couldn't verify payment"
        }
        subtitle={
          state === "checking"
            ? "Hang tight — we're confirming with Paystack."
            : undefined
        }
      />

      <div className={`rounded-2xl border p-8 text-center ${
        state === "success" ? "border-emerald-200 bg-emerald-50" :
        state === "failed" ? "border-red-200 bg-red-50" :
        state === "pending" ? "border-amber-200 bg-amber-50" :
        state === "error" ? "border-red-200 bg-red-50" :
        "border-slate-200 bg-white"
      }`}>
        {state === "checking" && (
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-600">Talking to Paystack…</p>
          </div>
        )}

        {state === "success" && (
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="text-sm text-emerald-900 font-semibold">
              Your booking is confirmed.
            </p>
            <p className="text-xs text-emerald-800">
              Your pickup code and the driver's contact have been unlocked.
            </p>
            <p className="text-xs text-emerald-800">
              Reference: <span className="font-mono">{reference}</span>
            </p>
            <div className="pt-2 flex items-center justify-center gap-3 flex-wrap">
              {result?.bookingId && (
                <Link
                  href={`/dashboard/traveler/booking/${result.bookingId}`}
                  className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl text-sm"
                >
                  View ticket
                </Link>
              )}
              <Link
                href="/dashboard/my-bookings"
                className="text-sm font-medium text-emerald-800 hover:text-emerald-900"
              >
                All bookings
              </Link>
            </div>
          </div>
        )}

        {state === "failed" && (
          <div className="space-y-4">
            <p className="text-sm text-red-900 font-semibold">
              Your payment didn't go through.
            </p>
            {result?.reason && (
              <p className="text-xs text-red-800">Reason: {result.reason}</p>
            )}
            <p className="text-xs text-red-800">
              Reference: <span className="font-mono">{reference}</span>
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              {result?.bookingId && (
                <Link
                  href={`/dashboard/traveler/booking/${result.bookingId}`}
                  className="bg-zinc-900 hover:bg-zinc-800 text-white font-semibold px-4 py-2 rounded-xl text-sm"
                >
                  Try again
                </Link>
              )}
              <Link
                href="/dashboard/my-bookings"
                className="text-sm font-medium text-slate-700 hover:text-zinc-900"
              >
                Back to my bookings
              </Link>
            </div>
          </div>
        )}

        {state === "pending" && (
          <div className="space-y-4">
            <p className="text-sm text-amber-900 font-semibold">
              Paystack is still processing your payment.
            </p>
            <p className="text-xs text-amber-800">
              We'll mark your booking confirmed automatically as soon as it clears.
              You can come back to this page or check your bookings.
            </p>
            <p className="text-xs text-amber-800">
              Reference: <span className="font-mono">{reference}</span>
            </p>
            <div className="pt-2">
              <Link
                href="/dashboard/my-bookings"
                className="inline-block bg-zinc-900 hover:bg-zinc-800 text-white font-semibold px-4 py-2 rounded-xl text-sm"
              >
                View my bookings
              </Link>
            </div>
          </div>
        )}

        {state === "error" && (
          <div className="space-y-4">
            <p className="text-sm text-red-900 font-semibold">Couldn't verify the payment.</p>
            {error && <p className="text-xs text-red-800">{error}</p>}
            {reference && (
              <p className="text-xs text-red-800">
                Reference: <span className="font-mono">{reference}</span> — keep this for support.
              </p>
            )}
            <div className="pt-2">
              <Link
                href="/dashboard/my-bookings"
                className="inline-block bg-zinc-900 hover:bg-zinc-800 text-white font-semibold px-4 py-2 rounded-xl text-sm"
              >
                Back to my bookings
              </Link>
            </div>
          </div>
        )}
      </div>
    </Page>
  );
}
