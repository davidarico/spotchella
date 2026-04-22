"use client";

import { signIn } from "next-auth/react";

export function SignInCta() {
  return (
    <button type="button" onClick={() => void signIn("spotify", { callbackUrl: "/studio" })} className="sc-btn-primary">
      Sign in with Spotify
    </button>
  );
}
