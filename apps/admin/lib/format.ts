/**
 * Locale-aware money formatter. Uses Intl.NumberFormat so amounts render with
 * the proper symbol (₦, GH₵, $, €, …) and the viewer's local thousands /
 * decimal conventions instead of "NGN 18000".
 *
 * - Falls back gracefully for unknown currency codes.
 * - Hides decimals when the amount is whole (so "₦18,000" not "₦18,000.00")
 *   but keeps them when present (so "$5.99" stays as "$5.99").
 * - Accepts string amounts because Prisma Decimal serialises as strings.
 */
export function formatMoney(
  amount: number | string | null | undefined,
  currency: string | null | undefined,
  locale?: string,
): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount ?? 0;
  if (!Number.isFinite(num)) return `${currency ?? ''} 0`.trim();
  const code = (currency || 'USD').toUpperCase();
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num as number);
  } catch {
    // Unknown currency code (some Intl runtimes are picky about exotic codes).
    return `${code} ${(num as number).toLocaleString(locale)}`;
  }
}

/** Plain integer formatter — same locale rules, no currency. */
export function formatNumber(value: number | string | null | undefined, locale?: string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value ?? 0;
  if (!Number.isFinite(num)) return '0';
  return (num as number).toLocaleString(locale);
}
