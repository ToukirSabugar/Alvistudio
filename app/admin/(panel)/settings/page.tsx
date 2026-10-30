import { getContactSettings } from "@/lib/settings";
import { updateSettings } from "./actions";
import { requireAdmin } from "../guard";
import { AdminShell, Field, Notice, SaveBar, Section, inputCls } from "../ui";

export const dynamic = "force-dynamic";

export default async function SettingsAdmin({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; e?: string }>;
}) {
  await requireAdmin();
  const { ok, e } = await searchParams;
  const v = await getContactSettings();
  return (
    <AdminShell
      title="Company details"
      intro="Shown in the header, footer, Contact page, the WhatsApp and Call buttons, and Google's business data. Leave a contact box empty to go back to the built-in value."
    >
      <Notice ok={ok} error={e} />
      <form action={updateSettings} className="space-y-6">
        <Section title="Contact">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Phone number" name="phone" hint="Digits only, for example 07383490630">
              <input id="phone" name="phone" defaultValue={v.phone} inputMode="tel" maxLength={20} className={inputCls} />
            </Field>
            <Field label="WhatsApp number" name="whatsapp" hint="With country code, no plus sign, for example 917383490630">
              <input id="whatsapp" name="whatsapp" defaultValue={v.whatsapp} inputMode="tel" maxLength={20} className={inputCls} />
            </Field>
          </div>
          <Field label="Business email" name="email" hint="Shown in the footer. Leave empty until the studio has one.">
            <input id="email" name="email" type="email" defaultValue={v.email} maxLength={190} className={inputCls} />
          </Field>
          <Field label="Address" name="address">
            <textarea id="address" name="address" defaultValue={v.address} rows={3} maxLength={300} className={inputCls} />
          </Field>
          <Field label="Opening hours" name="hours">
            <input id="hours" name="hours" defaultValue={v.hours} maxLength={100} className={inputCls} />
          </Field>
          <Field label="Google Maps link" name="mapUrl" hint="Must start with https://">
            <input id="mapUrl" name="mapUrl" type="url" defaultValue={v.mapUrl} maxLength={500} className={inputCls} />
          </Field>
          <Field label="Rating page link" name="ratingUrl" hint="Where the rating link points (JustDial or Google). Must start with https://">
            <input id="ratingUrl" name="ratingUrl" type="url" defaultValue={v.ratingUrl} maxLength={500} className={inputCls} />
          </Field>
        </Section>
        <Section title="Social links" hint="Only filled links are shown in the footer. Each must start with https://">
          <Field label="Instagram" name="instagram">
            <input id="instagram" name="instagram" type="url" defaultValue={v.instagram} maxLength={500} placeholder="https://www.instagram.com/…" className={inputCls} />
          </Field>
          <Field label="Facebook" name="facebook">
            <input id="facebook" name="facebook" type="url" defaultValue={v.facebook} maxLength={500} placeholder="https://www.facebook.com/…" className={inputCls} />
          </Field>
          <Field label="YouTube" name="youtube">
            <input id="youtube" name="youtube" type="url" defaultValue={v.youtube} maxLength={500} placeholder="https://www.youtube.com/@…" className={inputCls} />
          </Field>
        </Section>
        <SaveBar label="Save company details" />
      </form>
    </AdminShell>
  );
}
