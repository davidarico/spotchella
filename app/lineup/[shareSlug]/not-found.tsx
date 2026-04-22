import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
      <p className="font-display text-3xl text-dune-900/90">Lineup not found</p>
      <p className="text-sm text-black/55">The link may be old or the lineup was removed.</p>
      <Link href="/" className="sc-btn-primary">
        Home
      </Link>
    </div>
  );
}
