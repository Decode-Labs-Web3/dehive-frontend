import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  generateRequestId,
  apiPathName,
  guardInternal,
} from "@/utils/index.utils";

export async function PATCH(req: Request) {
  const requestId = generateRequestId();
  const pathname = apiPathName(req);
  const denied = guardInternal(req);
  if (denied) return denied;

  try {
    const sessionId = (await cookies()).get("sessionId")?.value;

    if (!sessionId) {
      return NextResponse.json(
        {
          status: false,
          statusCode: 401,
          message: "Missing sessionId",
        },
        {
          status: 401,
        }
      );
    }

    const body = await req.json();
    const { serverId, name, description } = body;

    if (!serverId || !name || !description) {
      return NextResponse.json(
        {
          status: false,
          statusCode: 400,
          message: "Missing serverId or name or description",
        },
        { status: 400 }
      );
    }

    const requestBody = {
      name,
      description,
    };

    const backendRes = await fetch(
      `${process.env.DEHIVE_SERVER}/api/servers/${serverId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId,
        },
        body: JSON.stringify(requestBody),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    );

    // console.log("this is backend response from ", backendRes)

    if (!backendRes.ok) {
      const error = await backendRes.json().catch(() => null);
      return NextResponse.json(
        {
          status: false,
          statusCode: backendRes.status || 400,
          message: error.message,
        },
        { status: backendRes.status || 400 }
      );
    }

    const response = await backendRes.json();
    return NextResponse.json(
      {
        status: true,
        statusCode: response.statusCode || 200,
        message: response.message || "Operation successful",
      },
      { status: response.statusCode || 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      status: false,
      statusCode: 500,
      message: "Server error for edit server",
    });
  } finally {
    console.log(`${pathname} - ${requestId}`);
  }
}
