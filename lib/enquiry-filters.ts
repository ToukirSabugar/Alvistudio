// Turns the admin inbox's query string into a safe, parameterised SQL WHERE clause. Unknown values are ignored.
import { enquiryTypes, type EnquiryType } from "@/lib/enquiry-schema";
import { isEnquiryStatus, type EnquiryStatus } from "@/lib/enquiry-status";
import { parseIstDate, rangeStart, type DateRange } from "@/lib/ist";

const RANGES: readonly DateRange[] = ["today", "week", "month"];
const DAY_MS = 86_400_000;

export type EnquiryFilter = {
  q: string;
  status?: EnquiryStatus;
  type?: EnquiryType;
  range?: DateRange;
  from?: string;
  to?: string;
  page: number;
};

type Params = Record<string, string | string[] | undefined>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export function parseEnquiryFilter(params: Params): EnquiryFilter {
  const f: EnquiryFilter = { q: (first(params.q) ?? "").trim().slice(0, 80), page: 1 };
  const status = first(params.status);
  if (isEnquiryStatus(status)) f.status = status;
  const type = first(params.type);
  if ((enquiryTypes as readonly string[]).includes(type ?? "")) f.type = type as EnquiryType;
  const range = first(params.range);
  if ((RANGES as readonly string[]).includes(range ?? "")) f.range = range as DateRange;
  else {
    let from = first(params.from) ?? "";
    let to = first(params.to) ?? "";
    if (!parseIstDate(from)) from = "";
    if (!parseIstDate(to)) to = "";
    if (from && to && from > to) [from, to] = [to, from];
    if (from) f.from = from;
    if (to) f.to = to;
  }
  const page = first(params.page) ?? "";
  if (/^\d{1,5}$/.test(page) && Number(page) >= 1) f.page = Number(page);
  return f;
}

const likeParam = (q: string) => `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;

export function enquiryWhereSql(f: EnquiryFilter, now: Date = new Date()): { sql: string; params: (string | Date)[] } {
  const parts: string[] = [];
  const params: (string | Date)[] = [];
  if (f.q) {
    parts.push("(name LIKE ? ESCAPE '\\\\' OR phone LIKE ? ESCAPE '\\\\' OR ref LIKE ? ESCAPE '\\\\')");
    const p = likeParam(f.q);
    params.push(p, p, p);
  }
  if (f.status) {
    parts.push("status = ?");
    params.push(f.status);
  }
  if (f.type) {
    parts.push("type = ?");
    params.push(f.type);
  }
  if (f.range) {
    parts.push("created_at >= ?");
    params.push(rangeStart(f.range, now));
  } else {
    const from = f.from ? parseIstDate(f.from) : null;
    const to = f.to ? parseIstDate(f.to) : null;
    if (from) {
      parts.push("created_at >= ?");
      params.push(from);
    }
    if (to) {
      parts.push("created_at < ?");
      params.push(new Date(to.getTime() + DAY_MS)); // the whole "to" day is included
    }
  }
  return { sql: parts.length ? `WHERE ${parts.join(" AND ")}` : "", params };
}

/** Query string for links that keep the current filter. Page 1 is left out. */
export function filterQuery(f: EnquiryFilter, overrides: Partial<EnquiryFilter> = {}): string {
  const m = { ...f, ...overrides };
  const s = new URLSearchParams();
  if (m.q) s.set("q", m.q);
  if (m.status) s.set("status", m.status);
  if (m.type) s.set("type", m.type);
  if (m.range) s.set("range", m.range);
  if (m.from) s.set("from", m.from);
  if (m.to) s.set("to", m.to);
  if (m.page && m.page > 1) s.set("page", String(m.page));
  return s.toString();
}
