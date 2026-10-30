// India time (IST, UTC+05:30, no daylight saving). Dates are stored in UTC; these helpers turn them into India
// days for filters and into readable text for the admin. Pure, no Intl, so the output is the same on every server.

const OFFSET_MS = 330 * 60 * 1000;
const DAY_MS = 86_400_000;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export type DateRange = "today" | "week" | "month";

/** The instant India's day containing `now` began. */
export function istDayStart(now: Date): Date {
  const local = now.getTime() + OFFSET_MS;
  return new Date(local - (((local % DAY_MS) + DAY_MS) % DAY_MS) - OFFSET_MS);
}

/** "YYYY-MM-DD" read as midnight in India. Null for anything else, including impossible dates. */
export function parseIstDate(s: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const utc = Date.UTC(y, mo - 1, d);
  const check = new Date(utc);
  if (check.getUTCFullYear() !== y || check.getUTCMonth() !== mo - 1 || check.getUTCDate() !== d) return null;
  return new Date(utc - OFFSET_MS);
}

/** Start of a quick range: today, the last 7 days (today included), or this calendar month, all India time. */
export function rangeStart(range: DateRange, now: Date): Date {
  const today = istDayStart(now);
  if (range === "today") return today;
  if (range === "week") return new Date(today.getTime() - 6 * DAY_MS);
  const local = new Date(today.getTime() + OFFSET_MS);
  return new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), 1) - OFFSET_MS);
}

/** "30 Oct 2026", "30 Oct 2026, 1:30 am" or "Friday, 30 October 2026, 1:30 am". Empty for an invalid date. */
export function formatIst(value: Date | string, style: "date" | "datetime" | "long"): string {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const l = new Date(d.getTime() + OFFSET_MS);
  const day = l.getUTCDate();
  const year = l.getUTCFullYear();
  const h24 = l.getUTCHours();
  const time = `${h24 % 12 || 12}:${String(l.getUTCMinutes()).padStart(2, "0")} ${h24 < 12 ? "am" : "pm"}`;
  if (style === "date") return `${day} ${MONTHS[l.getUTCMonth()]} ${year}`;
  if (style === "datetime") return `${day} ${MONTHS[l.getUTCMonth()]} ${year}, ${time}`;
  return `${DAYS[l.getUTCDay()]}, ${day} ${MONTHS_LONG[l.getUTCMonth()]} ${year}, ${time}`;
}
