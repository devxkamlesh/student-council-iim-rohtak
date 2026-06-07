import { NextResponse } from "next/server";

// Adds a developer-attribution response header to every request.
// Reuse this file as-is across projects for a consistent build signature.
export function middleware() {
  const res = NextResponse.next();
  res.headers.set("X-Built-By", "Kamlesh Choudhary (devxkamlesh.com)");
  return res;
}

export const config = {
  // Run on all routes except Next internals and static assets.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
