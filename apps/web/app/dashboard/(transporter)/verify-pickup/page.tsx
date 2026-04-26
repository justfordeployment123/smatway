"use client";

import { useEffect, useRef, useState } from "react";
import { Scanner, IDetectedBarcode } from "@yudiel/react-qr-scanner";
import { Page, PageHeader } from "@/app/dashboard/_Components/ui";
import { verifyPickupCode } from "@/lib/api";

// Pickup codes are 10 digits (10^10 keyspace ≈ 10 billion). The 6-digit
// fallback in the QR/paste/regex paths is transitional — kept so any
// in-flight bookings created before the keyspace bump still validate.
const CODE_LENGTH = 10;
const emptyDigits = () => Array.from({ length: CODE_LENGTH }, () => "");

/**
 * Transporter pickup verifier. Driver either:
 *   1. Scans the traveler's QR with the phone camera (preferred), OR
 *   2. Types the 10-digit code from the traveler's ticket
 *
 * Server validates that the code maps to a paid booking on one of THIS
 * transporter's trips, then flips the booking to IN_PROGRESS. Wrong code →
 * 404/403; we surface the message.
 *
 * Camera scan: we feed the QR-decoded text through a numeric filter so the
 * user is protected from QR codes that aren't ours (URLs, vCards, etc.) —
 * only 10-digit numerics (or legacy 6-digit) are auto-submitted.
 */
export default function VerifyPickupPage() {
  const [digits, setDigits] = useState<string[]>(emptyDigits);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ traveler: string; route: string; seats: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  // mode: "code" = digit input | "camera" = live QR scanner.
  const [mode, setMode] = useState<"code" | "camera">("code");
  // Stop the scanner from re-firing the same code repeatedly while the
  // backend request is in flight. Reset on a fresh scan attempt.
  const lastScannedRef = useRef<string | null>(null);
  // We request `environment` (back camera), but on laptops / some tablets
  // the browser falls back to the user-facing camera. When that happens
  // the un-mirrored feed feels inverted to move the QR around in, so we
  // CSS-mirror the displayed video. Detection still works because the QR
  // lib decodes from the raw MediaStream, not the rendered <video>.
  const scannerContainerRef = useRef<HTMLDivElement>(null);
  const [isFrontCamera, setIsFrontCamera] = useState(false);

  useEffect(() => {
    if (mode !== "camera") {
      setIsFrontCamera(false);
      return;
    }
    // The Scanner mounts the <video> async; poll briefly until the stream's
    // video track exposes its facingMode, then stop.
    let stopped = false;
    const interval = setInterval(() => {
      if (stopped) return;
      const video = scannerContainerRef.current?.querySelector("video");
      const stream = (video?.srcObject as MediaStream | null) ?? null;
      const track = stream?.getVideoTracks?.()[0];
      const facing = track?.getSettings?.().facingMode;
      if (facing === "user") {
        setIsFrontCamera(true);
        stopped = true;
        clearInterval(interval);
      } else if (facing === "environment") {
        setIsFrontCamera(false);
        stopped = true;
        clearInterval(interval);
      }
    }, 250);
    // Bail after 4s — by then either we've picked up the facingMode or
    // the device just doesn't report it (older Safari). Default = no mirror.
    const stopTimer = setTimeout(() => { stopped = true; clearInterval(interval); }, 4000);
    return () => { stopped = true; clearInterval(interval); clearTimeout(stopTimer); };
  }, [mode]);

  function setDigit(i: number, value: string) {
    const v = value.replace(/\D/g, "").slice(0, 1);
    setDigits((prev) => prev.map((d, idx) => (idx === i ? v : d)));
    // Auto-advance focus
    if (v && i < CODE_LENGTH - 1) {
      const next = document.getElementById(`pickup-digit-${i + 1}`);
      next?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (pasted.length === 0) return;
    e.preventDefault();
    const next = pasted.padEnd(CODE_LENGTH, "").split("").slice(0, CODE_LENGTH);
    setDigits(next);
    document.getElementById(`pickup-digit-${Math.min(pasted.length, CODE_LENGTH - 1)}`)?.focus();
  }

  async function submitCode(code: string) {
    // Accept 10 digits (current) or 6 digits (legacy in-flight bookings).
    if (code.length !== CODE_LENGTH && code.length !== 6) {
      setError(`Enter the full ${CODE_LENGTH}-digit code`);
      return;
    }
    setError(null);
    setSubmitting(true);
    setSuccess(null);
    try {
      const res = await verifyPickupCode(code);
      setSuccess({
        traveler: res.traveler.name || "Traveler",
        route: res.route,
        seats: res.seatsBooked,
      });
      setDigits(emptyDigits());
      lastScannedRef.current = null;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not verify code");
      // Allow re-scanning the same code after a soft error (e.g. transient
      // network blip), but only after a beat so the UI shows the message.
      setTimeout(() => { lastScannedRef.current = null; }, 1500);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await submitCode(digits.join(""));
  }

  /**
   * QR scan handler. The library calls this on every frame that decodes a
   * barcode; we filter for our digit format and dedupe on lastScannedRef
   * so a single code in front of the camera doesn't fire ten requests.
   *
   * Tries 10 digits first (current format), falls back to 6 (legacy) so a
   * traveler's pre-bump ticket QR still scans successfully.
   */
  function handleScan(codes: IDetectedBarcode[]) {
    if (submitting || codes.length === 0) return;
    const raw = codes[0].rawValue?.trim() ?? "";
    const match = raw.match(/\b\d{10}\b/) ?? raw.match(/\b\d{6}\b/);
    if (!match) {
      setError("That QR doesn't look like a SmatWay pickup code.");
      return;
    }
    const code = match[0];
    if (lastScannedRef.current === code) return;
    lastScannedRef.current = code;
    // Pad legacy 6-digit codes into the 10-box layout (left-aligned).
    const padded = code.padEnd(CODE_LENGTH, "").split("").slice(0, CODE_LENGTH);
    setDigits(padded);
    submitCode(code);
  }

  return (
    <Page>
      <PageHeader
        kicker="Pickup"
        title="Verify a passenger"
        subtitle="Ask your passenger for their 10-digit pickup code (or scan the QR they show you) and enter it here to mark them onboard."
      />

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200/70 bg-white p-6 sm:p-8 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
      >
        {/* Mode toggle — code entry vs live camera scan */}
        <div className="mx-auto mb-5 flex w-fit rounded-xl bg-slate-100 p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setMode("code"); setError(null); }}
            className={`px-4 py-1.5 rounded-lg transition-colors ${
              mode === "code"
                ? "bg-white text-zinc-950 shadow-sm"
                : "text-slate-500 hover:text-zinc-900"
            }`}
          >
            Enter code
          </button>
          <button
            type="button"
            onClick={() => { setMode("camera"); setError(null); lastScannedRef.current = null; }}
            className={`px-4 py-1.5 rounded-lg transition-colors ${
              mode === "camera"
                ? "bg-white text-zinc-950 shadow-sm"
                : "text-slate-500 hover:text-zinc-900"
            }`}
          >
            Scan QR
          </button>
        </div>

        {mode === "camera" ? (
          <div className="space-y-3">
            <div
              ref={scannerContainerRef}
              className={`relative mx-auto aspect-square w-full max-w-xs overflow-hidden rounded-2xl ring-1 ring-slate-200 bg-black ${
                isFrontCamera ? "[&_video]:-scale-x-100" : ""
              }`}
            >
              <Scanner
                onScan={handleScan}
                onError={(err) => {
                  // Permission denied / no camera / device error — surface a
                  // friendly message instead of letting the lib silently fail.
                  const msg = err instanceof Error ? err.message : "Camera unavailable";
                  setError(`Camera: ${msg}. Switch to "Enter code" instead.`);
                }}
                constraints={{ facingMode: "environment" }}
                styles={{
                  container: { width: "100%", height: "100%" },
                  video: { width: "100%", height: "100%", objectFit: "cover" },
                }}
                components={{ finder: false }}
              />
              {/* Reticle overlay — pure CSS, doesn't interfere with the scan */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="w-44 h-44 rounded-2xl border-2 border-emerald-400/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
              </div>
            </div>
            <p className="text-center text-[11px] text-slate-500">
              Point the camera at the traveler's QR. We'll verify automatically.
            </p>
          </div>
        ) : (
        <>
        <label className="block text-sm font-semibold text-zinc-900 mb-3 text-center">
          Pickup code
        </label>
        {/* 10 boxes split 5+5 with a wider gap in the middle so the eye
            can chunk them. Tight sizing on phones to keep the row inside
            ~300px wide; bumps up at sm: for tablets and laptops. */}
        <div className="flex items-center justify-center gap-1 sm:gap-1.5">
          {digits.map((d, i) => (
            <div key={i} className="contents">
              <input
                id={`pickup-digit-${i}`}
                inputMode="numeric"
                autoComplete="off"
                maxLength={1}
                value={d}
                onChange={(e) => setDigit(i, e.target.value)}
                onPaste={handlePaste}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !digits[i] && i > 0) {
                    document.getElementById(`pickup-digit-${i - 1}`)?.focus();
                  }
                }}
                className="w-7 h-11 sm:w-10 sm:h-13 text-center text-base sm:text-xl font-mono font-bold tabular-nums rounded-lg border border-slate-200 bg-slate-50/60 focus:outline-none focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
              {/* Visual divider at the midpoint of the 10-digit code */}
              {i === 4 && <span className="w-1.5 sm:w-3" aria-hidden />}
            </div>
          ))}
        </div>
        </>
        )}

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            <div className="font-semibold">✓ {success.traveler} verified onboard</div>
            <div className="text-[11px] text-emerald-800 mt-0.5">
              {success.route} · {success.seats} seat{success.seats === 1 ? "" : "s"}
            </div>
          </div>
        )}

        {mode === "code" && (
          <div className="mt-6 flex justify-center">
            <button
              type="submit"
              disabled={submitting || (digits.join("").length !== CODE_LENGTH && digits.join("").length !== 6)}
              className="bg-zinc-900 hover:bg-zinc-800 disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-xl text-sm"
            >
              {submitting ? "Verifying…" : "Verify pickup"}
            </button>
          </div>
        )}
        {mode === "camera" && submitting && (
          <div className="mt-4 text-center text-xs text-slate-500">Verifying scanned code…</div>
        )}

        <p className="text-[11px] text-slate-400 text-center mt-4">
          The trip moves to <span className="font-semibold">In progress</span> as soon as the code is verified. Your passenger marks the trip complete when they arrive.
        </p>
      </form>
    </Page>
  );
}
