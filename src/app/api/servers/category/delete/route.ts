import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { HTTP_STATUS } from "@/constants/index.constants";
import {
  generateRequestId,
  apiPathName,
  guardInternal,
} from "@/utils/index.utils";

export async function DELETE(req: Request) {
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
          statusCode: HTTP_STATUS.UNAUTHORIZED,
          message: "Missing sessionId",
        },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    const body = await req.json();
    const { categoryId } = body;

    const fingerprint = req.headers.get("X-Fingerprint-Hashed");
    // console.log("this is fingerprint from headers:", fingerprint);

    if (!fingerprint) {
      return NextResponse.json(
        {
          success: false,
          statusCode: HTTP_STATUS.BAD_REQUEST,
          message: "Missing fingerprint header",
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    if (!categoryId) {
      return NextResponse.json(
        {
          success: false,
          statusCode: HTTP_STATUS.BAD_REQUEST,
          message: "Missing required fields: categoryId",
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const backendResponse = await fetch(
      `${process.env.DEHIVE_SERVER}/api/servers/categories/${categoryId}`,
      {
        method: "DELETE",
        headers: {
          "x-session-id": sessionId,
          "x-fingerprint-hashed": fingerprint,
        },
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    );

    // console.debug(`${pathname} :`, backendResponse.status);

    if (!backendResponse.ok) {
      const error = await backendResponse.json().catch(() => null);
      console.error(`${pathname} error:`, error);
      return NextResponse.json(
        {
          success: false,
          statusCode: backendResponse.status || HTTP_STATUS.BAD_REQUEST,
          message: error?.message || "Create category failed",
        },
        { status: backendResponse.status || HTTP_STATUS.BAD_REQUEST }
      );
    }

    const response = await backendResponse.json();
    // console.debug(`${pathname}:`, response);

    return NextResponse.json(
      {
        success: true,
        statusCode: response.statusCode || HTTP_STATUS.OK,
        message: response.message || "Operation successful",
      },
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    console.error(`${pathname} error:`, error);
    return NextResponse.json(
      {
        success: false,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: "Server error while get server",
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  } finally {
    console.info(`${pathname}: ${requestId}`);
  }
}
