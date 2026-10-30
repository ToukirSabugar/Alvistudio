// One schema for client and server. fieldsFor() drives the form; the same definitions build the zod rules.
import { z } from "zod";

export const enquiryTypes = ["architecture", "interior", "civil", "consultation"] as const;
export type EnquiryType = (typeof enquiryTypes)[number];

export type FieldDef = {
  name: string;
  label: string;
  kind: "text" | "select" | "textarea";
  options?: readonly string[];
  required: boolean;
  placeholder?: string;
};

const budget = ["Under ₹10 lakh", "₹10 to 25 lakh", "₹25 to 50 lakh", "Above ₹50 lakh", "Not sure yet"] as const;
const timeline = ["As soon as possible", "Within 3 months", "3 to 6 months", "Just exploring"] as const;

const defs: Record<EnquiryType, readonly FieldDef[]> = {
  architecture: [
    { name: "plotSize", label: "Plot size", kind: "text", required: true, placeholder: "e.g. 1500 sq ft" },
    { name: "location", label: "Plot location", kind: "text", required: true, placeholder: "Area or town" },
    { name: "buildingType", label: "What do you want to build?", kind: "select", required: true,
      options: ["House", "Bungalow", "Farmhouse", "Shop or office", "Other"] },
    { name: "budgetRange", label: "Budget range", kind: "select", required: false, options: budget },
  ],
  interior: [
    { name: "spaceType", label: "Space", kind: "select", required: true,
      options: ["Full home", "Living room", "Kitchen", "Bedroom", "Office or shop", "Tuition classes", "Other"] },
    { name: "area", label: "Approximate area", kind: "text", required: true, placeholder: "e.g. 900 sq ft" },
    { name: "budgetRange", label: "Budget range", kind: "select", required: false, options: budget },
    { name: "timeline", label: "When do you want to start?", kind: "select", required: false, options: timeline },
  ],
  civil: [
    { name: "siteLocation", label: "Site location", kind: "text", required: true, placeholder: "Area or town" },
    { name: "workType", label: "Type of work", kind: "select", required: true,
      options: ["New build", "Renovation", "Repair"] },
    { name: "area", label: "Approximate area", kind: "text", required: false, placeholder: "e.g. 1200 sq ft" },
    { name: "timeline", label: "When do you want to start?", kind: "select", required: false, options: timeline },
  ],
  consultation: [
    { name: "preferredDay", label: "Preferred day", kind: "text", required: true, placeholder: "e.g. Saturday" },
    { name: "preferredTime", label: "Preferred time", kind: "select", required: true,
      options: ["Morning", "Afternoon", "Evening"] },
    { name: "topic", label: "What do you want to discuss?", kind: "select", required: true,
      options: ["Architecture", "Interior", "Civil work", "Not sure yet"] },
  ],
};

export function fieldsFor(type: EnquiryType): readonly FieldDef[] {
  return defs[type];
}

const phoneRule = z
  .string()
  .trim()
  .refine((v) => /^(?:\+?91|0)?[6-9]\d{9}$/.test(v.replace(/[\s-]/g, "")), {
    message: "Enter a 10 digit mobile number (+91 is fine).",
  });

function fieldRule(f: FieldDef): z.ZodType {
  let base: z.ZodType<string> = z.string().trim().max(200);
  if (f.kind === "select" && f.options) {
    const opts = f.options;
    base = z.string().refine((v) => v === "" || opts.includes(v), { message: "Choose one of the options." });
  }
  if (f.required) {
    return base.refine((v) => v.trim().length > 0, { message: `${f.label} is required.` });
  }
  return base.optional().default("");
}

function build(type: EnquiryType) {
  const shape: Record<string, z.ZodType> = {
    type: z.literal(type),
    name: z.string().trim().min(2, "Please enter your name.").max(100),
    phone: phoneRule,
    email: z.union([z.literal(""), z.email("Enter a valid email address.")]).optional().default(""),
    message: z.string().trim().max(2000).optional().default(""),
    // Honeypot: real visitors never see it, bots fill it.
    website: z.string().max(0).optional().default(""),
  };
  for (const f of defs[type]) shape[f.name] = fieldRule(f);
  return z.object(shape);
}

export const enquirySchema = z.discriminatedUnion("type", [
  build("architecture"),
  build("interior"),
  build("civil"),
  build("consultation"),
]);

export type EnquiryData = {
  type: EnquiryType;
  name: string;
  phone: string;
  email: string;
  message: string;
  website: string;
} & Record<string, string>;

/** Field name -> first error message, for display under inputs. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
