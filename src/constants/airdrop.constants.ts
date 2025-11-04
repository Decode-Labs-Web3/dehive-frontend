import { sepolia } from "wagmi/chains";
import { merkleAirdropAbi } from "@/abi/airdropAbi";

export const AIRDROP_CONTRACTS = {
  registry:
    (process.env.NEXT_PUBLIC_REGISTRY_ADDRESS as `0x${string}`) ||
    "0xac2FeCc2Bca3221B6eEf8A92B0dF29fA0BfdAFa2",
  factory:
    (process.env.NEXT_PUBLIC_FACTORY_ADDRESS as `0x${string}`) ||
    "0xAcff01C4509cC6B2BD770F59c3c6F2061E5F0bf0",
  merkleAirdrop:
    (process.env.NEXT_PUBLIC_MERKLE_AIRDROP_ADDRESS as `0x${string}`) ||
    "0x82953eE584b0b5Bbf097810FD538c81646A1e256",
} as const;

export const GRAPH_CONFIG = {
  endpoint:
    "https://api.studio.thegraph.com/query/1713799/dehive-airdrop/version/latest",
  apiKey: "112c016bdd600a7de3fa8e9379471bf2",
} as const;

export const IPFS_GATEWAY = "https://ipfs.io/ipfs";

export const SEPOLIA_CHAIN_ID = sepolia.id;

export const EXPLORER_BASE_URL = "https://sepolia.etherscan.io";

export const CLAIM_PERIOD_DAYS = 7;

export { merkleAirdropAbi };
