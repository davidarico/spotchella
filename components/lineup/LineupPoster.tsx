"use client";

import type { LineupTiers } from "@/lib/types";
import { forwardRef } from "react";

const tierLabel = (s: string) => (
  <p className="mb-1 text-center font-sans text-[8px] font-semibold uppercase tracking-[0.35em] text-black/50">{s}</p>
);

type PosterRef = HTMLDivElement;

type Props = {
  lineup: LineupTiers;
  userName: string;
  year?: string;
  format: "story" | "square";
};

const posterShell =
  "relative box-border flex flex-col border border-white/20 bg-poster-sun text-[rgb(25,12,20)]";

export const LineupPoster = forwardRef<PosterRef, Props>(function LineupPoster(
  { lineup, userName, year = "2026", format },
  ref,
) {
  const w = 1080;
  const h = format === "story" ? 1920 : 1080;
  const { headliners, subHeadliners, midTier, lowerTier } = lineup;

  return (
    <div ref={ref} className={posterShell} style={{ width: w, height: h }}>
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent 0 2px,
            rgba(0,0,0,0.03) 2px 4px
          )`,
        }}
      />
      <div className="flex h-full flex-col px-6 pb-6 pt-6">
        <header className="mb-4 text-center">
          <p className="font-sans text-[10px] font-bold uppercase tracking-[0.5em] text-[rgb(60,20,40)]">Presented by your taste</p>
          <h1 className="mt-1 font-display text-[4.2rem] leading-[0.95] tracking-wide text-[rgb(35,8,25)]">SPOTCHELLA</h1>
          <p className="mt-1 font-sans text-sm font-medium text-black/55">Indio, CA · {year}</p>
          <p className="mt-2 font-sans text-lg font-semibold text-black/70">{userName}&apos;s dream lineup</p>
        </header>
        <div className="min-h-0 flex-1 overflow-hidden">
          <section className="mb-3">
            {tierLabel("Headliners")}
            <div className="text-center font-display text-[2.4rem] font-normal leading-[0.98] text-[rgb(25,12,20)]">
              {headliners.map((n) => (
                <span key={n.name} className="block">
                  {n.name.toUpperCase()}
                </span>
              ))}
            </div>
          </section>
          <section className="mb-2">
            {tierLabel("Sub headliners")}
            <div className="text-center font-display text-[1.45rem] font-normal leading-tight text-[rgb(25,12,20)]">
              {subHeadliners.map((n) => (
                <span key={n.name} className="block">
                  {n.name.toUpperCase()}
                </span>
              ))}
            </div>
          </section>
          <section className="mb-2">
            {tierLabel("Mid bill")}
            <div
              className="overflow-hidden text-center font-sans text-[0.88rem] font-semibold leading-snug text-[rgb(30,12,20)]"
              style={{ maxHeight: format === "square" ? 220 : 360 }}
            >
              {midTier.map((n) => (
                <span key={n.name} className="inline-block after:px-1 after:content-['·'] last:after:content-none">
                  {n.name}
                </span>
              ))}
            </div>
          </section>
          <section>
            {tierLabel("Undercard")}
            <div
              className="overflow-hidden text-center font-sans text-[0.65rem] font-medium leading-tight text-black/80"
              style={{ maxHeight: format === "square" ? 180 : 420 }}
            >
              {lowerTier.map((n) => (
                <span key={n.name} className="inline after:px-0.5 after:content-['·'] last:after:content-none">
                  {n.name}
                </span>
              ))}
            </div>
          </section>
        </div>
        <footer className="mt-auto border-t border-black/10 pt-2 text-center font-sans text-[8px] uppercase tracking-[0.25em] text-black/45">
          spotchella · not affiliated with aeg or coachella
        </footer>
      </div>
    </div>
  );
});

export type { Props as LineupPosterProps };
