import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getValidSpotifyAccessToken, SpotifyNotLinkedError } from "@/lib/spotify-client";
import { mergeTopArtists } from "@/lib/spotify-ranking";
import type { TimeRange } from "@/lib/types";

const RANGES: TimeRange[] = ["short_term", "medium_term", "long_term"];

type SpotifyResponse = {
  items: { id: string; name: string; images: { url: string }[]; genres: string[] }[];
};

async function fetchTop(access: string, range: TimeRange) {
  const res = await fetch(
    `https://api.spotify.com/v1/me/top/artists?time_range=${range}&limit=50`,
    { headers: { Authorization: `Bearer ${access}` }, next: { revalidate: 0 } },
  );
  if (res.status === 401) {
    return { error: "unauthorized" as const };
  }
  if (!res.ok) {
    const t = await res.text();
    return { error: "api" as const, message: t };
  }
  const data = (await res.json()) as SpotifyResponse;
  return { data };
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const access = await getValidSpotifyAccessToken(session.user.id);
    const lists = [];
    for (const range of RANGES) {
      const r = await fetchTop(access, range);
      if ("error" in r) {
        if (r.error === "unauthorized") {
          return NextResponse.json(
            { error: "Spotify session expired. Sign out and sign in again." },
            { status: 401 },
          );
        }
        return NextResponse.json(
          { error: "Spotify top artists could not be loaded", detail: r.message },
          { status: 502 },
        );
      }
      lists.push({ range, items: r.data.items });
    }
    const merged = mergeTopArtists(lists);
    return NextResponse.json({ artists: merged });
  } catch (e) {
    if (e instanceof SpotifyNotLinkedError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    const msg = e instanceof Error ? e.message : "Unknown";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
