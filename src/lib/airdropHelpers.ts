import { keccak256, getAddress, isAddress } from "viem";
import { MerkleTree } from "merkletreejs";

export interface Claim {
  index: number;
  account: string;
  amount: bigint;
}

export interface MerkleTreeData {
  tree: MerkleTree;
  root: string;
  getProof: (index: number) => string[];
}

/**
 * Hash a claim for Merkle tree generation
 * Format: keccak256(abi.encodePacked(index, account, amount))
 */
export function hashClaim(
  index: number,
  account: string,
  amount: bigint
): Buffer {
  // Normalize account to checksum address
  const normalizedAccount = getAddress(account.toLowerCase());

  // Pack: index (uint256) + account (address) + amount (uint256)
  // Encode as ABI packed: uint256 (32 bytes) + address (20 bytes) + uint256 (32 bytes)
  const indexBytes = Buffer.alloc(32);
  const indexHex = BigInt(index).toString(16).padStart(64, "0");
  Buffer.from(indexHex, "hex").copy(indexBytes);

  const accountBytes = Buffer.from(normalizedAccount.slice(2), "hex");

  const amountBytes = Buffer.alloc(32);
  const amountHex = amount.toString(16).padStart(64, "0");
  Buffer.from(amountHex, "hex").copy(amountBytes);

  const packed = Buffer.concat([indexBytes, accountBytes, amountBytes]);

  return Buffer.from(keccak256(`0x${packed.toString("hex")}`).slice(2), "hex");
}

/**
 * Generate Merkle tree from claims
 */
export function generateMerkleTree(claims: Claim[]): MerkleTreeData {
  const leaves = claims.map((claim) =>
    hashClaim(claim.index, claim.account, claim.amount)
  );

  const tree = new MerkleTree(
    leaves,
    (data: Buffer) => {
      return Buffer.from(
        keccak256(`0x${data.toString("hex")}`).slice(2),
        "hex"
      );
    },
    { sortPairs: true }
  );

  const root = `0x${tree.getRoot().toString("hex")}`;

  return {
    tree,
    root,
    getProof: (index: number) => {
      const leaf = leaves[index];
      const proof = tree.getProof(leaf);
      return proof.map((p) => `0x${p.data.toString("hex")}`);
    },
  };
}

/**
 * Prepare IPFS data structure
 */
export function prepareIPFSData(
  metadata: {
    name: string;
    description: string;
    token: string;
    merkleRoot: string;
    totalAmount: string;
  },
  claims: Claim[],
  merkleTreeData: MerkleTreeData
) {
  const now = Math.floor(Date.now() / 1000);
  const claimDeadline = now + 7 * 24 * 60 * 60; // 7 days
  const unlockTimestamp = claimDeadline;

  return {
    metadata: {
      name: metadata.name,
      description: metadata.description,
      token: metadata.token,
      merkleRoot: metadata.merkleRoot,
      totalAmount: metadata.totalAmount,
      claimDeadline,
      unlockTimestamp,
      createdAt: now,
      version: "1.0.0",
    },
    claims: claims.map((claim, idx) => ({
      index: claim.index,
      account: getAddress(claim.account.toLowerCase()),
      amount: claim.amount.toString(),
      proof: merkleTreeData.getProof(idx),
    })),
  };
}

/**
 * Calculate days left until deadline
 */
export function getDaysLeft(deadline: number): number {
  const now = Math.floor(Date.now() / 1000);
  const days = Math.floor((deadline - now) / (24 * 60 * 60));
  return days > 0 ? days : 0;
}

/**
 * Shorten address for display
 */
export function shortenAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Validate Ethereum address
 */
export function validateAddress(address: string): boolean {
  return isAddress(address);
}

/**
 * Parse CSV file content
 */
export function parseCSV(
  csvContent: string
): Array<{ address: string; amount: string }> {
  const lines = csvContent.trim().split("\n");
  const result: Array<{ address: string; amount: string }> = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Support both comma and space separated
    const parts = line.split(/[, ]+/).filter((p) => p.trim());

    if (parts.length < 2) {
      throw new Error(
        `Invalid CSV format at line ${i + 1}: Expected address and amount`
      );
    }

    const address = parts[0].trim();
    const amount = parts[1].trim();

    if (!validateAddress(address)) {
      throw new Error(`Invalid address at line ${i + 1}: ${address}`);
    }

    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      throw new Error(`Invalid amount at line ${i + 1}: ${amount}`);
    }

    result.push({ address, amount });
  }

  return result;
}

/**
 * Shuffle array randomly
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
