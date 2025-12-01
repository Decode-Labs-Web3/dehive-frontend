import { encodePacked, getAddress, keccak256 } from "viem";
import { messageAbi } from "@/abi/messageAbi";
import CryptoJS from "crypto-js";
import { encrypt, EthEncryptedData } from "@metamask/eth-sig-util";

// ===== Conversation / Selector helpers =====
export function computeConversationId(a: string, b: string): bigint {
  const A = getAddress(a);
  const B = getAddress(b);
  const [smaller, larger] = A.toLowerCase() < B.toLowerCase() ? [A, B] : [B, A];
  const packed = encodePacked(["address", "address"], [smaller, larger]);
  const hash = keccak256(packed);
  return BigInt(hash);
}

export function deriveFunctionSelector(
  abi: ReadonlyArray<{
    type: string;
    name?: string;
    inputs?: ReadonlyArray<{ type: string }>;
  }>,
  functionName: string
): `0x${string}` {
  const fn = abi.find(
    (i) => i?.type === "function" && i?.name === functionName
  );
  if (!fn || !Array.isArray(fn.inputs)) return "0x00000000" as `0x${string}`;
  const sig = `${functionName}(${Array.from(fn.inputs)
    .map((x) => x.type)
    .join(",")})`;
  const bytes = new TextEncoder().encode(sig);
  const hash = keccak256(bytes);
  return `0x${hash.slice(2, 10)}` as `0x${string}`; // 4-byte selector
}

// ===== Symmetric encryption for messages (AES) =====
/**
 * Encrypts a message using AES with the conversation key.
 * @param message - The plaintext message
 * @param key - The symmetric conversation key (hex string)
 * @returns The encrypted ciphertext
 */
export function encryptMessage(message: string, key: string): string {
  return CryptoJS.AES.encrypt(message, key).toString();
}

/**
 * Decrypts a message using AES with the conversation key.
 * @param encryptedMessage - The ciphertext
 * @param key - The symmetric conversation key (hex string)
 * @returns The decrypted plaintext
 */
export function decryptMessage(encryptedMessage: string, key: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedMessage, key);
  const originalText = bytes.toString(CryptoJS.enc.Utf8);

  if (!originalText) {
    throw new Error("Invalid key or corrupted message");
  }
  return originalText;
}

// Legacy aliases for backward compatibility
export const mockEncryptMessage = encryptMessage;
export const mockDecryptMessage = decryptMessage;

// ===== Conversation key generation =====
function hexFromBytes(buf: Uint8Array): string {
  return Array.from(buf)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Generates a random 32-byte symmetric key for conversation encryption.
 * @returns A 64-character hex string representing the key
 */
export function generateConversationKey(): string {
  const bytes = new Uint8Array(32);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 32; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return hexFromBytes(bytes);
}

// ===== MetaMask Asymmetric Encryption (EIP-1024) =====

// Type for Ethereum provider
type EthereumProvider = {
  request: (args: { method: string; params: unknown[] }) => Promise<unknown>;
};

/**
 * Requests the user's encryption public key via MetaMask.
 * This triggers a MetaMask popup for user approval.
 * @param provider - The Ethereum provider (window.ethereum)
 * @param account - The user's wallet address
 * @returns The base64-encoded X25519 public key
 */
export async function getEncryptionPublicKey(
  provider: EthereumProvider,
  account: string
): Promise<string> {
  const publicKey = await provider.request({
    method: "eth_getEncryptionPublicKey",
    params: [account],
  });
  return publicKey as string;
}

/**
 * Encrypts data using a recipient's public encryption key (EIP-1024).
 * @param data - The data to encrypt (string)
 * @param publicKey - The recipient's base64-encoded X25519 public key
 * @returns The encrypted data as a hex string (0x-prefixed)
 */
export function encryptForPublicKey(data: string, publicKey: string): string {
  const encryptedData = encrypt({
    publicKey,
    data,
    version: "x25519-xsalsa20-poly1305",
  });

  // Convert the encrypted object to a JSON string, then to hex
  const encryptedJson = JSON.stringify(encryptedData);
  const hexData = Buffer.from(encryptedJson, "utf8").toString("hex");
  return `0x${hexData}`;
}

/**
 * Decrypts data using MetaMask's eth_decrypt.
 * This triggers a MetaMask popup for user approval.
 * @param provider - The Ethereum provider (window.ethereum)
 * @param account - The user's wallet address
 * @param encryptedHex - The encrypted data as a hex string (0x-prefixed)
 * @returns The decrypted plaintext
 */
export async function decryptWithMetaMask(
  provider: EthereumProvider,
  account: string,
  encryptedHex: string
): Promise<string> {
  // Convert hex back to JSON string
  const hex = encryptedHex.startsWith("0x")
    ? encryptedHex.slice(2)
    : encryptedHex;
  const encryptedJson = Buffer.from(hex, "hex").toString("utf8");

  // MetaMask expects the encrypted data as a JSON string
  const decryptedData = await provider.request({
    method: "eth_decrypt",
    params: [encryptedJson, account],
  });

  return decryptedData as string;
}

// ===== Public Key Storage API =====

/**
 * Fetches a user's encryption public key from the database.
 * @param walletAddress - The wallet address to lookup
 * @returns The public key if found, null otherwise
 */
export async function fetchPublicKeyFromDB(
  walletAddress: string
): Promise<string | null> {
  try {
    const response = await fetch("/api/encryption-key/get", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddress }),
    });

    if (!response.ok) {
      console.error("Failed to fetch public key:", response.statusText);
      return null;
    }

    const data = await response.json();
    if (data.success && data.found) {
      return data.publicKey;
    }
    return null;
  } catch (error) {
    console.error("Error fetching public key from DB:", error);
    return null;
  }
}

/**
 * Saves a user's encryption public key to the database.
 * @param walletAddress - The wallet address
 * @param publicKey - The base64-encoded X25519 public key
 * @returns true if successful
 */
export async function savePublicKeyToDB(
  walletAddress: string,
  publicKey: string
): Promise<boolean> {
  try {
    const response = await fetch("/api/encryption-key/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddress, publicKey }),
    });

    if (!response.ok) {
      console.error("Failed to save public key:", response.statusText);
      return false;
    }

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error("Error saving public key to DB:", error);
    return false;
  }
}

// ===== Conversation Key Management =====

/**
 * Ensures the user has a public key stored in the database.
 * If not, requests it via MetaMask and saves it.
 * @param provider - The Ethereum provider
 * @param account - The user's wallet address
 * @returns The user's public key
 */
export async function ensurePublicKeyExists(
  provider: EthereumProvider,
  account: string
): Promise<string> {
  // Check if public key exists in DB
  let publicKey = await fetchPublicKeyFromDB(account);

  if (!publicKey) {
    // Request public key from MetaMask
    publicKey = await getEncryptionPublicKey(provider, account);

    // Save to database
    const saved = await savePublicKeyToDB(account, publicKey);
    if (!saved) {
      console.warn("Failed to save public key to database");
    }
  }

  return publicKey;
}

// Type for public client (viem)
type PublicClientLike = {
  readContract: (opts: {
    address: `0x${string}`;
    abi: unknown;
    functionName: string;
    args?: unknown[];
    account?: `0x${string}`;
  }) => Promise<unknown>;
};

/**
 * Retrieves and decrypts the conversation key for the current user.
 * Uses MetaMask's eth_decrypt to decrypt the encrypted key from the blockchain.
 * @param publicClient - The viem public client for reading contracts
 * @param provider - The Ethereum provider (window.ethereum) for MetaMask decryption
 * @param proxy - The proxy contract address
 * @param conversationId - The conversation ID
 * @param myAddress - The current user's address
 * @returns The decrypted conversation key, or null if not found
 */
export async function getMyConversationKey(
  publicClient: PublicClientLike,
  provider: EthereumProvider,
  proxy: `0x${string}`,
  conversationId: bigint,
  myAddress: string
): Promise<string | null> {
  try {
    // Read the conversation from the blockchain
    const conv = (await publicClient.readContract({
      address: proxy,
      abi: messageAbi,
      functionName: "conversations",
      args: [conversationId],
    })) as readonly [
      `0x${string}`,
      `0x${string}`,
      `0x${string}`,
      `0x${string}`,
      bigint
    ];

    const [smaller, , encSmall, encLarge, createdAt] = conv;

    // Check if conversation exists
    if (!createdAt || createdAt === BigInt(0)) {
      return null;
    }

    // Determine which encrypted key belongs to the user
    const me = getAddress(myAddress);
    const isSmaller = me.toLowerCase() === smaller.toLowerCase();
    const myEncryptedKey = isSmaller ? encSmall : encLarge;

    // Check if there's an encrypted key
    if (!myEncryptedKey || myEncryptedKey === "0x") {
      return null;
    }

    // Decrypt using MetaMask
    const decryptedKey = await decryptWithMetaMask(
      provider,
      myAddress,
      myEncryptedKey
    );

    return decryptedKey;
  } catch (error) {
    console.error("Error getting conversation key:", error);
    return null;
  }
}

/**
 * Creates encrypted conversation keys for both participants.
 * @param conversationKey - The symmetric key to encrypt
 * @param senderPublicKey - The sender's encryption public key
 * @param recipientPublicKey - The recipient's encryption public key
 * @returns Object containing encrypted keys for both parties
 */
export function createEncryptedConversationKeys(
  conversationKey: string,
  senderPublicKey: string,
  recipientPublicKey: string
): { encryptedForSender: string; encryptedForRecipient: string } {
  const encryptedForSender = encryptForPublicKey(
    conversationKey,
    senderPublicKey
  );
  const encryptedForRecipient = encryptForPublicKey(
    conversationKey,
    recipientPublicKey
  );

  return {
    encryptedForSender,
    encryptedForRecipient,
  };
}
