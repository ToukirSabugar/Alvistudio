import type { ReactNode } from "react";

// Renders a guide/post body made of plain-text blocks. Everything is output as React text nodes,
// so any markup typed into a block is shown as text and never interpreted as HTML.
//   "## x" heading, "- x" list item (consecutive items form one list), "> x" tip, otherwise paragraph.
export function ArticleBody({ blocks }: { blocks: string[] }) {
  const out: ReactNode[] = [];
  let i = 0;
  while (i < blocks.length) {
    const t = blocks[i];
    if (t.startsWith("## ")) {
      out.push(
        <h2 key={i} className="display pt-6 text-2xl">
          {t.slice(3)}
        </h2>,
      );
      i++;
    } else if (t.startsWith("- ")) {
      const start = i;
      const items: string[] = [];
      while (i < blocks.length && blocks[i].startsWith("- ")) {
        items.push(blocks[i].slice(2));
        i++;
      }
      out.push(
        <ul key={`l${start}`} className="list-outside list-disc space-y-2 pl-6 marker:text-camel-deep">
          {items.map((it, k) => (
            <li key={k}>{it}</li>
          ))}
        </ul>,
      );
    } else if (t.startsWith("> ")) {
      out.push(
        <p key={i} className="border-l-2 border-camel bg-paper-2 px-4 py-3 text-base text-muted">
          {t.slice(2)}
        </p>,
      );
      i++;
    } else {
      out.push(<p key={i}>{t}</p>);
      i++;
    }
  }
  return <div className="max-w-[65ch] space-y-5 text-lg leading-relaxed [overflow-wrap:anywhere]">{out}</div>;
}
