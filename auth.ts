import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Spotify from "next-auth/providers/spotify";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { getAuthProxyBaseForSpotify } from "@/lib/app-origin";
import { prisma } from "@/lib/prisma";

const scopes = [
  "user-read-email",
  "user-read-private",
  "user-top-read",
].join(" ");

/** Fresh redirect + clients on every auth run so `.env` and localhost→127 rewrite are never stale. */
function createAuthConfig(): NextAuthConfig {
  return {
    basePath: "/api/auth",
    adapter: PrismaAdapter(prisma) as never,
    providers: [
      Spotify({
        clientId: process.env.SPOTIFY_CLIENT_ID ?? "",
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET ?? "",
        /**
         * @auth/core builds `redirect_uri` for the token request from the incoming
         * request origin, which is often `http://localhost:...` when devs use that
         * host. `redirectProxyUrl` forces a single, canonical `redirect_uri` (built
         * as `${this}/callback/spotify`) for both authorize and code exchange, so
         * it can match a Spotify app that only lists `http://127.0.0.1:...`.
         * @see https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/lib/utils/providers.ts
         */
        redirectProxyUrl: getAuthProxyBaseForSpotify(),
        authorization: {
          url: "https://accounts.spotify.com/authorize",
          params: {
            scope: scopes,
            show_dialog: "false",
          },
        },
      }),
    ],
    session: { strategy: "database" },
    trustHost: true,
    pages: { signIn: "/" },
    callbacks: {
      async signIn({ user, account, profile }) {
        if (user.id && account?.provider === "spotify") {
          const spotifyId = account.providerAccountId;
          const displayName = profile && "display_name" in profile && (profile as { display_name?: string }).display_name
            ? (profile as { display_name: string }).display_name
            : (profile as { name?: string })?.name ?? user.name;
          const email = (profile as { email?: string })?.email;
          const image = (profile as { images?: { url: string }[] })?.images?.[0]?.url ?? user.image;
          try {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                spotifyId,
                displayName: displayName ?? undefined,
                name: displayName ?? user.name,
                email: email ? email : user.email,
                image,
              },
            });
          } catch {
            return true;
          }
        }
        return true;
      },
      session({ session, user }) {
        if (session.user) session.user.id = user.id;
        return session;
      },
    },
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth(() => createAuthConfig());

declare module "next-auth" {
  interface Session {
    user: { id: string; name?: string | null; email?: string | null; image?: string | null };
  }
}
