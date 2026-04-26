/**
 * Single source of truth for the countries SmatWay can transact in —
 * driven by what Paystack and Flutterwave together actually support
 * for both COLLECTIONS (traveler payments) and PAYOUTS (transporter
 * settlements). The currency is the country's settlement currency.
 *
 * The traveler / transporter / route flows all read this list so the
 * platform stays internally consistent — a transporter can never set a
 * currency we can't pay them out in, and a traveler can never browse a
 * route in a currency we can't charge them in.
 *
 * `providers` is the union — at least one of {Paystack, Flutterwave}
 * works for that country. Specific UI surfaces (e.g. the payout-settings
 * provider tab) filter further on a single provider when needed.
 */
export type PayoutProviderName = "PAYSTACK" | "FLUTTERWAVE";

export interface PayoutCountry {
  /** ISO-2 country code, e.g. "NG" */
  country: string;
  /** Display name */
  countryName: string;
  /** ISO-4217 settlement currency, e.g. "NGN" */
  currency: string;
  /** Which providers can route to this country */
  providers: ReadonlyArray<PayoutProviderName>;
}

export const PAYOUT_COUNTRIES: ReadonlyArray<PayoutCountry> = [
  { country: "NG", countryName: "Nigeria",        currency: "NGN", providers: ["PAYSTACK", "FLUTTERWAVE"] },
  { country: "GH", countryName: "Ghana",          currency: "GHS", providers: ["PAYSTACK", "FLUTTERWAVE"] },
  { country: "KE", countryName: "Kenya",          currency: "KES", providers: ["PAYSTACK", "FLUTTERWAVE"] },
  { country: "ZA", countryName: "South Africa",   currency: "ZAR", providers: ["PAYSTACK", "FLUTTERWAVE"] },
  { country: "EG", countryName: "Egypt",          currency: "EGP", providers: ["PAYSTACK"] },
  { country: "CI", countryName: "Côte d'Ivoire",  currency: "XOF", providers: ["PAYSTACK", "FLUTTERWAVE"] },
  { country: "UG", countryName: "Uganda",         currency: "UGX", providers: ["FLUTTERWAVE"] },
  { country: "TZ", countryName: "Tanzania",       currency: "TZS", providers: ["FLUTTERWAVE"] },
  { country: "RW", countryName: "Rwanda",         currency: "RWF", providers: ["FLUTTERWAVE"] },
  { country: "ZM", countryName: "Zambia",         currency: "ZMW", providers: ["FLUTTERWAVE"] },
  { country: "CM", countryName: "Cameroon",       currency: "XAF", providers: ["FLUTTERWAVE"] },
  { country: "SL", countryName: "Sierra Leone",   currency: "SLL", providers: ["FLUTTERWAVE"] },
  { country: "ET", countryName: "Ethiopia",       currency: "ETB", providers: ["FLUTTERWAVE"] },
] as const;

/** Resolve a country code → its settlement entry. Case-insensitive. */
export function payoutCountryEntry(code: string | null | undefined): PayoutCountry | undefined {
  if (!code) return undefined;
  const upper = code.toUpperCase();
  return PAYOUT_COUNTRIES.find((c) => c.country === upper);
}

/** Settlement currency for a country code. Falls back to "NGN" if unknown. */
export function currencyForCountry(code: string | null | undefined): string {
  return payoutCountryEntry(code)?.currency ?? "NGN";
}

/** Set of supported currency codes — for fast membership checks. */
export const SUPPORTED_CURRENCIES: ReadonlySet<string> = new Set(
  PAYOUT_COUNTRIES.map((c) => c.currency),
);
