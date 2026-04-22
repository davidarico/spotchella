import { auth } from "@/auth";
import Link from "next/link";
import { SignInCta } from "./sign-in-cta";

export default async function Home() {
  const session = await auth();
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-5xl px-5 pb-20 pt-16 md:pt-24">
        <header className="mb-16 max-w-2xl">
          <p className="sc-eyebrow mb-4">Music taste → festival poster</p>
          <h1 className="font-display text-6xl leading-[0.9] tracking-tight text-dune-900/95 md:text-7xl">
            SPOTCHELLA
          </h1>
          <p className="mt-4 max-w-md text-lg leading-relaxed text-black/65">
            Connect Spotify, drag to rank your top artists, and export a shareable “dream Coachella” lineup
            — typography-first, not a data dump.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            {session?.user ? (
              <Link className="sc-btn-primary" href="/studio">
                Open studio
              </Link>
            ) : (
              <SignInCta />
            )}
            <a className="sc-btn-ghost" href="#how">
              How it works
            </a>
          </div>
        </header>
        <section id="how" className="grid gap-4 md:grid-cols-3">
          {[
            {
              t: "01 — Taste",
              d: "We pull short, medium, and long-term top artists, merge them with weighted scores, and pre-rank a clean list of ~50.",
            },
            {
              t: "02 — You choose",
              d: "Re-order with drag-and-drop, trim weak picks, and save a ranking you stand behind.",
            },
            {
              t: "03 — Poster",
              d: "We split the bill into headliners, sub, mid, and undercard, then render a real poster layout in 9:16 and 1:1.",
            },
          ].map((c) => (
            <div key={c.t} className="sc-card p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-900/80">{c.t}</p>
              <p className="mt-2 text-sm leading-relaxed text-black/60">{c.d}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
