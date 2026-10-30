import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "outline" | "ghost" | "onDark";

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 px-6 text-sm tracking-[0.14em] uppercase font-medium transition-colors duration-200 " +
  "active:translate-y-px disabled:opacity-50 disabled:pointer-events-none aria-busy:opacity-70 aria-busy:cursor-progress";

const variants: Record<Variant, string> = {
  primary: "bg-camel text-ink hover:bg-ink hover:text-paper",
  outline: "border border-ink text-ink hover:bg-ink hover:text-paper",
  ghost: "text-ink underline underline-offset-8 decoration-camel hover:decoration-ink",
  onDark: "border border-camel text-paper hover:bg-camel hover:text-ink",
};

type Common = { variant?: Variant; className?: string; children: ReactNode };

export function Button({
  variant = "primary",
  className = "",
  href,
  children,
  ...rest
}: Common & { href?: string } & Omit<ComponentProps<"button">, "className" | "children">) {
  const cls = `${base} ${variants[variant]} ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
