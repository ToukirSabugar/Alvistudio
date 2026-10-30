import { listAdmins, recentLogins } from "@/lib/auth-store";
import { MIN_PASSWORD } from "@/lib/admin-rules";
import { formatIst } from "@/lib/ist";
import { requireAdmin } from "../guard";
import { AdminShell, Field, Section, btnCls, btnQuietCls, cardCls, inputCls } from "../ui";
import { addAdmin, changePassword, toggleAdmin } from "./actions";

export const dynamic = "force-dynamic";

const MESSAGES: Record<string, { ok: boolean; text: string }> = {
  "pw-ok": { ok: true, text: "Your password was changed. Use the new one next time you sign in." },
  "wrong-current": { ok: false, text: "Your current password was not right. Nothing was changed." },
  weak: { ok: false, text: `The new password needs at least ${MIN_PASSWORD} characters and both boxes must match.` },
  rate: { ok: false, text: "Too many tries. Please wait 10 minutes." },
  "add-ok": { ok: true, text: "The new admin can now sign in with the email and password you set. Ask them to change the password." },
  "add-invalid": { ok: false, text: `Check the email and name, and use a password of at least ${MIN_PASSWORD} characters typed twice the same.` },
  "add-exists": { ok: false, text: "An admin with that email already exists." },
  "toggle-ok": { ok: true, text: "Saved." },
  "cannot-off": { ok: false, text: "You cannot switch off your own account or the last active admin." },
  db: { ok: false, text: "Could not reach the database. Nothing was saved. Try again in a minute." },
};

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ m?: string }> }) {
  const me = await requireAdmin();
  const { m } = await searchParams;
  const msg = m ? MESSAGES[m] : undefined;
  const [admins, logins] = await Promise.all([listAdmins(), recentLogins(20)]);

  return (
    <AdminShell title="Account" intro={`Signed in as ${me.email}.`}>
      {msg ? (
        <p role={msg.ok ? "status" : "alert"} className={`mb-6 border-l-4 bg-white p-4 ${msg.ok ? "border-camel-deep" : "border-red-800"}`}>
          {msg.text}
        </p>
      ) : null}

      <div className="space-y-6">
        <Section title="Change my password">
          <form action={changePassword} className="grid gap-5 sm:max-w-md">
            <Field label="Current password" name="current">
              <input id="current" name="current" type="password" required autoComplete="current-password" className={inputCls} />
            </Field>
            <Field label="New password" name="newPassword" hint={`At least ${MIN_PASSWORD} characters. A short sentence is easy to remember and hard to guess.`}>
              <input id="newPassword" name="newPassword" type="password" required minLength={MIN_PASSWORD} autoComplete="new-password" className={inputCls} />
            </Field>
            <Field label="New password again" name="confirm">
              <input id="confirm" name="confirm" type="password" required minLength={MIN_PASSWORD} autoComplete="new-password" className={inputCls} />
            </Field>
            <div>
              <button type="submit" className={btnCls}>
                Change password
              </button>
            </div>
          </form>
        </Section>

        <Section title="Who can sign in" hint="Give Fatma and Aqib their own sign-in, so each one's actions are clear in the sign-in history.">
          <ul className="divide-y divide-ink/10 border border-ink/15">
            {admins.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <span className="min-w-0">
                  <span className="block font-medium">
                    {a.displayName || a.email} {a.id === me.id ? <span className="text-sm font-normal text-muted">(you)</span> : null}
                  </span>
                  <span className="block break-all text-sm text-muted">
                    {a.email} · {a.isActive ? "Active" : "Switched off"} · {a.lastLoginAt ? `last signed in ${formatIst(a.lastLoginAt, "datetime")}` : "never signed in"}
                  </span>
                </span>
                {a.id !== me.id ? (
                  <form action={toggleAdmin}>
                    <input type="hidden" name="id" value={a.id} />
                    <input type="hidden" name="active" value={a.isActive ? "0" : "1"} />
                    <button type="submit" className={btnQuietCls}>
                      {a.isActive ? "Switch off" : "Switch on"}
                    </button>
                  </form>
                ) : null}
              </li>
            ))}
          </ul>
          <details>
            <summary className="inline-flex min-h-11 cursor-pointer items-center underline decoration-camel underline-offset-4">Add a person who can sign in</summary>
            <form action={addAdmin} className="mt-4 grid gap-5 sm:grid-cols-2">
              <Field label="Name" name="name">
                <input id="name" name="name" required maxLength={100} className={inputCls} />
              </Field>
              <Field label="Email" name="email">
                <input id="email" name="email" type="email" required maxLength={190} autoComplete="off" className={inputCls} />
              </Field>
              <Field label="Starting password" name="password" hint={`At least ${MIN_PASSWORD} characters. Tell them in person, not by message.`}>
                <input id="password" name="password" type="password" required minLength={MIN_PASSWORD} autoComplete="new-password" className={inputCls} />
              </Field>
              <Field label="Starting password again" name="add-confirm">
                <input id="add-confirm" name="confirm" type="password" required minLength={MIN_PASSWORD} autoComplete="new-password" className={inputCls} />
              </Field>
              <div>
                <button type="submit" className={btnCls}>
                  Add person
                </button>
              </div>
            </form>
          </details>
        </Section>

        <Section title="Recent sign-ins" hint="The last 20 attempts. Several failed ones you do not recognise mean someone is guessing: change your password.">
          {logins.length === 0 ? (
            <p className="text-muted">No sign-ins recorded yet.</p>
          ) : (
            <ul className={`${cardCls} divide-y divide-ink/10 text-sm`}>
              {logins.map((l, i) => (
                <li key={i} className="flex flex-wrap justify-between gap-2 px-4 py-2">
                  <span className="break-all">
                    <span className={l.success ? "" : "font-medium text-red-800"}>{l.success ? "Signed in" : "Failed"}</span> · {l.email}
                  </span>
                  <span className="text-muted">
                    {formatIst(l.createdAt, "datetime")} · {l.ip}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </AdminShell>
  );
}
