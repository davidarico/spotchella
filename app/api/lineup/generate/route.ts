import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { buildLineupFromRanked } from "@/lib/lineup";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import type { RankedCandidate } from "@/lib/types";

const bodySchema = z.object({ diversify: z.boolean().optional() });

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const raw: unknown = await req.json().catch(() => ({}));
  const body = bodySchema.safeParse(raw);
  const diversify = body.success ? body.data.diversify : true;
  const userId = session.user.id;
  const rows = await prisma.userArtistRanking.findMany({
    where: { userId },
    orderBy: { rank: "asc" },
    include: { artist: true },
  });
  if (!rows.length) {
    return NextResponse.json({ error: "No rankings — sync from Spotify and save your order first." }, { status: 400 });
  }
  const ranked: RankedCandidate[] = rows.map((r) => ({
    spotifyId: r.artist.spotifyId,
    name: r.artist.name,
    imageUrl: r.artist.imageUrl,
    genres: r.artist.genres,
    score: r.score,
  }));
  const lineup = buildLineupFromRanked(ranked, { diversify: diversify !== false });
  const saved = await prisma.generatedLineup.create({
    data: { userId, lineupJson: JSON.parse(JSON.stringify(lineup)) },
  });
  return NextResponse.json({ lineup, id: saved.id, shareSlug: saved.shareSlug, createdAt: saved.createdAt });
}
