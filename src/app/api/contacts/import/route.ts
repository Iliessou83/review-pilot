export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { scopeFrom, ownsBusiness } from "@/lib/scope";
import { importWheelContacts } from "@/lib/collecte";

// Importe les numéros captés par la Roue de ce commerce dans les contacts.
export async function POST(request: NextRequest) {
  const session = await requireAuth(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { businessId?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }
  const businessId = Number(body.businessId);
  if (!businessId || isNaN(businessId)) return NextResponse.json({ error: "businessId requis" }, { status: 400 });
  if (!(await ownsBusiness(scopeFrom(session), businessId))) {
    return NextResponse.json({ error: "Établissement introuvable" }, { status: 404 });
  }

  const result = await importWheelContacts(businessId);
  return NextResponse.json(result);
}
