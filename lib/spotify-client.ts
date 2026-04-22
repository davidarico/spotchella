import { prisma } from "@/lib/prisma";
import { unstable_noStore as noStore } from "next/cache";

export class SpotifyNotLinkedError extends Error {
  override name = "SpotifyNotLinkedError";
  constructor() {
    super("Spotify is not connected");
  }
}

/**
 * Returns a valid Spotify access token, refreshing the stored `accounts` row when needed.
 */
export async function getValidSpotifyAccessToken(userId: string) {
  noStore();
  const account = await prisma.account.findFirst({
    where: { userId, provider: "spotify" },
  });
  if (!account || !account.refresh_token) {
    throw new SpotifyNotLinkedError();
  }
  const now = Math.floor(Date.now() / 1000);
  if (account.access_token && account.expires_at && account.expires_at > now + 60) {
    return account.access_token;
  }
  const cid = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!cid || !secret) {
    throw new Error("Spotify app credentials are not set");
  }
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: account.refresh_token,
      client_id: cid,
      client_secret: secret,
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Spotify token refresh failed: ${errText}`);
  }
  const data = (await res.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  };
  const expiresAt = now + data.expires_in;
  await prisma.account.update({
    where: { id: account.id },
    data: {
      access_token: data.access_token,
      refresh_token: data.refresh_token ?? account.refresh_token,
      expires_at: expiresAt,
    },
  });
  return data.access_token;
}
