"use client";

import { toPng } from "html-to-image";
import { useState, useRef, type RefObject } from "react";
import { LineupPoster } from "./LineupPoster";
import type { LineupTiers } from "@/lib/types";

async function fileFromRef(
  el: HTMLElement,
  opts: { width: number; height: number; fileName: string },
) {
  const data = await toPng(el, {
    cacheBust: true,
    pixelRatio: 1,
    width: opts.width,
    height: opts.height,
    style: { width: `${opts.width}px`, height: `${opts.height}px` },
  });
  const a = document.createElement("a");
  a.href = data;
  a.download = opts.fileName;
  a.click();
}

export function PosterExportControls({ lineup, userName }: { lineup: LineupTiers; userName: string }) {
  const storyRef = useRef<HTMLDivElement | null>(null);
  const squareRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState<"story" | "square" | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const run = async (which: "story" | "square", ref: RefObject<HTMLDivElement | null>) => {
    setErr(null);
    setLoading(which);
    try {
      const el = ref.current;
      if (!el) throw new Error("Poster not ready");
      const w = 1080;
      const h = which === "story" ? 1920 : 1080;
      await fileFromRef(el, {
        width: w,
        height: h,
        fileName: `spotchella-lineup-${which === "story" ? "9x16" : "1x1"}.png`,
      });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Export failed");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-3">
      {err ? <p className="text-sm text-rose-800/90">{err}</p> : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="sc-btn-primary"
          disabled={!!loading}
          onClick={() => void run("story", storyRef)}
        >
          {loading === "story" ? "…" : "Download 9:16 (Story)"}
        </button>
        <button
          type="button"
          className="sc-btn-ghost"
          disabled={!!loading}
          onClick={() => void run("square", squareRef)}
        >
          {loading === "square" ? "…" : "Download 1:1 (Post)"}
        </button>
      </div>
      <p className="text-xs text-black/50">Posters are rendered at 1080px width. Best shared on social as PNG.</p>
      <div
        aria-hidden
        className="pointer-events-none fixed top-0 left-[-20000px] z-[-1] flex gap-0"
        style={{ overflow: "hidden" }}
      >
        <div className="shrink-0">
          <LineupPoster ref={storyRef} lineup={lineup} userName={userName} format="story" />
        </div>
        <div className="shrink-0">
          <LineupPoster ref={squareRef} lineup={lineup} userName={userName} format="square" />
        </div>
      </div>
    </div>
  );
}
