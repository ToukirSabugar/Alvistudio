"use client";

import { useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/Button";
import {
  enquirySchema,
  enquiryTypes,
  fieldErrors,
  fieldsFor,
  type EnquiryType,
  type FieldDef,
} from "@/lib/enquiry-schema";

const typeLabels: Record<EnquiryType, string> = {
  architecture: "Architecture",
  interior: "Interior",
  civil: "Civil",
  consultation: "Consultation",
};

const inputCls =
  "block min-h-11 w-full border border-ink/40 bg-paper px-3 py-2 text-base text-ink placeholder:text-muted " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink aria-invalid:border-red-800";

type Status = "idle" | "sending" | "done" | "error";

function Field({
  id,
  label,
  required,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">
        {label}
        {required ? <span aria-hidden="true"> *</span> : <span className="text-muted"> (optional)</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-800">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function DynamicField({
  def,
  value,
  error,
  onChange,
}: {
  def: FieldDef;
  value: string;
  error?: string;
  onChange: (v: string) => void;
}) {
  const id = `f-${def.name}`;
  const common = {
    id,
    name: def.name,
    value,
    required: def.required,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-error` : undefined,
    className: inputCls,
  } as const;
  return (
    <Field id={id} label={def.label} required={def.required} error={error}>
      {def.kind === "select" ? (
        <select {...common} onChange={(e) => onChange(e.target.value)}>
          <option value="">Choose</option>
          {def.options?.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : def.kind === "textarea" ? (
        <textarea {...common} rows={4} placeholder={def.placeholder} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input {...common} type="text" placeholder={def.placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
    </Field>
  );
}

export function EnquiryForm({ initialType }: { initialType: EnquiryType }) {
  const [type, setType] = useState<EnquiryType>(initialType);
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [ref, setRef] = useState("");
  const [message, setMessage] = useState("");
  const busy = useRef(false);

  const set = (name: string, v: string) => setValues((p) => ({ ...p, [name]: v }));
  const v = (name: string) => values[name] ?? "";

  function pickType(t: EnquiryType) {
    setType(t);
    setErrors({});
    setMessage("");
    if (status === "error") setStatus("idle");
    window.history.replaceState(null, "", `?type=${t}`);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy.current) return;

    const payload: Record<string, string> = { type, website: v("website") };
    for (const k of ["name", "phone", "email", "message"]) payload[k] = v(k);
    for (const f of fieldsFor(type)) payload[f.name] = v(f.name);

    const parsed = enquirySchema.safeParse(payload);
    if (!parsed.success) {
      const errs = fieldErrors(parsed.error);
      setErrors(errs);
      setStatus("error");
      setMessage("Please fix the highlighted fields.");
      const first = Object.keys(errs)[0];
      document.getElementById(`f-${first}`)?.focus();
      return;
    }

    busy.current = true;
    setErrors({});
    setStatus("sending");
    setMessage("Sending your enquiry.");
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        ref?: string;
        error?: string;
        errors?: Record<string, string>;
      };
      if (res.ok && data.ok) {
        setRef(data.ref ?? "");
        setStatus("done");
        return;
      }
      if (data.errors) setErrors(data.errors);
      setStatus("error");
      setMessage(data.error ?? "Please check the form and try again.");
    } catch {
      setStatus("error");
      setMessage("We could not reach the server. Please call or WhatsApp us.");
    } finally {
      busy.current = false;
    }
  }

  if (status === "done") {
    return (
      <div role="status" className="border border-ink/30 bg-paper-2 p-6 sm:p-8">
        <h2 className="display text-2xl">Enquiry received</h2>
        <p className="mt-3">
          Thank you, we will get back to you soon. {ref ? "Your reference number is " : ""}
          {ref ? <strong className="font-semibold">{ref}</strong> : null}
          {ref ? "." : ""}
        </p>
        {ref ? <p className="mt-2 text-sm text-muted">Quote this number when you call or message us.</p> : null}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate aria-busy={status === "sending"} className="space-y-5">
      <fieldset>
        <legend className="mb-2 text-sm font-medium">What do you need?</legend>
        <div className="flex flex-wrap gap-2">
          {enquiryTypes.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={type === t}
              onClick={() => pickType(t)}
              className={
                "min-h-11 border px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink " +
                (type === t ? "border-ink bg-ink text-paper" : "border-ink/40 text-ink hover:border-ink")
              }
            >
              {typeLabels[t]}
            </button>
          ))}
        </div>
      </fieldset>

      <Field id="f-name" label="Your name" required error={errors.name}>
        <input
          id="f-name"
          name="name"
          type="text"
          autoComplete="name"
          required
          value={v("name")}
          onChange={(e) => set("name", e.target.value)}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? "f-name-error" : undefined}
          className={inputCls}
        />
      </Field>
      <Field id="f-phone" label="Mobile number" required error={errors.phone}>
        <input
          id="f-phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          placeholder="e.g. 98765 43210"
          value={v("phone")}
          onChange={(e) => set("phone", e.target.value)}
          aria-invalid={errors.phone ? true : undefined}
          aria-describedby={errors.phone ? "f-phone-error" : undefined}
          className={inputCls}
        />
      </Field>
      <Field id="f-email" label="Email" error={errors.email}>
        <input
          id="f-email"
          name="email"
          type="email"
          autoComplete="email"
          value={v("email")}
          onChange={(e) => set("email", e.target.value)}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? "f-email-error" : undefined}
          className={inputCls}
        />
      </Field>

      {fieldsFor(type).map((def) => (
        <DynamicField
          key={`${type}-${def.name}`}
          def={def}
          value={v(def.name)}
          error={errors[def.name]}
          onChange={(val) => set(def.name, val)}
        />
      ))}

      <Field id="f-message" label="Anything else we should know?" error={errors.message}>
        <textarea
          id="f-message"
          name="message"
          rows={4}
          value={v("message")}
          onChange={(e) => set("message", e.target.value)}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? "f-message-error" : undefined}
          className={inputCls}
        />
      </Field>

      {/* Honeypot: off-screen, not focusable, ignored by password managers. Bots fill it. */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}>
        <label htmlFor="f-website">Leave this field empty</label>
        <input
          id="f-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={v("website")}
          onChange={(e) => set("website", e.target.value)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={status === "sending"} aria-busy={status === "sending"}>
          {status === "sending" ? "Sending" : "Send enquiry"}
        </Button>
        <p
          role={status === "error" ? "alert" : "status"}
          aria-live="polite"
          className={"text-sm " + (status === "error" ? "text-red-800" : "text-muted")}
        >
          {message}
        </p>
      </div>
    </form>
  );
}
