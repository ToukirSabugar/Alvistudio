import { describe, expect, it } from "vitest";
import { toCsv } from "@/lib/csv";

describe("toCsv", () => {
  it("quotes every cell and doubles inner quotes", () => {
    expect(toCsv([["a", 'say "hi"'], ["line\nbreak", ""]])).toBe('"a","say ""hi"""\r\n"line\nbreak",""\r\n');
  });

  it("stops spreadsheet formulas", () => {
    expect(toCsv([["=SUM(A1)", "+91 98", "-x", "@cmd", "\tx", "ok"]])).toBe(
      `"'=SUM(A1)","'+91 98","'-x","'@cmd","'\tx","ok"\r\n`,
    );
  });
});
