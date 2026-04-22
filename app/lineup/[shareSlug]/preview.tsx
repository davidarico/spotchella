"use client";

import { LineupPoster } from "@/components/lineup/LineupPoster";
import { PosterExportControls } from "@/components/lineup/PosterExportControls";
import type { PublicLineup } from "@/lib/types";
import Link from "next/link";
import { useState } from "react";

const PREVIEW_W = 360;

export function LineupPreviewClient({ data }: { data: PublicLineup }) {
  const [format, setFormat] = useState<"story" | "square">("story");
  const s = PREVIEW_W / 1080;
  const hFull = format === "story" ? 1920 : 1080;
  const hVis = hFull * s;

  return (
    <div className="space-y-6">
      <p className="text-sm text-black/60">
        {data.userDisplayName} · {new Date(data.createdAt).toLocaleDateString()}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setFormat("story")}
          className={format === "story" ? "sc-btn-primary" : "sc-btn-ghost"}
        >
          9:16 preview
        </button>
        <button
          type="button"
          onClick={() => setFormat("square")}
          className={format === "square" ? "sc-btn-primary" : "sc-btn-ghost"}
        >
          1:1 preview
        </button>
      </div>
      <div className="sc-card overflow-hidden p-4">
        <div className="mx-auto overflow-hidden rounded-lg border border-black/10" style={{ width: PREVIEW_W, height: hVis }}>
          <div
            style={{
              width: 1080,
              height: hFull,
              transform: `scale(${s})`,
              transformOrigin: "top left",
            }}
          >
            <LineupPoster lineup={data.lineup} userName={data.userDisplayName} format={format} />
          </div>
        </div>
      </div>
      <PosterExportControls lineup={data.lineup} userName={data.userDisplayName} />
      <Link href="/" className="sc-btn-ghost inline-flex">
        ← Build yours
      </Link>
    </div>
  );
}
