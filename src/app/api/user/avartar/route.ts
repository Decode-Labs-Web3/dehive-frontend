import { NextResponse } from "next/server";
import {
  generateRequestId,
  apiPathName,
  guardInternal,
} from "@/utils/index.utils";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];
const MAX_FILE_SIZE_MB = 5;

const validateFile = (file: File): boolean => {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return false;
  }

  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    return false;
  }

  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
    return false;
  }

  return true;
};

export async function POST(req: Request) {
  const requestId = generateRequestId();
  const pathname = apiPathName(req);
  const denied = guardInternal(req);
  if (denied) return denied;
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          message: "No file provided",
        },
        { status: 400 }
      );
    }

    if (!validateFile(file)) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          message: "Invalid file type or size",
        },
        { status: 400 }
      );
    }

    const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";
    const body = new FormData();
    body.append("file", file);

    const backendRes = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
      },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
    });

    if (!backendRes.ok) {
      console.error(`${pathname} error: `, backendRes.status);
      return NextResponse.json(
        {
          success: false,
          statusCode: 500,
          message: "File upload failed",
        },
        { status: 500 }
      );
    }

    const response = await backendRes.json();

    return NextResponse.json({
      success: true,
      ipfsHash: response.IpfsHash,
    });
  } catch (error) {
    console.error(`${pathname} error: `, error);
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: "Internal server error",
      },
      { status: 500 }
    );
  } finally {
    console.info(`${pathname}: ${requestId}`);
  }
}

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      statusCode: 405,
      message: "Method Not Allowed",
    },
    { status: 405 }
  );
}
