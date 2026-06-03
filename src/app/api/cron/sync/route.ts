export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Vercel cron jobs use GET with Authorization header
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const response = await fetch(`${baseUrl}/api/reviews/sync`, {
    method: "POST",
    headers: {
      "x-cron-secret": process.env.CRON_SECRET || "",
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();
  return NextResponse.json(data);
}
