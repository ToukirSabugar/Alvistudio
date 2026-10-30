import type { CSSProperties, ReactNode } from "react";
import { Icon, type IconName } from "./icons";

const sizes = { sm: "3.25rem", md: "5rem", lg: "6.5rem", xl: "9rem" } as const;

/**
 * An icon in the exact centre of a survey-style frame: four corner brackets, small tick marks at the
 * middle of each side and a fine diamond outline behind it, like the marks on a site plan. The corners
 * breathe slowly and one dot pulses at the top of the diamond, so there is always gentle motion (also on
 * touch screens). When an ancestor with the `group` class is hovered or focused, the frame opens up and
 * the icon grows. Colour comes from the surrounding text colour. Decorative: aria-hidden.
 */
export function IconBadge({
  name,
  size = "md",
  className = "",
  dot,
  children,
}: {
  name?: IconName;
  size?: keyof typeof sizes;
  className?: string;
  /** CSS colour for the pulsing dot. Defaults to camel. */
  dot?: string;
  /** Custom artwork in the centre instead of a named icon. */
  children?: ReactNode;
}) {
  const style = { "--badge": sizes[size], ...(dot ? { "--badge-accent": dot } : {}) } as CSSProperties;
  return (
    <span className={`icon-badge ${className}`} style={style} aria-hidden>
      <svg viewBox="0 0 100 100" className="icon-badge-frame" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square">
        <path className="icon-badge-diamond" d="M50 14L86 50L50 86L14 50Z" strokeWidth="1" />
        <g className="icon-badge-corners">
          <path d="M4 24V4H24" />
          <path d="M76 4H96V24" />
          <path d="M96 76V96H76" />
          <path d="M24 96H4V76" />
        </g>
        <path className="icon-badge-ticks" d="M50 4V11M50 89V96M4 50H11M89 50H96" strokeWidth="1.2" />
        <circle className="icon-badge-dot" cx="50" cy="14" r="2.8" fill="var(--badge-accent, var(--camel))" stroke="none" />
      </svg>
      {children ?? (name ? <Icon name={name} className="icon-badge-icon" /> : null)}
    </span>
  );
}
