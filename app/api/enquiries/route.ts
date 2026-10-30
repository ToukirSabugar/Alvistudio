import { enquirySchema, fieldErrors, type EnquiryData } from "@/lib/enquiry-schema";
import { rateLimit } from "@/lib/rate-limit";
import { saveEnquiry } from "@/lib/store";

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return (fwd?.split(",")[0] ?? req.headers.get("x-real-ip") ?? "unknown").trim();
}

export async function POST(req: Request) {
  if (!rateLimit(`enq:${clientIp(req)}`, 5, 10 * 60 * 1000)) {
    return Response.json(
      { ok: false, error: "Too many enquiries. Please wait a few minutes or call us." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: pretend success, save nothing.
  if (
    typeof body === "object" &&
    body !== null &&
    typeof (body as { website?: unknown }).website === "string" &&
    (body as { website: string }).website !== ""
  ) {
    return Response.json({ ok: true });
  }

  const parsed = enquirySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ ok: false, errors: fieldErrors(parsed.error) }, { status: 400 });
  }

  try {
    const { ref } = await saveEnquiry(parsed.data as EnquiryData);
    return Response.json({ ok: true, ref });
  } catch (e) {
    console.warn(`[enquiries] save failed: ${e instanceof Error ? e.message : "unknown error"}`);
    return Response.json(
      { ok: false, error: "We could not save your enquiry right now. Please call or WhatsApp us." },
      { status: 503 },
    );
  }
}
