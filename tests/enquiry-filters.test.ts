import { describe, expect, it } from "vitest";
import { enquiryWhereSql, filterQuery, parseEnquiryFilter } from "@/lib/enquiry-filters";

const now = new Date("2026-10-30T10:00:00Z");

describe("parseEnquiryFilter", () => {
  it("keeps only known values", () => {
    const f = parseEnquiryFilter({ status: "bogus", type: "interior", range: "year", page: "abc", q: "  Ravi  " });
    expect(f).toEqual({ q: "Ravi", type: "interior", page: 1 });
  });

  it("swaps from and to when they are the wrong way round", () => {
    const f = parseEnquiryFilter({ from: "2026-10-20", to: "2026-10-01" });
    expect(f.from).toBe("2026-10-01");
    expect(f.to).toBe("2026-10-20");
  });

  it("drops bad dates, ignores dates when a quick range is chosen, reads arrays", () => {
    expect(parseEnquiryFilter({ from: "2026-13-01" }).from).toBeUndefined();
    const f = parseEnquiryFilter({ range: "today", from: "2026-10-01", status: ["new", "seen"], page: "3" });
    expect(f).toEqual({ q: "", range: "today", status: "new", page: 3 });
  });
});

describe("enquiryWhereSql", () => {
  it("is empty with no filter", () => {
    expect(enquiryWhereSql(parseEnquiryFilter({}), now)).toEqual({ sql: "", params: [] });
  });

  it("treats % and _ in the search literally", () => {
    const { sql, params } = enquiryWhereSql(parseEnquiryFilter({ q: "50%_x" }), now);
    expect(sql).toBe("WHERE (name LIKE ? ESCAPE '\\\\' OR phone LIKE ? ESCAPE '\\\\' OR ref LIKE ? ESCAPE '\\\\')");
    expect(params).toEqual(["%50\\%\\_x%", "%50\\%\\_x%", "%50\\%\\_x%"]);
  });

  it("combines status, type and an inclusive date range in India time", () => {
    const { sql, params } = enquiryWhereSql(parseEnquiryFilter({ status: "new", type: "civil", from: "2026-10-01", to: "2026-10-30" }), now);
    expect(sql).toBe("WHERE status = ? AND type = ? AND created_at >= ? AND created_at < ?");
    expect(params[0]).toBe("new");
    expect(params[1]).toBe("civil");
    expect((params[2] as Date).toISOString()).toBe("2026-09-30T18:30:00.000Z");
    expect((params[3] as Date).toISOString()).toBe("2026-10-30T18:30:00.000Z"); // end of 30 Oct, India
  });

  it("uses the quick range start", () => {
    const { sql, params } = enquiryWhereSql(parseEnquiryFilter({ range: "today" }), now);
    expect(sql).toBe("WHERE created_at >= ?");
    expect((params[0] as Date).toISOString()).toBe("2026-10-29T18:30:00.000Z");
  });
});

describe("filterQuery", () => {
  it("writes back only what is set, with overrides", () => {
    const f = parseEnquiryFilter({ q: "a b", status: "seen", page: "2" });
    expect(filterQuery(f)).toBe("q=a+b&status=seen&page=2");
    expect(filterQuery(f, { page: 1 })).toBe("q=a+b&status=seen");
    expect(filterQuery(f, { status: undefined, page: 1 })).toBe("q=a+b");
  });
});
