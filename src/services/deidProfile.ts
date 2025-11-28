import { ethers } from "ethers";
import DEID_PROFILE_ABI from "../deid/DEiDProfile.sol/DEiDProfile.json";

const PROXY_ADDRESS = process.env.NEXT_PUBLIC_DEID_PROXY!;
const RPC_URL = process.env.NEXT_PUBLIC_SEPOLIA_RPC!;

console.log("DEiD Profile Service - Proxy Address:", PROXY_ADDRESS);
console.log("DEiD Profile Service - RPC URL:", RPC_URL);

if (!PROXY_ADDRESS || !RPC_URL) {
  throw new Error("Missing environment variables for DEiD profile service");
}

async function fetchUserProfile(walletAddress: string) {
  // 1. Create provider
  const provider = new ethers.JsonRpcProvider(RPC_URL!);

  // 2. Connect to DEiDProfile contract via proxy
  const contract = new ethers.Contract(
    PROXY_ADDRESS!,
    DEID_PROFILE_ABI.abi,
    provider
  );

  // 3. Fetch profile data
  const profile = await contract.getProfile(walletAddress);

  // 4. Parse profile data
  const profileData = {
    username: profile.username,
    metadataURI: profile.metadataURI,
    wallets: profile.wallets,
    socialAccounts: profile.socialAccounts,
    createdAt: Number(profile.createdAt),
    lastUpdated: Number(profile.lastUpdated),
    isActive: profile.isActive,
  };

  // 5. Fetch metadata from IPFS if available
  let metadata = null;
  if (profile.metadataURI && profile.metadataURI !== "") {
    const ipfsHash = profile.metadataURI.replace("ipfs://", "");
    const response = await fetch(`https://ipfs.de-id.xyz/ipfs/${ipfsHash}`);
    metadata = await response.json();
  }

  return { profile: profileData, metadata };
}

export default fetchUserProfile;
