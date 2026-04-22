import { handlers } from "@/auth";
import { withCanonicalAuthOrigin } from "@/lib/auth-request";
import type { NextRequest } from "next/server";

export const GET = (req: NextRequest) => handlers.GET(withCanonicalAuthOrigin(req));
export const POST = (req: NextRequest) => handlers.POST(withCanonicalAuthOrigin(req));
