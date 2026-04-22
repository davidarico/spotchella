"use client";

import { PosterExportControls } from "@/components/lineup/PosterExportControls";
import { SortableRankList } from "@/components/studio/SortableRankList";
import type { LineupTiers, RankedCandidate } from "@/lib/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRankingStore, type RankRow } from "@/store/ranking";

type TopResponse = { artists: RankedCandidate[] };
type RankingsResponse = {
  items: {
    spotifyId: string;
    name: string;
    imageUrl: string | null;
    genres: string[];
    score: number;
    rank: number;
    locked: boolean;
  }[];
};
type GenResponse = { lineup: LineupTiers; id: string; shareSlug: string; createdAt: string };

function mapToRows(items: RankingsResponse["items"]): RankRow[] {
  return items
    .slice()
    .sort((a, b) => a.rank - b.rank)
    .map((i) => ({
      spotifyId: i.spotifyId,
      name: i.name,
      imageUrl: i.imageUrl,
      genres: i.genres ?? [],
      score: i.score,
      locked: i.locked,
    }));
}

export function StudioClient() {
  const { data: session, status } = useSession();
  const qc = useQueryClient();
  const items = useRankingStore((s) => s.items);
  const setItems = useRankingStore((s) => s.setItems);
  const reorder = useRankingStore((s) => s.reorder);
  const removeAt = useRankingStore((s) => s.removeAt);
  const [lineup, setLineup] = useState<LineupTiers | null>(null);
  const [shareSlug, setShareSlug] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const topQ = useQuery({
    queryKey: ["spotify", "top"],
    queryFn: async () => {
      const r = await fetch("/api/spotify/top");
      if (!r.ok) {
        const j = (await r.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? "Could not load Spotify data");
      }
      return (await r.json()) as TopResponse;
    },
    enabled: status === "authenticated",
  });
  const rankQ = useQuery({
    queryKey: ["rankings"],
    queryFn: async () => {
      const r = await fetch("/api/rankings");
      if (r.status === 401) return { items: [] } as RankingsResponse;
      if (!r.ok) throw new Error("Could not load saved rankings");
      return (await r.json()) as RankingsResponse;
    },
    enabled: status === "authenticated",
  });

  useEffect(() => {
    if (!rankQ.data) return;
    if (rankQ.data.items.length > 0) {
      setItems(mapToRows(rankQ.data.items));
      return;
    }
    if (topQ.data?.artists?.length) {
      setItems(
        topQ.data.artists.map((a) => ({ ...a, locked: false })).slice(0, 50),
      );
    }
  }, [rankQ.data, topQ.data, setItems]);

  const saveM = useMutation({
    mutationFn: async (rows: RankRow[]) => {
      setErr(null);
      const r = await fetch("/api/rankings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: rows.map((a, i) => ({
            spotifyId: a.spotifyId,
            name: a.name,
            imageUrl: a.imageUrl,
            genres: a.genres,
            score: a.score,
            rank: i + 1,
            locked: a.locked ?? false,
          })),
        }),
      });
      if (!r.ok) {
        const j = (await r.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? "Save failed");
      }
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["rankings"] }),
  });

  const genM = useMutation({
    mutationFn: async () => {
      setErr(null);
      const r = await fetch("/api/lineup/generate", { method: "POST", body: JSON.stringify({}) });
      if (!r.ok) {
        const j = (await r.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? "Generate failed");
      }
      return (await r.json()) as GenResponse;
    },
    onSuccess: (d) => {
      setLineup(d.lineup);
      setShareSlug(d.shareSlug);
    },
  });

  const name = session?.user?.name ?? "You";
  if (status === "loading" || (status === "authenticated" && rankQ.isLoading)) {
    return <p className="text-sm text-black/50">Loading…</p>;
  }
  if (status !== "authenticated") {
    return (
      <p>
        <Link className="underline" href="/">
          Sign in
        </Link>{" "}
        to continue.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {topQ.error && (
        <p className="text-sm text-amber-900/80">
          {(topQ.error as Error).message} — try refreshing, or re-link Spotify.
        </p>
      )}
      {err && <p className="text-sm text-rose-800/90">{err}</p>}
      <div className="sc-card p-4 md:p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide text-black/50">Top artists</h2>
          <span className="sc-pill">{items.length} acts</span>
        </div>
        {items.length > 0 ? (
          <SortableRankList items={items} onReorder={reorder} onRemove={removeAt} />
        ) : (
          <p className="text-sm text-black/55">
            {topQ.isFetching
              ? "Syncing with Spotify…"
              : "No data yet — we need top artists (listen more on Spotify or check API permissions)."}
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className="sc-btn-primary"
            disabled={saveM.isPending || !items.length}
            onClick={() => {
              saveM.mutate(items, { onError: (e) => setErr((e as Error).message) });
            }}
          >
            {saveM.isPending ? "…" : "Save ranking"}
          </button>
          <button
            type="button"
            className="sc-btn-ghost"
            onClick={() => {
              if (topQ.data?.artists) setItems(topQ.data.artists.map((a) => ({ ...a, locked: false })).slice(0, 50));
            }}
          >
            Re-sync from Spotify
          </button>
        </div>
      </div>
      <div className="sc-card p-4 md:p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-black/50">Festival build</h2>
        <p className="mt-1 text-sm text-black/55">Turn your saved order into a tiered bill and a poster you can post.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className="sc-btn-primary"
            disabled={genM.isPending || saveM.isPending || !items.length}
            onClick={async () => {
              if (!items.length) {
                setErr("Add artists to your list first.");
                return;
              }
              setErr(null);
              try {
                await saveM.mutateAsync(items);
                await genM.mutateAsync();
              } catch (e) {
                setErr((e as Error).message);
              }
            }}
          >
            {saveM.isPending || genM.isPending ? "…" : "Save & generate lineup"}
          </button>
        </div>
        {lineup && (
          <div className="mt-6 space-y-2 border-t border-black/5 pt-5">
            <h3 className="text-sm font-bold uppercase text-black/45">Tiers (preview)</h3>
            <p className="text-xs text-black/45">Head {lineup.headliners.length} · Sub {lineup.subHeadliners.length} · Mid {lineup.midTier.length} · Up {lineup.lowerTier.length}</p>
            <PosterExportControls lineup={lineup} userName={name} />
            {shareSlug && (
              <p className="pt-2 text-sm">
                <span className="text-black/50">Share link: </span>
                <a className="font-medium text-violet-900/90 underline" href={`/lineup/${shareSlug}`} target="_blank" rel="noreferrer">
                  Open public page
                </a>
              </p>
            )}
          </div>
        )}
      </div>
      <div>
        <button
          type="button"
          className="sc-btn-ghost"
          onClick={() => void signOut({ callbackUrl: "/" })}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
