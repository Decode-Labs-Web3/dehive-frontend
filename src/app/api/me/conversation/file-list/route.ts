import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { fingerprintService } from "@/services/index.services";
import {
  generateRequestId,
  apiPathName,
  guardInternal,
} from "@/utils/index.utils";

export async function GET(req: Request) {
  const requestId = generateRequestId();
  const pathname = apiPathName(req);
  const denied = guardInternal(req);
  if (denied) return denied;

  try {
    const sessionId = (await cookies()).get("sessionId")?.value;

    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          message: "Missing sessionId",
        },
        { status: 400 }
      );
    }

    const userAgent = req.headers.get("user-agent") || "";
    const { fingerprint_hashed } = await fingerprintService(userAgent);
    console.log(fingerprint_hashed)

    const backendResponse = await fetch(
      `${process.env.DEHIVE_DIRECT_MESSAGING}/api/dm/following?page=0&limit=10`,
      {
        method: "GET",
        headers: {
          "x-session-id": sessionId,
          "x-fingerprint-hashed": fingerprint_hashed,
        },
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    );

    console.debug(
      "get-user-following backend response status",
      backendResponse.status
    );

    if (!backendResponse.ok) {
      const error = await backendResponse.json().catch(() => null);
      console.error("/api/user/user-following backend error:", error);
      return NextResponse.json(
        {
          success: false,
          statusCode: backendResponse.status || 401,
          message: error?.message || "Create server failed",
        },
        { status: backendResponse.status || 401 }
      );
    }

    const response = await backendResponse.json();
    // console.info("user-following success response", response);

    return NextResponse.json(
      {
        success: true,
        statusCode: response.statusCode || 200,
        message: response.message || "Following users fetched successfully",
        data: response.data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("/api/user/user-following handler error:", error);
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: "Server error while get server",
      },
      { status: 500 }
    );
  } finally {
    console.info(`${pathname}: ${requestId}`);
  }
}
