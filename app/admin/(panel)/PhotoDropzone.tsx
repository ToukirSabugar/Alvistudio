"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

const OK_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 8 * 1024 * 1024;

type Props = {
  /** Form field name; the chosen photos travel with the surrounding form under this name. */
  name: string;
  /** Several photos at once, or exactly one. */
  multiple?: boolean;
  /** Most photos that can be chosen (multiple only). */
  max?: number;
  label?: string;
};

/** Shows a chosen photo before it is saved. The preview address is released once the image has loaded. */
function Preview({ file }: { file: File }) {
  const url = useMemo(() => URL.createObjectURL(file), [file]);
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt="" onLoad={() => URL.revokeObjectURL(url)} className="h-full w-full object-cover" />;
}

/**
 * The one way to choose photos from the computer in the admin: tap or click to browse, or drop photos onto the
 * area. Previews with a remove button; type and size are checked before anything is sent.
 */
export function PhotoDropzone({ name, multiple = false, max = 6, label }: Props) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [notes, setNotes] = useState<string[]>([]);
  const [over, setOver] = useState(false);
  const limit = multiple ? max : 1;

  // The real file box is what the form submits, so it always holds exactly the photos shown here.
  function commit(next: File[]) {
    const dt = new DataTransfer();
    next.forEach((f) => dt.items.add(f));
    if (input.current) input.current.files = dt.files;
    setFiles(next);
  }

  function choose(list: FileList | File[]) {
    const accepted: File[] = [];
    const problems: string[] = [];
    const base = multiple ? files : [];
    for (const f of Array.from(list)) {
      if ([...base, ...accepted].some((x) => x.name === f.name && x.size === f.size && x.lastModified === f.lastModified)) continue;
      if (!OK_TYPES.includes(f.type)) problems.push(`${f.name}: please use a JPEG, PNG or WebP photo.`);
      else if (f.size > MAX_BYTES) problems.push(`${f.name}: bigger than 8 MB, please use a smaller photo.`);
      else if (base.length + accepted.length >= limit) problems.push(`${f.name}: not added, up to ${limit} photo${limit === 1 ? "" : "s"} at a time.`);
      else accepted.push(f);
    }
    setNotes(problems);
    commit(accepted.length ? [...base, ...accepted] : files);
  }

  // Resetting the form clears the picker too.
  useEffect(() => {
    const form = input.current?.form;
    if (!form) return;
    const onReset = () => {
      setFiles([]);
      setNotes([]);
    };
    form.addEventListener("reset", onReset);
    return () => form.removeEventListener("reset", onReset);
  }, []);

  const full = files.length >= limit;
  const cta = label ?? (multiple ? "Choose photos from your computer" : "Choose a photo from your computer");

  return (
    <div>
      <input
        ref={input}
        id={id}
        name={name}
        type="file"
        multiple={multiple}
        accept="image/jpeg,image/png,image/webp"
        className="peer sr-only"
        onChange={(e) => choose(e.target.files ?? [])}
      />
      <label
        htmlFor={id}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          choose(e.dataTransfer.files);
        }}
        className={`flex min-h-32 cursor-pointer flex-col items-center justify-center gap-1 border-2 border-dashed px-4 py-6 text-center transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-camel-deep ${
          over ? "border-camel-deep bg-camel/15" : "border-ink/35 bg-paper hover:border-camel-deep hover:bg-camel/10"
        } ${full && multiple ? "opacity-60" : ""}`}
      >
        <svg aria-hidden viewBox="0 0 24 24" className="h-8 w-8 text-camel-deep" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 16l4.5-4.5a2 2 0 0 1 2.8 0L16 16M14 14l1.5-1.5a2 2 0 0 1 2.8 0L20 14M4 5h16v14H4zM15 8.5h.01" />
        </svg>
        <span className="font-medium">{full && multiple ? "Maximum reached" : files.length ? (multiple ? "Add more photos" : "Choose a different photo") : cta}</span>
        <span className="text-sm text-muted">or drop {multiple ? "them" : "it"} here · JPEG, PNG or WebP, up to 8 MB{multiple ? ` each, ${limit} at a time` : ""}</span>
      </label>

      {files.length > 0 && (
        <ul className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-6" aria-label="Photos you chose">
          {files.map((f, i) => (
            <li key={`${f.name}-${f.size}-${f.lastModified}`} className="relative">
              <div className="aspect-square overflow-hidden border border-ink/20 bg-white">
                <Preview file={f} />
              </div>
              <button
                type="button"
                onClick={() => commit(files.filter((_, k) => k !== i))}
                aria-label={`Remove ${f.name}`}
                className="absolute -right-2 -top-2 grid h-9 w-9 place-items-center border border-ink/40 bg-white text-lg leading-none hover:border-red-800 hover:text-red-800"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      {files.length > 0 && (
        <p className="mt-2 text-sm text-muted" aria-live="polite">
          {files.length} photo{files.length === 1 ? "" : "s"} chosen. {multiple ? "They are" : "It is"} uploaded when you save.
        </p>
      )}
      {notes.length > 0 && (
        <ul role="alert" className="mt-2 space-y-0.5 text-sm text-red-800">
          {notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
