import { NextRequest, NextResponse } from "next/server";

// Constant-time string comparison so a mistyped/guessed credential can't be
// narrowed down via response-time differences (the naive `===` this
// replaces bails out at the first mismatched byte). Implemented by hand
// with the Web Encoding API rather than Node's `crypto.timingSafeEqual`
// because Next.js middleware runs on the Edge runtime, which doesn't
// support Node's `crypto` module.
function safeEqual(a: string, b: string): boolean {
  const bufA = new TextEncoder().encode(a);
  const bufB = new TextEncoder().encode(b);
  // Compare against a same-length view so a length mismatch doesn't
  // short-circuit (and so its timing doesn't leak the length either).
  const length = Math.max(bufA.length, bufB.length, 1);
  let diff = bufA.length === bufB.length ? 0 : 1;
  for (let i = 0; i < length; i++) {
    diff |= (bufA[i] ?? 0) ^ (bufB[i] ?? 0);
  }
  return diff === 0;
}

// Gates the whole app behind HTTP Basic Auth once ADMIN_USERNAME/
// ADMIN_PASSWORD are set. This holds real personal financial data and is
// meant for single-user private use - if those env vars are unset (local
// dev), auth is skipped for convenience, but they MUST be set before any
// real deployment.
export function middleware(request: NextRequest) {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    return NextResponse.next();
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    const [scheme, encoded] = authHeader.split(" ");
    if (scheme === "Basic" && encoded) {
      const decoded = Buffer.from(encoded, "base64").toString("utf-8");
      const separatorIndex = decoded.indexOf(":");
      const providedUser = decoded.slice(0, separatorIndex);
      const providedPass = decoded.slice(separatorIndex + 1);
      if (safeEqual(providedUser, username) && safeEqual(providedPass, password)) {
        return NextResponse.next();
      }
    }
  }

  return new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="AcquireOps"' },
  });
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
};
