import { listMedia, type MediaRow } from "@/lib/store";
import { listTeamMembersAdmin, type TeamMemberAdmin } from "@/lib/site-content-store";
import { requireAdmin } from "../guard";
import { MediaChoice } from "../heroes/MediaChoice";
import { PhotoDropzone } from "../PhotoDropzone";
import { AdminShell, Field, Notice, btnCls, btnQuietCls, inputCls } from "../ui";
import { removeMember, saveMember, toggleMember } from "./actions";

export const dynamic = "force-dynamic";

function MemberForm({ m, media, label }: { m?: TeamMemberAdmin; media: MediaRow[]; label: string }) {
  const p = m ? `m${m.id}` : "new";
  return (
    <form action={saveMember} className="space-y-4">
      {m ? <input type="hidden" name="id" value={m.id} /> : null}
      <Field label="Name" name={`${p}-name`}>
        <input id={`${p}-name`} name="name" required maxLength={100} defaultValue={m?.name ?? ""} className={inputCls} />
      </Field>
      <Field label="Role" name={`${p}-role`} hint="For example: Architect, Interior designer.">
        <input id={`${p}-role`} name="role" maxLength={100} defaultValue={m?.role ?? ""} className={inputCls} />
      </Field>
      <Field label="About them" name={`${p}-bio`} hint="Written in your own words. Shown on the About page.">
        <textarea id={`${p}-bio`} name="bio" rows={5} maxLength={3000} defaultValue={m?.bio ?? ""} className={inputCls} />
      </Field>
      <PhotoDropzone name="photo" label="Upload a photo" />
      <MediaChoice name="photoMediaId" media={media} selectedId={m?.photoMediaId ?? null} allowNone />
      <Field label="Order on the page" name={`${p}-sort`} hint="Smaller numbers come first.">
        <input id={`${p}-sort`} name="sortOrder" type="number" step={1} defaultValue={m?.sortOrder ?? 0} className={inputCls} />
      </Field>
      <button type="submit" className={btnCls}>
        {label}
      </button>
    </form>
  );
}

export default async function TeamAdmin({ searchParams }: { searchParams: Promise<{ ok?: string; e?: string }> }) {
  await requireAdmin();
  const { ok, e } = await searchParams;
  const [members, media] = await Promise.all([listTeamMembersAdmin(), listMedia()]);
  return (
    <AdminShell
      title="Fatma and Aqib"
      intro="The people shown on the About page, in your own words. Upload a portrait here; it stays out of the public gallery."
    >
      <Notice ok={ok} error={e} />
      {members.length === 0 ? (
        <p className="mb-8 border border-ink/20 bg-white p-6 text-base">
          No team members yet. This is for Fatma and Aqib&apos;s own words and photos. Until you add them, the About page
          shows &quot;coming soon&quot; placeholders.
        </p>
      ) : (
        <ul className="mb-10 space-y-6">
          {members.map((m) => (
            <li key={m.id} className="border border-ink/20 bg-white p-4 sm:p-6">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="display text-xl">{m.name}</h2>
                <span className="text-sm text-muted">{m.isVisible ? "Shown on About" : "Hidden"}</span>
                <div className="ml-auto flex flex-wrap gap-2">
                  <form action={toggleMember}>
                    <input type="hidden" name="id" value={m.id} />
                    <input type="hidden" name="visible" value={m.isVisible ? "0" : "1"} />
                    <button type="submit" className={btnQuietCls}>
                      {m.isVisible ? "Hide" : "Show"}
                    </button>
                  </form>
                  <form action={removeMember}>
                    <input type="hidden" name="id" value={m.id} />
                    <button type="submit" className={btnQuietCls}>
                      Delete
                    </button>
                  </form>
                </div>
              </div>
              <details className="mt-4">
                <summary className="inline-flex min-h-11 cursor-pointer items-center text-base underline underline-offset-4">
                  Edit details
                </summary>
                <div className="mt-4">
                  <MemberForm m={m} media={media} label="Save changes" />
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
      <h2 className="display text-xl">Add a person</h2>
      <div className="mt-4 border border-ink/20 bg-white p-4 sm:p-6">
        <MemberForm media={media} label="Add person" />
      </div>
    </AdminShell>
  );
}
