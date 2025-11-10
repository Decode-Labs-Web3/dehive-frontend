import { NextResponse } from "next/server";
import { HTTP_STATUS } from "@/constants/index.constants";
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
    const data = await req.json();

    if (!data || typeof data !== "object") {
      return NextResponse.json(
        {
          success: false,
          statusCode: HTTP_STATUS.BAD_REQUEST,
          message: "Invalid data provided",
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const url = "https://api.pinata.cloud/pinning/pinJSONToIPFS";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
      },
      body: JSON.stringify({
        pinataContent: data,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      console.error(`${pathname} error:`, response.status, error);
      return NextResponse.json(
        {
          success: false,
          statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
          message: "IPFS upload failed",
        },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      statusCode: HTTP_STATUS.OK,
      message: "IPFS upload successful",
      data: {
        hash: result.IpfsHash,
        ipfsURI: `ipfs://${result.IpfsHash}`,
      },
    });
  } catch (error) {
    console.error(`${pathname} error:`, error);
    return NextResponse.json(
      {
        success: false,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: "Internal server error",
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  } finally {
    console.info(`${pathname}: ${requestId}`);
  }
}
