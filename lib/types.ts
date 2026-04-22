import type { Artist } from "@prisma/client";

export type TimeRange = "short_term" | "medium_term" | "long_term";

export type RankedCandidate = {
  spotifyId: string;
  name: string;
  imageUrl: string | null;
  genres: string[];
  score: number;
};

export type LineupTiers = {
  headliners: TierArtist[];
  subHeadliners: TierArtist[];
  midTier: TierArtist[];
  lowerTier: TierArtist[];
};

export type TierArtist = {
  spotifyId: string;
  name: string;
  imageUrl: string | null;
  genres: string[];
};

export type PublicLineup = {
  id: string;
  shareSlug: string;
  createdAt: string;
  userDisplayName: string;
  lineup: LineupTiers;
};

export type { Artist };
