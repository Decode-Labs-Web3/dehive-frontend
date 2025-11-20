import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    const mark = request.headers.get("X-Frontend-Internal-Request");
    if (mark === "true") {
      return NextResponse.next();
    }

    try {
      const url = new URL(request.url);
      const forwardHeaders = new Headers(request.headers as HeadersInit);
      forwardHeaders.set("X-Frontend-Internal-Request", "true");

      const fetchOptions: RequestInit = {
        method: request.method,
        headers: forwardHeaders,
        credentials: "include",
      };

      if (request.method !== "GET" && request.method !== "HEAD") {
        try {
          const buf = await request.arrayBuffer();
          fetchOptions.body = buf;
        } catch (e) {}
      }

      const apiRes = await fetch(url.toString(), fetchOptions);

      if (apiRes.status === 401) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = "/";
        return NextResponse.redirect(redirectUrl);
      }

      const resHeaders = new Headers(apiRes.headers);
      const body = await apiRes.arrayBuffer();
      return new NextResponse(body, {
        status: apiRes.status,
        headers: resHeaders,
      });
    } catch (err) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          statusCode: 500,
          message: "Proxy error",
        }),
        { status: 500, headers: { "content-type": "application/json" } }
      );
    }
  }

  if (pathname === "/") {
    const hasSession = request.cookies.get("sessionId")?.value;
    if (hasSession) {
      const url = request.nextUrl.clone();
      url.pathname = "/app/channels/me";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/api/:path*"],
};
