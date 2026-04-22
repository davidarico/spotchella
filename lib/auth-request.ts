import { getPublicAppOrigin } from "@/lib/app-origin";
import { NextRequest } from "next/server";

/**
 * `provider.callbackUrl` (used in the OAuth **token** request) must match the first
 * `redirect_uri` sent to Spotify. Re-resolve the request URL with the same origin
 * as `getPublicAppOrigin()` (including localhost → 127 rewrite).
 */
export function withCanonicalAuthOrigin(req: NextRequest) {
  const u = new URL(req.url);
  const canonical = new URL(u.pathname + u.search, getPublicAppOrigin() + "/");
  if (u.href === canonical.href) {
    return req;
  }
  return new NextRequest(canonical, req);
}
