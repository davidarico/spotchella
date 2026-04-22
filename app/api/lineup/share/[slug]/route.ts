import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { LineupTiers } from "@/lib/types";

export async function GET(_: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const record = await prisma.generatedLineup.findUnique({
    where: { shareSlug: slug },
    include: { user: { select: { displayName: true, name: true } } },
  });
  if (!record) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const lineup = record.lineupJson as unknown as LineupTiers;
  return NextResponse.json({
    id: record.id,
    shareSlug: record.shareSlug,
    createdAt: record.createdAt.toISOString(),
    userDisplayName: record.user.displayName || record.user.name || "A listener",
    lineup,
  });
}
