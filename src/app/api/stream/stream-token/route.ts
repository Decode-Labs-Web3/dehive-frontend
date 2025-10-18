import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { StreamClient } from "@stream-io/node-sdk";
export const runtime = "nodejs";
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
    const userId = (await cookies()).get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 401,
          message: "userId is not found",
        },
        { status: 401 }
      );
    }

    const apiKey = process.env.STREAM_KEY!;
    const apiSecret = process.env.STREAM_SECRET!;
    const client = new StreamClient(apiKey, apiSecret);
    const validity = 60 * 60 * 24 * 30; // 30 days

    const token = client.generateUserToken({
      user_id: userId!,
      validity_in_seconds: validity,
    });
    return NextResponse.json(
      {
        success: true,
        statusCode: 200,
        message: "Stream.io token retrieved successfully",
        data: { token },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(`${pathname} error:`, error);
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: "Server get user info fail",
      },
      { status: 500 }
    );
  } finally {
    console.info(`${pathname}: ${requestId}`);
  }
}
