import { notFound } from "next/navigation";
import { getPublicLineupBySlug } from "@/lib/lineup-share";
import { LineupPreviewClient } from "./preview";

type PageProps = { params: Promise<{ shareSlug: string }> };

export default async function ShareLineupPage({ params }: PageProps) {
  const { shareSlug } = await params;
  const data = await getPublicLineupBySlug(shareSlug);
  if (!data) notFound();
  return (
    <div className="min-h-screen bg-dune-hero px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <p className="sc-eyebrow mb-2">Shared lineup</p>
        <h1 className="mb-6 font-display text-4xl tracking-tight text-dune-900/90">SPOTCHELLA</h1>
        <LineupPreviewClient data={data} />
      </div>
    </div>
  );
}
