import { NextResponse } from "next/server";
import { getEncryptionKeysCollection } from "@/lib/mongodb";
import { isAddress, getAddress } from "viem";

/**
 * POST /api/encryption-key/save
 * Saves a user's encryption public key to MongoDB
 * Body: { walletAddress: string, publicKey: string }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { walletAddress, publicKey } = body;

    // Validate inputs
    if (!walletAddress || !publicKey) {
      return NextResponse.json(
        { success: false, message: "walletAddress and publicKey are required" },
        { status: 400 }
      );
    }

    if (!isAddress(walletAddress)) {
      return NextResponse.json(
        { success: false, message: "Invalid wallet address" },
        { status: 400 }
      );
    }

    // Validate publicKey is base64 (X25519 public keys are 32 bytes = 44 chars in base64)
    if (typeof publicKey !== "string" || publicKey.length < 40) {
      return NextResponse.json(
        { success: false, message: "Invalid public key format" },
        { status: 400 }
      );
    }

    const collection = await getEncryptionKeysCollection();
    const normalizedAddress = getAddress(walletAddress).toLowerCase();
    const now = new Date();

    // Upsert: insert if not exists, update if exists
    const result = await collection.updateOne(
      { walletAddress: normalizedAddress },
      {
        $set: {
          publicKey,
          updatedAt: now,
        },
        $setOnInsert: {
          walletAddress: normalizedAddress,
          createdAt: now,
        },
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message:
        result.upsertedCount > 0 ? "Public key saved" : "Public key updated",
      walletAddress: normalizedAddress,
    });
  } catch (error) {
    console.error("Error saving encryption public key:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
