import { NextResponse } from "next/server";
import { getEncryptionKeysCollection } from "@/lib/mongodb";
import { isAddress, getAddress } from "viem";

/**
 * POST /api/encryption-key/get
 * Retrieves a user's encryption public key from MongoDB
 * Body: { walletAddress: string }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { walletAddress } = body;

    // Validate input
    if (!walletAddress) {
      return NextResponse.json(
        { success: false, message: "walletAddress is required" },
        { status: 400 }
      );
    }

    if (!isAddress(walletAddress)) {
      return NextResponse.json(
        { success: false, message: "Invalid wallet address" },
        { status: 400 }
      );
    }

    const collection = await getEncryptionKeysCollection();
    const normalizedAddress = getAddress(walletAddress).toLowerCase();

    const record = await collection.findOne({
      walletAddress: normalizedAddress,
    });

    if (!record) {
      return NextResponse.json({
        success: true,
        found: false,
        publicKey: null,
        message: "No public key found for this address",
      });
    }

    return NextResponse.json({
      success: true,
      found: true,
      publicKey: record.publicKey,
      walletAddress: normalizedAddress,
    });
  } catch (error) {
    console.error("Error fetching encryption public key:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
