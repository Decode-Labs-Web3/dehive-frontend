import { ethers } from "ethers";
import SCORE_FACET_ABI from "../deid/ScoreFacet.sol/ScoreFacet.json";

const PROXY_ADDRESS = process.env.NEXT_PUBLIC_DEID_PROXY;
const RPC_URL = process.env.NEXT_PUBLIC_SEPOLIA_RPC;
const IPFS_GATEWAY_URL = process.env.NEXT_PUBLIC_IPFS_GATEWAY_URL_GET?.trim();

if (!PROXY_ADDRESS || !RPC_URL || !IPFS_GATEWAY_URL) {
  throw new Error("Missing environment variables for score service");
}

interface UserScoreData {
  address: string;
  username: string;
  totalScore: number;
  breakdown: {
    badgeScore: number;
    socialScore: number;
    streakScore: number;
    chainScore: number;
    contributionScore: number;
  };
  rank: number;
  badges: Array<{ tokenId: number; [key: string]: any }>;
  socialAccounts: Array<{ platform: string; accountId: string }>;
  streakDays: number;
  lastUpdated: number;
}

async function fetchUserScore(
  walletAddress: string
): Promise<UserScoreData | null> {
  // 1. Create provider and connect to ScoreFacet
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const contract = new ethers.Contract(
    PROXY_ADDRESS!,
    SCORE_FACET_ABI.abi,
    provider
  );

  // 2. Get latest snapshot from contract
  const [cid, root, id, timestamp] = await contract.getLatestSnapshot();

  if (!cid || cid.length === 0) {
    throw new Error("No snapshot found");
  }

  // 3. Fetch snapshot data from IPFS
  const normalizedCID = cid.startsWith("ipfs://")
    ? cid.replace("ipfs://", "")
    : cid;
  const response = await fetch(`${IPFS_GATEWAY_URL}/${normalizedCID}`);
  const snapshotData = await response.json();

  // 4. Find user in snapshot
  const normalizedAddress = walletAddress.toLowerCase();
  const userData = snapshotData.users.find(
    (u: any) => u.address.toLowerCase() === normalizedAddress
  );

  if (!userData) {
    return null;
  }

  // 5. Return user score data
  return {
    address: userData.address,
    username: userData.username,
    totalScore: userData.totalScore,
    breakdown: {
      badgeScore: userData.breakdown.badgeScore,
      socialScore: userData.breakdown.socialScore,
      streakScore: userData.breakdown.streakScore,
      chainScore: userData.breakdown.chainScore,
      contributionScore: userData.breakdown.contributionScore,
    },
    rank: userData.rank,
    badges: userData.badges,
    socialAccounts: userData.socialAccounts,
    streakDays: userData.streakDays,
    lastUpdated: userData.lastUpdated,
  };
}

export default fetchUserScore;
