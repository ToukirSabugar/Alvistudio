// The owner's page image, used as the still picture when 3D cannot load or motion is reduced.
// Decorative alongside the real HTML text, so it carries the alt text the owner wrote (empty alt if none).
export function StillImage({ url, alt }: { url: string; alt: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt={alt} width={1600} height={900} decoding="async" className="h-full w-full object-cover" />
  );
}
