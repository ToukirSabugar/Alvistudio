import type { MediaRow } from "@/lib/store";

/** Thumbnail radio list over the media library. Works without JavaScript. */
export function MediaChoice({
  name,
  media,
  selectedId,
  allowNone,
}: {
  name: string;
  media: MediaRow[];
  selectedId: number | null;
  allowNone?: boolean;
}) {
  const cell =
    "flex min-h-11 cursor-pointer flex-col gap-1 border border-ink/30 bg-white p-2 text-sm has-[:checked]:border-camel-deep has-[:checked]:outline-2 has-[:checked]:outline-camel-deep";
  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 text-base font-medium">Choose from your uploaded images</legend>
      <ul className="grid max-h-72 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3 md:grid-cols-4">
        {allowNone ? (
          <li>
            <label className={`${cell} h-full justify-center`}>
              <input type="radio" name={name} value="" defaultChecked={selectedId === null} />
              No photo
            </label>
          </li>
        ) : null}
        {media.map((m) => (
          <li key={m.id}>
            <label className={cell}>
              <input type="radio" name={name} value={m.id} defaultChecked={selectedId === m.id} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.fileUrl} alt="" loading="lazy" className="aspect-[4/3] w-full bg-paper-2 object-cover" />
              <span className="line-clamp-2 break-words">{m.title}</span>
            </label>
          </li>
        ))}
      </ul>
    </fieldset>
  );
}
