// Small line-icon set (24 x 24 grid, 1.6 stroke). Icons are decorative: the visible text next to them
// carries the meaning, so they are always aria-hidden.
const paths = {
  house: "M3 11l9-7 9 7M5 10v10h14V10M10 20v-6h4v6",
  renovation: "M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.4 2.4-2.1-.6-.6-2.1z",
  classroom:
    "M4 5.5C4 4.7 4.7 4 5.5 4H12v15H5.5A1.5 1.5 0 0 0 4 20.5zM20 5.5C20 4.7 19.3 4 18.5 4H12v15h6.5a1.5 1.5 0 0 1 1.5 1.5z",
  farm: "M5 19c0-8 5-13 14-14 0 9-5 14-13 14M5 19l7-7",
  check: "M5 12.5l4.5 4.5L19 7",
  design: "M4 4v16h16L4 4zM8 13v3M8 16h3",
  bricks: "M3 6h18v4H3zM3 14h18v4H3zM9 6v4M15 10v4M9 14v4",
  advice: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM15.5 8.5l-2 5-5 2 2-5z",
  concrete: "M12 3l9 5-9 5-9-5zM3 12l9 5 9-5M3 16l9 5 9-5",
  steel: "M4 5h16M4 19h16M12 5v14",
  timber: "M4 6c4-2 12-2 16 0M4 12c4-2 12-2 16 0M4 18c4-2 12-2 16 0",
  tiles: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  air: "M3 8h11a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h8",
  light: "M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z",
  budget: "M3 7a2 2 0 0 1 2-2h13v4M3 7v11a2 2 0 0 0 2 2h15V9H5a2 2 0 0 1-2-2zM16 14h2",
  list: "M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01",
} as const;

export type IconName = keyof typeof paths;

export function Icon({ name, className = "" }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={paths[name]} />
    </svg>
  );
}

/** Pick an icon from a material's name. */
export function iconForMaterial(name: string): IconName {
  const n = name.toLowerCase();
  if (n.includes("concrete")) return "concrete";
  if (n.includes("brick") || n.includes("block")) return "bricks";
  if (n.includes("steel") || n.includes("reinforce")) return "steel";
  if (n.includes("ply") || n.includes("board") || n.includes("timber") || n.includes("wood")) return "timber";
  if (n.includes("tile") || n.includes("floor")) return "tiles";
  if (n.includes("light")) return "light";
  if (n.includes("air") || n.includes("shade") || n.includes("ventil")) return "air";
  if (n.includes("budget") || n.includes("cost")) return "budget";
  return "bricks";
}

/** Pick an icon from a project type's title. */
export function iconForProject(title: string): IconName {
  const n = title.toLowerCase();
  if (n.includes("renovat")) return "renovation";
  if (n.includes("tuition") || n.includes("class")) return "classroom";
  if (n.includes("farm")) return "farm";
  return "house";
}
