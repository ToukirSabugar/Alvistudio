// CSV for Excel: every cell quoted, CRLF rows. Cells that a spreadsheet would run as a formula get a leading
// apostrophe. The route adds the UTF-8 byte-order mark so Excel reads Gujarati and the rupee sign correctly.
function cell(v: string): string {
  const safe = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function toCsv(rows: string[][]): string {
  return rows.map((r) => r.map(cell).join(",")).join("\r\n") + "\r\n";
}
