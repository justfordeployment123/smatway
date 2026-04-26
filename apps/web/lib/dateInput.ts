/**
 * Local-time formatters for HTML date / datetime-local inputs.
 *
 * `Date.prototype.toISOString()` returns UTC, which makes browsers in any
 * non-UTC timezone show yesterday/tomorrow as the default — e.g. a Karachi
 * user (UTC+5) at 02:00 local sees an input pre-filled with the previous
 * day's UTC date. Use these helpers instead so the default always matches
 * the user's wall clock.
 */
const pad = (n: number) => String(n).padStart(2, "0");

/** `YYYY-MM-DD` for `<input type="date">`, anchored on the user's local day. */
export function toLocalDateInput(d: Date = new Date()): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** `YYYY-MM-DDTHH:mm` for `<input type="datetime-local">` in local time. */
export function toLocalDateTimeInput(d: Date = new Date()): string {
  return `${toLocalDateInput(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Add days to `d` and return a new Date — used for `max=` attributes that
 * need to stay relative to "now" rather than a fixed boundary.
 */
export function addDays(d: Date, days: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + days);
  return out;
}
