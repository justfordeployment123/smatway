/**
 * Calendar-true date range filter used on the bookings pages (transporter
 * and traveler). Three buckets only: today, this week (Mon–Sun), this
 * month (1st → last day). No "all time" / "custom" — those make sense for
 * admin reporting; here a user is glancing at upcoming + recent trips, so
 * a tight default beats option overload.
 */
export type DateRange = "TODAY" | "WEEK" | "MONTH";

export const DATE_RANGE_TABS: readonly DateRange[] = ["TODAY", "WEEK", "MONTH"] as const;

export const DATE_RANGE_LABELS: Record<DateRange, string> = {
  TODAY: "TODAY",
  WEEK: "THIS WEEK",
  MONTH: "THIS MONTH",
};

/**
 * Inclusive date boundaries for `range`, anchored on the local day.
 *
 *   TODAY → 00:00:00 → 23:59:59.999 of today
 *   WEEK  → 3 days before today → 3 days after today  (7-day rolling window)
 *   MONTH → 15 days before today → 15 days after today (31-day rolling window)
 *
 * "Week" and "month" are deliberately *centered on today* rather than
 * calendar boundaries — for a personal bookings view, the user wants
 * "trips around now" not "trips that happen to fall within ISO week 17".
 * Equal split before/after surfaces both recent past trips and upcoming
 * ones in the same glance.
 *
 * `from`/`to` are JS Dates in the runtime's local timezone. Compare against
 * `new Date(booking.someDateTime).getTime()` for an absolute-time check
 * that's correct regardless of where the user is.
 */
export function dateRangeBoundaries(range: DateRange): { from: Date; to: Date } {
  const now = new Date();
  const from = new Date(now);
  from.setHours(0, 0, 0, 0);
  const to = new Date(now);
  to.setHours(23, 59, 59, 999);

  if (range === "WEEK") {
    // 3 days back + today + 3 days forward = 7-day window centered on today.
    from.setDate(from.getDate() - 3);
    to.setDate(to.getDate() + 3);
  } else if (range === "MONTH") {
    // 15 days back + today + 15 days forward = 31-day window centered on today.
    from.setDate(from.getDate() - 15);
    to.setDate(to.getDate() + 15);
  }
  // TODAY needs no further adjustment — start/end of today already.

  return { from, to };
}

/** Convenience: is this date inside the named bucket? */
export function isInDateRange(date: Date | string, range: DateRange): boolean {
  const { from, to } = dateRangeBoundaries(range);
  const t = (typeof date === "string" ? new Date(date) : date).getTime();
  return t >= from.getTime() && t <= to.getTime();
}
