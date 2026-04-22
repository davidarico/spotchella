/**
 * Public site origin for OAuth. Prefer `AUTH_URL`, then `NEXTAUTH_URL`.
 * Do not mirror these via `next.config` `env` (build-time inlining can wrong-foot runtime).
 */
export function getPublicAppOrigin() {
  const raw = process.env.AUTH_URL || process.env.NEXTAUTH_URL;
  if (!raw) {
    return "http://127.0.0.1:3000";
  }
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return "http://127.0.0.1:3000";
  }
  // Spotify: many people register 127.0.0.1 in the dev dashboard but leave `localhost` in `.env`
  // — those are different OAuth hosts. Unless opted out, normalize localhost → loopback IP.
  if (u.hostname === "localhost" && process.env.AUTH_PRESERVE_LOCALHOST !== "true") {
    u.hostname = "127.0.0.1";
  }
  return u.origin;
}

/**
 * Exact redirect for Spotify. Built with the URL object so the path is never doubled or missing.
 * Re-compute on every call (not at module import) so `.env` is read after Next loads it.
 */
export function getSpotifyRedirectUri() {
  return new URL("/api/auth/callback/spotify", getPublicAppOrigin() + "/").href;
}

/**
 * Base path passed to Auth.js as `redirectProxyUrl` (before the provider id is appended
 * in `@auth/core`). It must be `.../api/auth` so the computed redirect is
 * `.../api/auth/callback/spotify`, matching the real NextAuth route. This is required
 * because Auth.js overwrites `provider.callbackUrl` from the **current request
 * origin** (so opening the app on `localhost` would otherwise break token exchange
 * if Spotify only allows `http://127.0.0.1:...` for `redirect_uri`).
 */
export function getAuthProxyBaseForSpotify() {
  return new URL("api/auth", getPublicAppOrigin() + "/").href.replace(/\/$/, "");
}
