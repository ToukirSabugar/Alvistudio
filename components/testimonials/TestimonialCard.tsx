import { projectTypes } from "@/lib/site";
import type { Testimonial } from "@/lib/store";

export function TestimonialCard({ t }: { t: Testimonial }) {
  const type = projectTypes.find((p) => p.id === t.projectType)?.label ?? t.projectType;
  return (
    <figure className="m-0 flex h-full flex-col justify-between border border-[var(--line)] bg-paper-2 p-6">
      <blockquote className="m-0 whitespace-pre-line text-base leading-relaxed">{t.quote}</blockquote>
      <figcaption className="mt-6 border-t border-[var(--line)] pt-4 text-sm">
        <span className="font-medium">{t.name}</span>
        <span className="text-muted"> · {type}</span>
      </figcaption>
    </figure>
  );
}
