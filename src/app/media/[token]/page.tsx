export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { businesses } from "@/db/schema";
import { eq } from "drizzle-orm";
import MediaUploadClient from "./MediaUploadClient";

export default async function MediaUploadPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const [business] = await db.select().from(businesses).where(eq(businesses.mediaUploadToken, token)).limit(1);
  if (!business) notFound();

  return <MediaUploadClient token={token} businessName={business.name} />;
}
