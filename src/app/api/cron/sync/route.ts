export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Use APP_URL (server-side only) to avoid exposing CRON_SECRET via a NEXT_PUBLIC variable
  const baseUrl = process.env.APP_URL || "http://localhost:3000";

  try {
    const response = await fetch(`${baseUrl}/api/reviews/sync`, {
      method: "POST",
      headers: {
        "x-cron-secret": process.env.CRON_SECRET!,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Sync endpoint error:", response.status, text);
      return NextResponse.json({ error: "Sync failed", status: response.status }, { status: 502 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Cron sync error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
