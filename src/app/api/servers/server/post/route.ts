import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { fingerprintService } from "@/services/index.services";
import {
  generateRequestId,
  apiPathName,
  guardInternal,
} from "@/utils/index.utils";

export async function POST(req: Request) {
  const requestId = generateRequestId();
  const pathname = apiPathName(req);
  const denied = guardInternal(req);
  if (denied) return denied;

  try {
    const sessionId = (await cookies()).get("sessionId")?.value;
    const body = await req.json();
    const { name, description } = body;

    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 401,
          message: "Missing sessionId",
        },
        { status: 401 }
      );
    }

    if (!name || !description) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          message: "Missing name and description",
        },
        { status: 400 }
      );
    }

    const requestBody = {
      name,
      description,
    };

    const userAgent = req.headers.get("user-agent") || "";
    const { fingerprint_hashed } = await fingerprintService(userAgent);

    const backendResponse = await fetch(
      `${process.env.DEHIVE_SERVER}/api/servers`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId,
          "x-fingerprint-hashed": fingerprint_hashed,
        },
        body: JSON.stringify(requestBody),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    );

    // console.debug(`${pathname}:`, backendResponse.status);

    if (!backendResponse.ok) {
      const error = await backendResponse.json().catch(() => null);
      console.error(`${pathname}`, error);
      return NextResponse.json(
        {
          success: false,
          statusCode: backendResponse.status || 400,
          message: error?.message || "Create server failed",
        },
        { status: backendResponse.status || 400 }
      );
    }

    const response = await backendResponse.json();
    // console.debug(`${pathname}:`, response);

    return NextResponse.json(
      {
        success: true,
        statusCode: response.statusCode || 201,
        message: response.message || "Operation successful",
        data: response.data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(`${pathname} error:`, error);
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: "Server error while creating server",
      },
      { status: 500 }
    );
  } finally {
    console.info(`${pathname}: ${requestId}`);
  }
}
