import { ethers } from "ethers";
import BADGE_SYSTEM_ABI from "../deid/BadgeSystem.sol/BadgeSystem.json";

const PROXY_ADDRESS = process.env.NEXT_PUBLIC_DEID_PROXY;
const RPC_URL = process.env.NEXT_PUBLIC_SEPOLIA_RPC;
const IPFS_GATEWAY_URL = process.env.NEXT_PUBLIC_IPFS_GATEWAY_URL_GET?.trim();

if (!PROXY_ADDRESS || !RPC_URL || !IPFS_GATEWAY_URL) {
  throw new Error("Missing environment variables for badge service");
}

interface UserBadge {
  tokenId: number;
  metadata: {
    name: string;
    description: string;
    image: string;
    attributes: Array<{
      trait_type: string;
      value: string | number;
    }>;
  };
  imageUrl: string;
}

async function fetchUserBadges(walletAddress: string): Promise<UserBadge[]> {
  // 1. Create provider and connect to BadgeSystem
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const contract = new ethers.Contract(
    PROXY_ADDRESS!,
    BADGE_SYSTEM_ABI.abi,
    provider
  );

  // 2. Get user's badge token IDs
  const tokenIds = await contract.getUserBadges(walletAddress);
  const numericTokenIds = tokenIds.map((id: bigint) => Number(id));

  if (numericTokenIds.length === 0) {
    return [];
  }

  // 3. Fetch metadata for each badge
  const badges: UserBadge[] = [];
  for (const tokenId of numericTokenIds) {
    try {
      // Get token URI (IPFS hash)
      const tokenURI = await contract.tokenURI(tokenId);
      const ipfsHash = tokenURI.replace("ipfs://", "");

      // Fetch metadata from IPFS
      const response = await fetch(`${IPFS_GATEWAY_URL}/${ipfsHash}`);
      const metadata = await response.json();

      // Get image URL
      const imageHash = metadata.image.replace("ipfs://", "");
      const imageUrl = `${IPFS_GATEWAY_URL}/${imageHash}`;

      badges.push({
        tokenId,
        metadata,
        imageUrl,
      });
    } catch (error) {
      console.error(`Failed to fetch metadata for token ${tokenId}:`, error);
      // Continue with other badges
    }
  }

  return badges;
}

export default fetchUserBadges;
