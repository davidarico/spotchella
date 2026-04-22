import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { StudioClient } from "./StudioClient";

export const metadata = { title: "Studio — Spotchella" };

export default async function StudioPage() {
  const s = await auth();
  if (!s?.user) {
    redirect("/");
  }
  return (
    <div className="min-h-screen px-4 pb-16 pt-8 md:px-8">
      <div className="mx-auto max-w-xl">
        <h1 className="font-display text-4xl tracking-tight text-dune-900/90">STUDIO</h1>
        <p className="mb-8 mt-1 text-sm text-black/50">Order your bill. Generate the poster. Share.</p>
        <StudioClient />
      </div>
    </div>
  );
}
