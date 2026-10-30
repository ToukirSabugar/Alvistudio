// Creates an admin user in the admin_users table.  Usage: npm run create-admin
// Non-interactive: set ADMIN_EMAIL, ADMIN_PASSWORD (and optionally ADMIN_NAME) in the environment, not in a file.
// Reads DATABASE_URL from the environment or from .env.local / .env. Asks for the email and password in the
// terminal (the password is not shown and is never printed or stored; only a scrypt hash goes to the database).
import { randomBytes, scrypt } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import readline from "node:readline";
import mysql from "mysql2/promise";

// Must match lib/auth.ts (hashPassword).
const N = 16384;
const R = 8;
const P = 1;
const KEYLEN = 64;
const MIN_PASSWORD = 10;

function loadEnvFile(name) {
  const file = resolve(process.cwd(), name);
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (!m || line.trim().startsWith("#")) continue;
    let v = m[2];
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (process.env[m[1]] === undefined) process.env[m[1]] = v;
  }
}

function hash(password) {
  const salt = randomBytes(16);
  return new Promise((res, rej) =>
    scrypt(password, salt, KEYLEN, { N, r: R, p: P, maxmem: 64 * 1024 * 1024 }, (err, key) =>
      err ? rej(err) : res(`scrypt$${N}$${R}$${P}$${salt.toString("base64")}$${key.toString("base64")}`),
    ),
  );
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
let muted = false;
const origWrite = rl._writeToOutput.bind(rl);
rl._writeToOutput = (s) => {
  if (!muted) origWrite(s);
};

function ask(question, secret = false) {
  return new Promise((res) => {
    process.stdout.write(question);
    muted = secret;
    rl.question("", (answer) => {
      muted = false;
      if (secret) process.stdout.write("\n");
      res(answer);
    });
  });
}

async function main() {
  loadEnvFile(".env.local");
  loadEnvFile(".env");
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set. Put it in .env.local (see .env.example) and run again.");
    process.exitCode = 1;
    return;
  }

  const env = process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD;
  const email = (env ? process.env.ADMIN_EMAIL : await ask("Admin email: ")).trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 190) {
    console.error("That does not look like an email address.");
    process.exitCode = 1;
    return;
  }
  const displayName = (env ? (process.env.ADMIN_NAME ?? "") : await ask("Display name (optional): ")).trim().slice(0, 100);
  const password = env ? process.env.ADMIN_PASSWORD : await ask(`Password (at least ${MIN_PASSWORD} characters, not shown): `, true);
  if (password.length < MIN_PASSWORD) {
    console.error(`The password must be at least ${MIN_PASSWORD} characters. Nothing was created.`);
    process.exitCode = 1;
    return;
  }
  const again = env ? password : await ask("Type the password again: ", true);
  if (again !== password) {
    console.error("The two passwords do not match. Nothing was created.");
    process.exitCode = 1;
    return;
  }

  const passwordHash = await hash(password);
  let conn;
  try {
    conn = await mysql.createConnection({ uri: process.env.DATABASE_URL, connectTimeout: 5000 });
    await conn.execute("INSERT INTO admin_users (email, display_name, password_hash) VALUES (?, ?, ?)", [
      email,
      displayName,
      passwordHash,
    ]);
    console.log(`Admin created for ${email}. You can now sign in at /admin/login.`);
  } catch (e) {
    if (e && e.code === "ER_DUP_ENTRY") console.error("An admin with that email already exists.");
    else if (e && e.code === "ER_NO_SUCH_TABLE") console.error("The admin_users table is missing. Run db/schema.sql first.");
    else console.error(`Could not create the admin: ${e instanceof Error ? e.message : "unknown error"}`);
    process.exitCode = 1;
  } finally {
    if (conn) await conn.end();
  }
}

try {
  await main();
} finally {
  rl.close();
}
