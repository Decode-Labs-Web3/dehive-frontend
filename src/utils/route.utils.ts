import crypto from 'crypto';
import { NextResponse } from "next/server";

export function generateRequestId() {
  const time = new Date().toISOString();
  const uuid = crypto.randomUUID()
  return `${time} - ${uuid}`;
}

export function guardInternal(req: Request) {
  const internal = req.headers.get("X-Frontend-Internal-Request");
  if (internal !== "true") {
    return NextResponse.json(
      { success: false, statusCode: 403, message: "Forbidden" },
      { status: 403 }
    );
  }
  return null;
}


export function apiPathName(req: Request){
  const { pathname } = new URL(req.url)
  return pathname
}
