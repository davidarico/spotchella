import { prisma } from "@/lib/prisma";
import type { LineupTiers, PublicLineup } from "@/lib/types";

export async function getPublicLineupBySlug(slug: string): Promise<PublicLineup | null> {
  const record = await prisma.generatedLineup.findUnique({
    where: { shareSlug: slug },
    include: { user: { select: { displayName: true, name: true } } },
  });
  if (!record) return null;
  return {
    id: record.id,
    shareSlug: record.shareSlug,
    createdAt: record.createdAt.toISOString(),
    userDisplayName: record.user.displayName || record.user.name || "A listener",
    lineup: record.lineupJson as unknown as LineupTiers,
  };
}
