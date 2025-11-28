import { ethers } from "ethers";
import DEID_PROFILE_ABI from "../deid/DEiDProfile.sol/DEiDProfile.json";

const PROXY_ADDRESS = process.env.NEXT_PUBLIC_DEID_PROXY;
const RPC_URL = process.env.NEXT_PUBLIC_SEPOLIA_RPC;

if (!PROXY_ADDRESS || !RPC_URL) {
  throw new Error("Missing environment variables for social accounts service");
}

interface SocialAccount {
  platform: string;
  accountId: string;
}

async function fetchSocialAccounts(
  walletAddress: string
): Promise<SocialAccount[]> {
  // 1. Create provider and connect to DEiDProfile
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const contract = new ethers.Contract(
    PROXY_ADDRESS!,
    DEID_PROFILE_ABI.abi,
    provider
  );

  // 2. Get social accounts
  const [platforms, accountIds] = await contract.getSocialAccounts(
    walletAddress
  );

  // 3. Map results to structured format
  const socialAccounts = platforms.map((platform: string, index: number) => ({
    platform: platform.toLowerCase(),
    accountId: accountIds[index],
  }));

  return socialAccounts;
}

export default fetchSocialAccounts;
