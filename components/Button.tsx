import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "outline" | "ghost" | "onDark" | "ghostDark";

const base =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-7 text-[0.8rem] tracking-[0.16em] uppercase font-semibold transition-colors duration-300 " +
  "active:translate-y-px disabled:opacity-50 disabled:pointer-events-none aria-busy:opacity-70 aria-busy:cursor-progress";

const variants: Record<Variant, string> = {
  primary: "bg-camel text-ink hover:bg-ink hover:text-paper",
  outline: "border border-ink text-ink hover:bg-ink hover:text-paper",
  ghost: "!px-0 text-ink underline underline-offset-8 decoration-camel hover:decoration-ink",
  onDark: "bg-camel text-ink hover:bg-paper",
  ghostDark: "border border-paper/35 text-paper hover:border-camel hover:text-camel",
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
