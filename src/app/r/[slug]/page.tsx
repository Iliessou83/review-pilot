export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { wheelConfigs } from "@/db/schema";
import { eq } from "drizzle-orm";
import EmbedBridge from "@/components/EmbedBridge";
import WheelClient from "./WheelClient";

export default async function WheelPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [k: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;

  const [config] = await db
    .select()
    .from(wheelConfigs)
    .where(eq(wheelConfigs.slug, slug))
    .limit(1);

  if (!config || !config.active) notFound();

  // Intégrée sur le site du commerçant (Caela Embed) : le pont annonce la
  // hauteur réelle au site hôte. Il ne fait rien hors intégration.
  return (
    <>
      {sp?.embed === "1" && <EmbedBridge />}
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
    </>
  );
}
