import type { TimeRange, RankedCandidate } from "./types";

const WEIGHT: Record<TimeRange, number> = {
  short_term: 0.45,
  medium_term: 0.35,
  long_term: 0.2,
};

type SpotifyTopArtist = {
  id: string;
  name: string;
  images: { url: string }[];
  genres: string[];
};

type TimeRangeList = { range: TimeRange; items: SpotifyTopArtist[] }[];

type Agg = {
  name: string;
  imageUrl: string | null;
  genres: string[];
  byRange: Partial<Record<TimeRange, number>>;
};

/** Position-based signal: rank 1 → highest. `limit` caps list length from Spotify. */
function rankToSignal(rank: number, limit: number) {
  return (limit - rank + 1) / limit;
}

/**
 * Merges short / medium / long top lists into a deduped, weighted global ranking.
 */
export function mergeTopArtists(lists: TimeRangeList, limit = 50): RankedCandidate[] {
  const map = new Map<string, Agg>();

  for (const { range, items } of lists) {
    const w = WEIGHT[range];
    const n = items.length;
    if (!n) continue;
    items.forEach((a, i) => {
      const r = i + 1;
      const sig = rankToSignal(r, n);
      const base = w * sig;
      const ex = map.get(a.id) ?? {
        name: a.name,
        imageUrl: a.images[0]?.url ?? null,
        genres: a.genres?.length ? a.genres : [],
        byRange: {},
      };
      ex.byRange[range] = (ex.byRange[range] ?? 0) + base;
      for (const g of a.genres ?? []) {
        if (g && !ex.genres.includes(g)) ex.genres.push(g);
      }
      ex.name = a.name;
      ex.imageUrl = a.images[0]?.url ?? ex.imageUrl;
      map.set(a.id, ex);
    });
  }

  const out: RankedCandidate[] = [];
  for (const [spotifyId, a] of map) {
    const s = a.byRange.short_term ?? 0;
    const m = a.byRange.medium_term ?? 0;
    const l = a.byRange.long_term ?? 0;
    const hasAny = s + m + l;
    if (!hasAny) continue;
    out.push({
      spotifyId,
      name: a.name,
      imageUrl: a.imageUrl,
      genres: a.genres,
      score: s + m + l,
    });
  }

  out.sort((a, b) => b.score - a.score);
  return out.slice(0, limit);
}
