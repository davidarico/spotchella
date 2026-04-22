# Spotchella

Web app: connect Spotify, rank ~50 top artists (drag-and-drop), generate a Coachella-style tiered bill, and export a typographic “dream festival” poster as PNG (9:16 story + 1:1 square). Share lineups on a public page via `share_slug`.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS · Prisma 6 + PostgreSQL · Auth.js (NextAuth v5) with Spotify · TanStack Query · Zustand · @dnd-kit · html-to-image (PNG export)

## Requirements

- Node 20+ (LTS)
- PostgreSQL 14+ (or Docker: see `docker-compose.yml`)
- A [Spotify developer app](https://developer.spotify.com/dashboard) with redirect URIs that match what your dev server will send. Common mistakes: using `/callback` instead of `/api/auth/callback/spotify`, or registering only one of `localhost` / `127.0.0.1` when the other is what the OAuth `redirect_uri` query uses. **We recommend adding both of these in development** (Spotify allows multiple), then the flow works regardless of which host you type in the address bar:
  - `http://127.0.0.1:3000/api/auth/callback/spotify`
  - `http://localhost:3000/api/auth/callback/spotify`
  - Production: `https://<your-domain>/api/auth/callback/spotify`
- Set `AUTH_URL` and `NEXTAUTH_URL` to the **same** origin in **`.env`** (e.g. both `http://127.0.0.1:3000`). The Spotify `redirect_uri` in the app is built from that (not from `localhost` baked at build time). If OAuth still uses the wrong host, run `rm -rf .next` and restart `next dev` after changing `.env`.

## Setup

1. **Copy environment file**

   ```bash
   cp .env.example .env
   ```

2. **Configure `.env`**

   - `DATABASE_URL` — PostgreSQL connection string (e.g. `postgresql://spotchella:spotchella@localhost:5432/spotchella?schema=public` if you use the compose file below)
   - `AUTH_SECRET` — e.g. `openssl rand -base64 32`
   - `AUTH_URL` (or `NEXTAUTH_URL`) — e.g. `http://localhost:3000` in dev
   - `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` — from the Spotify dashboard

3. **Start Postgres (optional)**

   ```bash
   docker compose up -d
   ```

4. **Run migrations**

   Prisma migrations live in `prisma/migrations/`. Apply with:

   ```bash
   npx prisma migrate dev
   ```

   This creates / updates tables and runs `prisma generate`. If you add schema changes, run `npx prisma migrate dev` again to create a new migration and document it in git.

5. **Run the app**

   ```bash
   npm install
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000), sign in with Spotify, go to **Studio** (`/studio`).

## Database & migrations

- Schema: `prisma/schema.prisma`
- Initial SQL: `prisma/migrations/20250421000000_init/migration.sql` (Postgres, Auth.js + Spotchella tables)
- Commands:
  - `npm run db:migrate` — `prisma migrate dev` (dev DB + new migrations)
  - `npm run db:push` — `prisma db push` (prototyping only; prefer migrations in shared environments)
  - `npm run db:generate` — regenerate the Prisma client

## User flow

1. Sign in with Spotify (tokens stored on `accounts` via Auth.js; refresh in `getValidSpotifyAccessToken` before Spotify API calls).
2. **Studio** loads merged top artists (short / medium / long) or saved rankings.
3. Drag to reorder, remove acts, then **Save ranking** (upserts `artists` + `user_artist_rankings`).
4. **Save & generate lineup** — persists rankings, then builds tiers and saves `generated_lineups` (JSON) with a unique `share_slug`.
5. Download PNGs or open the public share page at `/lineup/[shareSlug]`.

## Project layout (high level)

- `auth.ts` — Auth.js + Spotify + Prisma adapter, user profile sync
- `lib/spotify-client.ts` — access token + refresh
- `lib/spotify-ranking.ts` — merge top-artist time ranges
- `lib/lineup.ts` — headliners / sub / mid / lower tiers + light genre diversity
- `components/lineup/LineupPoster.tsx` — poster layout (print-sized)
- `components/lineup/PosterExportControls.tsx` — off-screen full-res render + `html-to-image` download
- `app/api/*` — Spotify top, rankings, lineup generate, public share API

## Production notes

- Set `AUTH_URL` to your public origin.
- Keep `AUTH_SECRET` private; rotate with care (invalidates existing sessions if using JWT — here sessions are DB-backed).
- Harden the Spotify refresh path if users revoke access (we surface 401/502 from upstream).

## License

Private / your choice — this repo was generated as a product-style demo.
