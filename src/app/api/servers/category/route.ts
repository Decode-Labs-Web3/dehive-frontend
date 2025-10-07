import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { generateRequestId, apiPathName } from "@/utils/index.utils";

export async function POST(req: Request) {
  const requestId = generateRequestId();
  const pathname = apiPathName(req);
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

    const body = await req.json()
    const { serverId } = body

    // console.log("get-category serverId response status", serverId)

    if (!serverId) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          message: "Missing serverId",
        },
        { status: 400 }
      );
    }

    const backendResponse = await fetch(
      `${process.env.DEHIVE_SERVER}/api/servers/${serverId}/categories`,
      {
        method: "GET",
        headers: {
          "x-session-id": sessionId,
        },
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    );

    console.debug("get-server-info backend response status", backendResponse.status);

    if (!backendResponse.ok) {
      const error = await backendResponse.json().catch(() => null);
      console.error("/api/servers/server-info backend error:", error);
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
    // console.debug("get-category success response", response);

    return NextResponse.json(
      {
        success: true,
        statusCode: response.statusCode || 200,
        message: response.message || "Operation successful",
        data: response.data
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("/api/servers/server-info handler error:", error);
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
