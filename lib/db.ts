// Lazy mysql2 pool. Never throws at import time; callers handle a missing or down database.
import mysql, { type Pool } from "mysql2/promise";

let pool: Pool | null = null;

export function getPool(): Pool {
  if (pool) return pool;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  pool = mysql.createPool({
    uri: url,
    connectionLimit: 5,
    connectTimeout: 5000,
    waitForConnections: true,
    // Every connection talks UTC, and mysql2 reads and writes dates as UTC, so date filters behave the same on
    // this PC (India time) and on Hostinger (UTC). Pages convert to India time only for display (lib/ist.ts).
    timezone: "Z",
  });
  pool.pool.on("connection", (conn) => {
    conn.query("SET time_zone = '+00:00'");
  });
  return pool;
}
