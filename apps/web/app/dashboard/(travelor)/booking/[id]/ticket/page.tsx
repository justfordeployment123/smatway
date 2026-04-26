"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Page, PageHeader } from "@/app/dashboard/_Components/ui";
import { getBooking, confirmBookingArrival } from "@/lib/api";

/**
 * Pickup ticket: visible to the traveler once their booking is paid.
 *
 * - Shows the 10-digit verification code prominently + a QR encoding the same
 *   code (so the transporter can either scan the QR with their phone or
 *   read the digits and type them in).
 * - Reveals the transporter's phone number (hidden in the my-bookings list
 *   until paid — the API masks it server-side).
 * - "I have arrived" button appears once the transporter has scanned the
 *   code (status = IN_PROGRESS) — closes the trip out.
 *
 * QR is rendered via a public QR-encoder service to avoid pulling in a
 * client-side QR lib. The code itself is short and harmless to send through
 * the URL — it's already shown in plaintext on this same page.
 */
export default function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [arriving, setArriving] = useState(false);

  function load() {
    setLoading(true);
    setError(null);
    getBooking(id)
      .then(setBooking)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load booking"))
      .finally(() => setLoading(false));
  }
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [id]);

  async function markArrived() {
    if (!confirm("Mark this trip as completed? This releases payment to the transporter.")) return;
    setArriving(true);
    try {
      await confirmBookingArrival(id);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not mark arrived");
    } finally {
      setArriving(false);
    }
  }

  const code = booking?.verificationCode as string | null | undefined;

  // Group the digits for readability. 10 digits as 3-3-4 (phone-style),
  // legacy 6 digits as 3-3 ("123 456"). Anything else falls back to a
  // simple chunk-of-3 split.
  function formatPickupCode(c: string): string {
    if (c.length === 10) return `${c.slice(0, 3)} ${c.slice(3, 6)} ${c.slice(6)}`;
    if (c.length === 6) return `${c.slice(0, 3)} ${c.slice(3)}`;
    return c.match(/.{1,3}/g)?.join(" ") ?? c;
  }
  const isPaid = booking?.paymentStatus === "PAID";
  const isInProgress = booking?.status === "IN_PROGRESS";
  const isCompleted = booking?.status === "COMPLETED";
  const transporter = booking?.transport?.transporter;
  const route = booking
    ? `${booking.transport.departureCity} → ${booking.transport.destinationCity}`
    : "";

  const departure = booking?.transport?.departureDateTime
    ? new Date(booking.transport.departureDateTime)
    : null;
  const departureDate = departure
    ? departure.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
    : null;
  const departureTime = departure
    ? departure.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
    : null;

  const statusLabel = isCompleted ? "Trip completed" : isInProgress ? "Trip in progress" : "Awaiting pickup";
  const statusDotColor = isCompleted ? "bg-slate-400" : "bg-emerald-500";
  const statusPingColor = isCompleted ? "bg-slate-300" : "bg-emerald-400";

  return (
    <Page>
      <PageHeader
        kicker="Pickup ticket"
        title={route || "Trip ticket"}
        subtitle="Show this to your driver at pickup. They'll scan the QR or enter the 10-digit code."
        backHref="/dashboard/my-bookings"
      />

      {error && (
        <div className="mx-auto mb-4 max-w-md rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="mx-auto max-w-md rounded-2xl border border-slate-200/70 bg-white p-8 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        </div>
      ) : !booking ? null : !isPaid ? (
        <div className="mx-auto max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <div className="text-sm font-semibold text-amber-900">Pay first to unlock your ticket</div>
          <p className="mt-1.5 text-xs text-amber-800">
            Your pickup code and the driver's contact details are revealed only after payment is confirmed.
          </p>
          <Link
            href={`/dashboard/pay/${booking.id}`}
            className="mt-4 inline-block rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
          >
            Pay now
          </Link>
        </div>
      ) : (
        <div className="mx-auto max-w-md space-y-4">
          {/* Boarding-pass-style ticket: code + QR on top, trip stub below a perforated divider */}
          <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            <div className="px-6 pt-7 pb-6 text-center sm:px-8">
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                Pickup code
              </div>
              <div className="font-mono text-3xl font-bold tabular-nums tracking-[0.18em] text-zinc-950 sm:text-4xl">
                {code ? formatPickupCode(code) : "—"}
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Show this to your driver at pickup. Don't share it with anyone else.
              </p>

              {code && (
                <div className="mt-6 flex justify-center">
                  <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
                        code,
                      )}&size=220x220&margin=0`}
                      alt={`QR encoding pickup code ${code}`}
                      width={220}
                      height={220}
                      className="block"
                    />
                  </div>
                </div>
              )}

              <div className="mt-5 flex items-center justify-center gap-1.5 text-[11px] font-medium text-slate-600">
                <span className="relative flex h-1.5 w-1.5">
                  {!isCompleted && (
                    <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${statusPingColor}`} />
                  )}
                  <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${statusDotColor}`} />
                </span>
                {statusLabel}
              </div>
            </div>

            {/* Perforated divider — ticket-stub vibe */}
            <div className="relative">
              <div className="absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-slate-50 ring-1 ring-slate-200/70" />
              <div className="absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-slate-50 ring-1 ring-slate-200/70" />
              <div className="mx-6 border-t border-dashed border-slate-200" />
            </div>

            {/* Trip stub */}
            <div className="grid grid-cols-3 gap-2 px-6 py-5 text-center sm:px-8">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">From</div>
                <div className="mt-1 truncate text-[13px] font-semibold text-zinc-950">
                  {booking.transport.departureCity}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Departs</div>
                <div className="mt-1 text-[13px] font-semibold text-zinc-950">{departureTime ?? "—"}</div>
                <div className="text-[10px] text-slate-500">{departureDate ?? ""}</div>
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">To</div>
                <div className="mt-1 truncate text-[13px] font-semibold text-zinc-950">
                  {booking.transport.destinationCity}
                </div>
              </div>
            </div>
            {booking.seatsBooked != null && (
              <div className="border-t border-slate-100 px-6 py-3 text-[11px] text-slate-500 sm:px-8">
                {booking.seatsBooked} {booking.seatsBooked === 1 ? "seat" : "seats"} booked
              </div>
            )}
          </div>

          {/* Driver contact */}
          {transporter && (
            <div className="rounded-2xl border border-slate-200/70 bg-white p-4">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Your driver
              </div>
              <div className="mt-2 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-zinc-950">
                    {transporter.name || "—"}
                  </div>
                  {transporter.phoneNumber ? (
                    <a
                      href={`tel:${transporter.phoneNumber}`}
                      className="text-xs font-medium text-emerald-700 hover:text-emerald-900"
                    >
                      {transporter.phoneNumber}
                    </a>
                  ) : (
                    <div className="text-xs text-slate-500">Phone unavailable</div>
                  )}
                </div>
                {transporter.phoneNumber && (
                  <a
                    href={`tel:${transporter.phoneNumber}`}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    Call
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Arrived button — appears once pickup is verified */}
          {isInProgress && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <div className="text-sm font-semibold text-emerald-900">Trip in progress</div>
              <p className="mt-1.5 text-xs text-emerald-800">
                When you reach your destination, tap the button below to release payment to your driver and complete the trip.
              </p>
              <button
                onClick={markArrived}
                disabled={arriving}
                className="mt-3 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {arriving ? "Confirming…" : "I have arrived"}
              </button>
            </div>
          )}

          {isCompleted && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="text-sm font-semibold text-zinc-900">Trip completed</div>
              <p className="mt-1.5 text-xs text-slate-600">
                Thanks for riding with SmatWay. Payment has been released to your driver.
              </p>
            </div>
          )}
        </div>
      )}
    </Page>
  );
}
