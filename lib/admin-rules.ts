// Rules for admin accounts (pure, unit-tested). The Account page's server actions are the callers.

export const MIN_PASSWORD = 10;
const MAX_PASSWORD = 200;

/** You can switch off another admin, never yourself, and never the last active one. */
export function canDeactivate(actorId: number, targetId: number, activeCount: number): boolean {
  return actorId !== targetId && activeCount > 1;
}

/** A message for the owner, or null when the new password is fine. */
export function passwordProblem(password: string, confirm: string): string | null {
  if (password.length < MIN_PASSWORD) return `Use at least ${MIN_PASSWORD} characters (a short sentence works well).`;
  if (password.length > MAX_PASSWORD) return `Use at most ${MAX_PASSWORD} characters.`;
  if (password !== confirm) return "The two passwords do not match.";
  return null;
}

export function cleanNewAdmin(input: {
  email: string;
  name: string;
  password: string;
  confirm: string;
}): { ok: true; value: { email: string; name: string; password: string } } | { ok: false; error: string } {
  const email = input.email.trim().toLowerCase();
  const name = input.name.replace(/\s+/g, " ").trim();
  if (!/^[^\s@<>"']+@[^\s@<>"']+\.[a-z]{2,}$/.test(email) || email.length > 190) return { ok: false, error: "Enter a valid email address." };
  if (!name || name.length > 100) return { ok: false, error: "Enter a name (up to 100 characters)." };
  const problem = passwordProblem(input.password, input.confirm);
  if (problem) return { ok: false, error: problem };
  return { ok: true, value: { email, name, password: input.password } };
}
