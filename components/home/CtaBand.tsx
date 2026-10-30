import { Button } from "@/components/Button";
import { IconBadge } from "@/components/ui/IconBadge";

export function CtaBand() {
  return (
    <section aria-labelledby="cta-title" className="bg-camel text-ink">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 px-4 py-20 text-center sm:px-8 lg:py-24">
        <IconBadge name="house" size="md" className="text-ink" dot="var(--ink)" />
        <h2 id="cta-title" className="display text-3xl sm:text-4xl">
          Tell us about your plot, your house or your room
        </h2>
        <Button href="/contact?type=consultation" className="!bg-ink !text-paper hover:!bg-paper hover:!text-ink">
          Send an enquiry
        </Button>
      </div>
    </section>
  );
}
