/**
 * Reusable Paystack / Flutterwave logo. Pulls the SVG from /public/logo
 * so we don't pay React-rendering cost on a static image. Two sizes
 * cover the surfaces: a "tile" (full provider chip in pickers, payout
 * settings) and a "badge" (tiny icon on route cards, listings).
 *
 * `provider` is case-insensitive — accepts "PAYSTACK"/"paystack" so it
 * lines up with both the Prisma PaymentMethod enum and the lower-case
 * literals the pay page uses.
 */
type ProviderName = "PAYSTACK" | "FLUTTERWAVE" | "paystack" | "flutterwave";

const FILES: Record<"PAYSTACK" | "FLUTTERWAVE", string> = {
  PAYSTACK: "/logo/paystack.svg",
  FLUTTERWAVE: "/logo/flutterwave.svg",
};

const LABELS: Record<"PAYSTACK" | "FLUTTERWAVE", string> = {
  PAYSTACK: "Paystack",
  FLUTTERWAVE: "Flutterwave",
};

function normalize(p: ProviderName): "PAYSTACK" | "FLUTTERWAVE" {
  return (p.toUpperCase() as "PAYSTACK" | "FLUTTERWAVE");
}

export function ProviderLogo({
  provider,
  size = 16,
  className = "",
  decorative = false,
}: {
  provider: ProviderName;
  /** Square pixel size — defaults to 16 (good for inline meta rows). */
  size?: number;
  className?: string;
  /**
   * Pass `true` when the logo sits next to a "Paystack" / "Flutterwave"
   * text label — the alt text would just duplicate the label, and if
   * the SVG ever fails to load you'd get the brand name printed twice
   * on screen. Decorative logos render with empty alt + aria-hidden so
   * they vanish visually + for screen readers when broken.
   */
  decorative?: boolean;
}) {
  const key = normalize(provider);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={FILES[key]}
      alt={decorative ? "" : LABELS[key]}
      aria-hidden={decorative || undefined}
      width={size}
      height={size}
      // The logos already include their own colors; constrain the box and
      // let `object-contain` keep the aspect ratio steady regardless of
      // the original viewBox (Paystack is wider than it is tall).
      className={`inline-block object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

/**
 * Small framed pill — provider logo + label. Used on the pay page row
 * and the payout-settings provider tabs where we want both signals.
 */
export function ProviderChip({
  provider,
  size = 20,
  className = "",
}: {
  provider: ProviderName;
  size?: number;
  className?: string;
}) {
  const key = normalize(provider);
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <ProviderLogo provider={key} size={size} />
      <span className="text-[12px] font-semibold text-zinc-950">{LABELS[key]}</span>
    </span>
  );
}
