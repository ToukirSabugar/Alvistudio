import { cookies } from "next/headers";
import { SESSION_COOKIE, readSession } from "@/lib/auth";
import { findAdminById } from "@/lib/auth-store";
import { toCsv } from "@/lib/csv";
import { parseEnquiryFilter } from "@/lib/enquiry-filters";
import { statusLabel } from "@/lib/enquiry-status";
import { formatIst } from "@/lib/ist";
import { searchEnquiries } from "@/lib/store";
import { labelledDetails, typeLabel } from "@/lib/enquiry-labels";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  // proxy.ts checks the cookie; this also confirms the admin is still active.
  const session = readSession((await cookies()).get(SESSION_COOKIE)?.value);
  const user = session ? await findAdminById(session.userId) : null;
  if (!user || !user.isActive) return Response.json({ ok: false, error: "Please sign in." }, { status: 401 });

  const f = parseEnquiryFilter(Object.fromEntries(new URL(req.url).searchParams));
  const { rows } = await searchEnquiries(f, 5000, 0);
  const csv = toCsv([
    ["Reference", "Received (India time)", "Type", "Status", "Name", "Phone", "Email", "Message", "Details", "Notes"],
    ...rows.map((e) => [
      e.ref,
      formatIst(e.createdAt, "datetime"),
      typeLabel(e.type),
      statusLabel(e.status),
      e.name,
      e.phone,
      e.email,
      e.message,
      labelledDetails(e.type, e.details)
        .map(([k, v]) => `${k}: ${v}`)
        .join("; "),
      e.notes,
    ]),
  ]);
  const day = new Date().toISOString().slice(0, 10);
  return new Response("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="alvi-enquiries-${day}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
