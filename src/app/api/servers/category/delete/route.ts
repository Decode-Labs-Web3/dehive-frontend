import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { generateRequestId, apiPathName } from "@/utils/index.utils";

export async function DELETE(req: Request) {
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

    const body = await req.json();
    const { categoryId } = body;

    // console.log("[category/post] incoming payload", { serverId, name });

    if (!categoryId) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          message: "Missing required fields: categoryId",
        },
        { status: 400 }
      );
    }

    const backendResponse = await fetch(
      `${process.env.DEHIVE_SERVER}/api/servers/categories/${categoryId}`,
      {
        method: "DELETE",
        headers: {
          "x-session-id": sessionId,
        },
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    );

    // console.debug( "delete-category backend response status", backendResponse.status);

    if (!backendResponse.ok) {
      const error = await backendResponse.json().catch(() => null);
      console.error("/api/servers/category/post backend error:", error);
      return NextResponse.json(
        {
          success: false,
          statusCode: backendResponse.status || 401,
          message: error?.message || "Create category failed",
        },
        { status: backendResponse.status || 401 }
      );
    }

    const response = await backendResponse.json();
    // console.debug("delete-category success response", response);

    return NextResponse.json(
      {
        success: true,
        statusCode: response.statusCode || 200,
        message: response.message || "Operation successful",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("/api/servers/category/delete handler error:", error);
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
