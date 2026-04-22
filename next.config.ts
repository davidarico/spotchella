import type { NextConfig } from "next";

/**
 * Do not use `env: { AUTH_URL, NEXTAUTH_URL }` here — that inlines at build time and can bake
 * `http://localhost:3000` into the server bundle so it wins over the real `.env` at runtime.
 * Set `AUTH_URL` and `NEXTAUTH_URL` in `.env` only, then restart `next dev`.
 */
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.scdn.co", pathname: "/**" },
      { protocol: "https", hostname: "mosaic.scdn.co", pathname: "/**" },
    ],
  },
};

export default nextConfig;
