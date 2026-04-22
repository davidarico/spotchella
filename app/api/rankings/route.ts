import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const bodySchema = z.object({
  items: z.array(
    z.object({
      spotifyId: z.string().min(1),
      name: z.string().min(1),
      imageUrl: z.string().nullish(),
      genres: z.array(z.string()).default([]),
      score: z.number().optional().default(0),
      rank: z.number().int().min(1).max(99),
      locked: z.boolean().optional().default(false),
    }),
  ),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const rows = await prisma.userArtistRanking.findMany({
    where: { userId: session.user.id },
    orderBy: { rank: "asc" },
    include: { artist: true },
  });
  return NextResponse.json({
    items: rows.map((r) => ({
      spotifyId: r.artist.spotifyId,
      name: r.artist.name,
      imageUrl: r.artist.imageUrl,
      genres: r.artist.genres,
      score: r.score,
      rank: r.rank,
      locked: r.locked,
    })),
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const json: unknown = await req.json();
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { items } = parsed.data;
  const userId = session.user.id;
  await prisma.$transaction(async (tx) => {
    const existing = await tx.userArtistRanking.findMany({ where: { userId } });
    const toDelete = new Set(existing.map((e) => e.artistId));
    for (const item of items) {
      const artist = await tx.artist.upsert({
        where: { spotifyId: item.spotifyId },
        create: {
          spotifyId: item.spotifyId,
          name: item.name,
          imageUrl: item.imageUrl ?? null,
          genres: item.genres,
        },
        update: { name: item.name, imageUrl: item.imageUrl ?? null, genres: item.genres },
      });
      toDelete.delete(artist.id);
      await tx.userArtistRanking.upsert({
        where: { userId_artistId: { userId, artistId: artist.id } },
        create: {
          userId,
          artistId: artist.id,
          rank: item.rank,
          score: item.score,
          locked: item.locked,
        },
        update: { rank: item.rank, score: item.score, locked: item.locked },
      });
    }
    if (toDelete.size) {
      await tx.userArtistRanking.deleteMany({
        where: { userId, artistId: { in: [...toDelete] } },
      });
    }
  });
  return NextResponse.json({ ok: true });
}
