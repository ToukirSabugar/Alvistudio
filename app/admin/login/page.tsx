import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, adminEnabled, verifySession } from "@/lib/auth";
import { adminTableEmpty } from "@/lib/auth-store";
import { login } from "./actions";
import { btnCls, inputCls } from "../(panel)/ui";

export const dynamic = "force-dynamic";

const noteCls = "mt-4 border-l-4 border-ink bg-paper-2 p-4 text-base";

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen place-items-center bg-ink px-4 py-12">
      <div className="w-full max-w-md bg-paper p-6 text-ink sm:p-10">
        <p className="display text-lg leading-none tracking-[0.3em]">
          Alvi
          <span className="block text-[0.5rem] tracking-[0.45em] opacity-80">Studio by Fatma &amp; Aqib</span>
        </p>
        {children}
      </div>
    </div>
  );
}

export default async function AdminLogin({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  if (!adminEnabled()) {
    return (
      <Frame>
        <h1 className="display mt-8 text-2xl">Admin is switched off</h1>
        <p role="alert" className={noteCls}>
          Set ADMIN_SESSION_SECRET in the server&apos;s .env file to switch the admin on.
        </p>
      </Frame>
    );
  }
  const jar = await cookies();
  if (verifySession(jar.get(SESSION_COOKIE)?.value)) redirect("/admin");
  const { e } = await searchParams;
  const needsFirstAdmin = await adminTableEmpty();
  return (
    <Frame>
      <h1 className="display mt-8 text-2xl">Sign in</h1>
      {needsFirstAdmin ? (
        <p role="status" className={noteCls}>
          No admin exists yet. On the computer that runs the site, open a terminal in the project folder and run{" "}
          <code>npm run create-admin</code>. It asks for an email and a password, then you can sign in here.
        </p>
      ) : null}
      {e === "bad" ? (
        <p role="alert" className={noteCls}>
          Could not sign in. Check the email and password. After 5 wrong tries an account is paused for 15 minutes.
        </p>
      ) : null}
      {e === "rate" ? (
        <p role="alert" className={noteCls}>
          Too many attempts. Please wait 10 minutes and try again.
        </p>
      ) : null}
      {e === "db" ? (
        <p role="alert" className={noteCls}>
          The database cannot be reached, so sign-in is switched off for now. Try again in a minute.
        </p>
      ) : null}
      <form action={login} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-base font-medium">
            Email or username
          </label>
          <input id="email" name="email" type="text" autoCapitalize="none" spellCheck={false} required autoComplete="username" maxLength={190} className={inputCls} />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-base font-medium">
            Password
          </label>
          <input id="password" name="password" type="password" required autoComplete="current-password" className={inputCls} />
        </div>
        <button type="submit" className={`${btnCls} w-full`}>
          Sign in
        </button>
      </form>
    </Frame>
  );
}
