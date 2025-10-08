import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    const mark = request.headers.get("x-frontend-internal-request");
    if (mark !== "true") {
      return new NextResponse(
        JSON.stringify({
          success: false,
          statusCode: 403,
          message: "Forbidden: missing X-Frontend-Internal-Request",
        }),
        { status: 403, headers: { "content-type": "application/json" } }
      );
    }
    return NextResponse.next();
  }

  if (pathname === "/") {
    const hasSession = request.cookies.get("sessionId")?.value;
    if (hasSession) {
      const url = request.nextUrl.clone();
      url.pathname = "/app/channels/@me";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/api/:path*"],
};
