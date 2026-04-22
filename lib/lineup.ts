import type { RankedCandidate, LineupTiers, TierArtist } from "./types";

type AnyTierInput = { spotifyId: string; name: string; imageUrl: string | null; genres: string[] };

function toTierArtist(a: AnyTierInput): TierArtist {
  return { spotifyId: a.spotifyId, name: a.name, imageUrl: a.imageUrl, genres: a.genres };
}

const PRIMARY_GENRE = (g: string) => g.split(" ").pop()?.toLowerCase() ?? g;

/** Boost variety in top slots: avoid three headliners sharing the same first genre. */
function diversifyOrder(ranked: RankedCandidate[], headCount: number) {
  const out = ranked.slice();
  if (out.length < 3) return out;
  for (let slot = 2; slot < Math.min(headCount, out.length); slot++) {
    const taken = new Set(
      out.slice(0, slot).flatMap((a) => (a.genres[0] ? [PRIMARY_GENRE(a.genres[0])] : [])),
    );
    const firstGenre = out[slot].genres[0] ? PRIMARY_GENRE(out[slot].genres[0]) : null;
    if (firstGenre && !taken.has(firstGenre)) continue;
    for (let j = slot + 1; j < out.length; j++) {
      const g = out[j].genres[0] ? PRIMARY_GENRE(out[j].genres[0]) : "___";
      if (!taken.has(g) || j === out.length - 1) {
        if (g !== "___" || j === out.length - 1) {
          [out[slot], out[j]] = [out[j], out[slot]];
        }
        break;
      }
    }
  }
  return out;
}

const DEFAULT_COUNTS = {
  head: 3,
  sub: 7,
  mid: 18,
} as const;

/**
 * Splits a user-ranked (1 = best) artist list into Coachella-style tiers.
 */
export function buildLineupFromRanked(
  ranked: RankedCandidate[],
  options?: { headliners?: number; sub?: number; mid?: number; diversify?: boolean },
): LineupTiers {
  const headN = options?.headliners ?? DEFAULT_COUNTS.head;
  const subN = options?.sub ?? DEFAULT_COUNTS.sub;
  const midN = options?.mid ?? DEFAULT_COUNTS.mid;
  const diversify = options?.diversify !== false;
  if (!ranked.length) {
    return { headliners: [], subHeadliners: [], midTier: [], lowerTier: [] };
  }
  const ordered = diversify ? diversifyOrder(ranked, headN) : ranked.slice();
  const head = ordered.slice(0, headN);
  const sub = ordered.slice(headN, headN + subN);
  const mid = ordered.slice(headN + subN, headN + subN + midN);
  const lower = ordered.slice(headN + subN + midN);
  return {
    headliners: head.map(toTierArtist),
    subHeadliners: sub.map(toTierArtist),
    midTier: mid.map(toTierArtist),
    lowerTier: lower.map(toTierArtist),
  };
}
