export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { wheelConfigs } from "@/db/schema";
import { eq } from "drizzle-orm";
import WheelClient from "./WheelClient";

export default async function WheelPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [config] = await db
    .select()
    .from(wheelConfigs)
    .where(eq(wheelConfigs.slug, slug))
    .limit(1);

  if (!config || !config.active) notFound();

  return (
    <WheelClient
      slug={config.slug}
      mode={config.mode}
      theme={config.theme}
      businessName={config.businessName}
      headline={config.headline}
      logoUrl={config.logoUrl}
      brandColor={config.brandColor}
      reviewUrl={config.reviewUrl}
      segments={config.segments}
      requireContact={config.requireContact}
      consentText={config.consentText}
    />
  );
}
