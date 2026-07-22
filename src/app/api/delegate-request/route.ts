import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

// ── CAELA RÉPUTATION · Émetteur délégation → Nexus ───────────────────────────
// Le CTA "En discuter" des DelegateBanner (page Collecte, page Roue) poste ici.
// On transmet à la tour de contrôle Nexus (/api/intake), signé par le secret
// partagé, jamais exposé côté client. Best-effort : si Nexus est injoignable,
// on renvoie ok:false sans planter — le client garde le filet mailto.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const KINDS: Record<string, "visuel" | "campagne"> = {
  campagne: "campagne",
  visuel: "visuel",
};

export async function POST(req: NextRequest) {
  const nexusUrl = (process.env.NEXUS_INTAKE_URL || "").trim();
  const secret = (process.env.NEXUS_INTAKE_SECRET || "").trim();
  if (!nexusUrl || !secret) {
    return NextResponse.json({ ok: false, error: "not-configured" }, { status: 500 });
  }

  let b: Record<string, unknown>;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 });
  }

  const title = String(b.title || "").trim().slice(0, 200);
  const brief = String(b.brief || "").trim().slice(0, 4000);
  const name = String(b.name || "").trim().slice(0, 120);
  const email = String(b.email || "").trim().slice(0, 200);
  const kindRaw = String(b.kind || "").trim().toLowerCase();
  const kind = KINDS[kindRaw];

  if (!title) return NextResponse.json({ ok: false, error: "missing-title" }, { status: 400 });
  if (!brief) return NextResponse.json({ ok: false, error: "missing-brief" }, { status: 400 });
  if (!kind) return NextResponse.json({ ok: false, error: "bad-kind" }, { status: 400 });

  try {
    const r = await fetch(nexusUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-intake-secret": secret },
      body: JSON.stringify({
        product: "reput",
        kind,
        title,
        brief,
        priority: "medium",
        requester: { ref: randomUUID(), name, email },
      }),
      signal: AbortSignal.timeout(6000),
    });
    if (!r.ok) {
      console.error("[delegate-request] Nexus refus", nexusUrl, r.status);
      return NextResponse.json({ ok: false, error: "nexus-refused" }, { status: 502 });
    }
    const j = await r.json().catch(() => ({}));
    return NextResponse.json({ ok: true, id: j?.id ?? null });
  } catch (e) {
    console.error("[delegate-request] Nexus injoignable", nexusUrl, e);
    return NextResponse.json({ ok: false, error: "nexus-unreachable" }, { status: 502 });
  }
}
