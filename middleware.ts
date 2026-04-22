import { NextResponse, type NextRequest } from "next/server";

const DEV = process.env.NODE_ENV === "development";

/**
 * Browsers treat `localhost` and `127.0.0.1` as different sites: cookies, storage, and CORS
 * do not cross between them. For Spotify OAuth the redirect is `http://127.0.0.1:...`, so the
 * session cookie is set for `127.0.0.1` — if the app UI is still on `http://localhost:3000`
 * the user has no session ("nothing happens"). In dev, force a single host.
 */
export function middleware(request: NextRequest) {
  if (!DEV) {
    return NextResponse.next();
  }
  const host = request.headers.get("host");
  if (!host || !host.startsWith("localhost")) {
    return NextResponse.next();
  }
  const to = new URL(request.url);
  to.hostname = "127.0.0.1";
  return NextResponse.redirect(to, 308);
}

export const config = { matcher: ["/:path*"] };
