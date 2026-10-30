// Enquiry workflow states, in order. Pure (no database import) so filters and tests can use it.
export type EnquiryStatus = "new" | "seen" | "contacted" | "quoted" | "closed";

export const ENQUIRY_STATUSES: { id: EnquiryStatus; label: string }[] = [
  { id: "new", label: "New" },
  { id: "seen", label: "Seen" },
  { id: "contacted", label: "Contacted" },
  { id: "quoted", label: "Quoted" },
  { id: "closed", label: "Closed" },
];

export function isEnquiryStatus(v: unknown): v is EnquiryStatus {
  return typeof v === "string" && ENQUIRY_STATUSES.some((s) => s.id === v);
}

export function statusLabel(id: string | null): string {
  return id === null ? "" : (ENQUIRY_STATUSES.find((s) => s.id === id)?.label ?? id);
}
