import { fieldsFor, enquiryTypes, type EnquiryType } from "@/lib/enquiry-schema";

export const TYPE_LABELS: Record<EnquiryType, string> = {
  architecture: "Architecture",
  interior: "Interior",
  civil: "Civil",
  consultation: "Consultation",
};

export function typeLabel(t: string): string {
  return (TYPE_LABELS as Record<string, string>)[t] ?? t;
}

export function isEnquiryType(t: string): t is EnquiryType {
  return (enquiryTypes as readonly string[]).includes(t);
}

/** The visitor's extra answers, labelled with the form's own wording, in form order. Unknown keys come last. */
export function labelledDetails(type: string, details: Record<string, string>): [string, string][] {
  const defs = isEnquiryType(type) ? fieldsFor(type) : [];
  const known = defs.filter((d) => details[d.name]).map((d) => [d.label, details[d.name]] as [string, string]);
  const names = new Set(defs.map((d) => d.name));
  const rest = Object.entries(details).filter(([k, v]) => !names.has(k) && v) as [string, string][];
  return [...known, ...rest];
}

/** wa.me link for an Indian mobile number typed in any of the accepted shapes. */
export function whatsappLink(phone: string): string {
  const digits = phone.replace(/\D/g, "").slice(-10);
  return `https://wa.me/91${digits}`;
}

export const STATUS_STYLES: Record<string, string> = {
  new: "bg-camel text-ink",
  seen: "bg-paper-2 text-ink border border-ink/30",
  contacted: "bg-ink/80 text-paper",
  quoted: "bg-camel-deep text-paper",
  closed: "bg-white text-muted border border-ink/20",
};
