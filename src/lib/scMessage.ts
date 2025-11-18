import { encodePacked, getAddress, keccak256 } from "viem";
import { messageAbi } from "@/abi/messageAbi";

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

// ===== Mock encryption (POC only) =====
export function base64EncodeUnicode(str: string): string {
  // Encode Unicode safely for base64 (btoa expects Latin1)
  return btoa(unescape(encodeURIComponent(str)));
}
export function base64DecodeUnicode(b64: string): string {
  return decodeURIComponent(escape(atob(b64)));
}

// Equivalent to mock encryptMessage: prefix + base64(message)
export function mockEncryptMessage(message: string, key: string): string {
  const keyPrefix = base64EncodeUnicode(key.substring(0, 8)).substring(0, 8);
  const encoded = base64EncodeUnicode(message);
  return `${keyPrefix}${encoded}`;
}

export function mockDecryptMessage(
  encryptedMessage: string,
  key: string
): string {
  const keyPrefix = base64EncodeUnicode(key.substring(0, 8)).substring(0, 8);
  if (!encryptedMessage.startsWith(keyPrefix)) {
    throw new Error("Invalid encryption key or corrupted message");
  }
  const encoded = encryptedMessage.substring(keyPrefix.length);
  return base64DecodeUnicode(encoded);
}

// Simple conversation key generation (no persistent storage)
function hexFromBytes(buf: Uint8Array): string {
  return Array.from(buf)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function generateConversationKey(seed?: string): string {
  if (seed) {
    // Deterministic: non-crypto quick hash for demo only.
    let hash = 0;
    for (let i = 0; i < seed.length; i++)
      hash = (hash * 31 + seed.charCodeAt(i)) | 0;
    const out: string[] = [];
    for (let i = 0; i < 32; i++) {
      hash = (hash * 1664525 + 1013904223) | 0;
      out.push(((hash >>> 0) & 0xff).toString(16).padStart(2, "0"));
    }
    return out.join("");
  }
  const bytes = new Uint8Array(32);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 32; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return hexFromBytes(bytes);
}

// Address-key encryption helpers (mock XOR with sha256(address))
export async function sha256Hex(input: string): Promise<string> {
  const enc = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", enc);
  const bytes = new Uint8Array(digest);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function encryptConversationKeyForAddress(
  conversationKey: string,
  address: string
): Promise<string> {
  const hashHex = await sha256Hex(address.toLowerCase());
  let out = "";
  for (let i = 0; i < conversationKey.length; i++) {
    const a = parseInt(conversationKey[i], 16);
    const b = parseInt(hashHex[i % hashHex.length], 16);
    out += ((a ^ b) & 0xf).toString(16);
  }
  return out;
}

export async function decryptConversationKeyForAddress(
  encryptedKeyHex: string,
  address: string
): Promise<string> {
  const hashHex = await sha256Hex(address.toLowerCase());
  let out = "";
  for (let i = 0; i < encryptedKeyHex.length; i++) {
    const a = parseInt(encryptedKeyHex[i], 16);
    const b = parseInt(hashHex[i % hashHex.length], 16);
    out += ((a ^ b) & 0xf).toString(16);
  }
  return out;
}

// Tries to obtain the caller's conversation key via contract calls.
type ReadContract = (opts: {
  address: `0x${string}`;
  abi: unknown;
  functionName: string;
  args?: unknown[];
  account?: `0x${string}`; // ensure msg.sender for view calls when needed
}) => Promise<unknown>;

export async function getMyConversationKey(
  publicClient: unknown,
  proxy: `0x${string}`,
  conversationId: bigint,
  myAddress: string
): Promise<string | null> {
  const pc = publicClient as { readContract: ReadContract };
  try {
    // First try direct getter (may revert if not participant).
    const encKey = (await pc.readContract({
      address: proxy,
      abi: messageAbi,
      functionName: "getMyEncryptedConversationKeys",
      args: [conversationId],
      account: getAddress(myAddress),
    })) as string;
    const encHex = encKey.startsWith("0x") ? encKey.slice(2) : encKey;
    if (encHex)
      return await decryptConversationKeyForAddress(encHex, myAddress);
  } catch {}

  try {
    // Fallback: read tuple and select my slot
    const conv = (await pc.readContract({
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
    const [smaller, , encSmall, encLarge, cAt] = conv;
    if (cAt && cAt !== BigInt(0)) {
      const me = getAddress(myAddress);
      const isSmaller = me.toLowerCase() === smaller.toLowerCase();
      const enc = isSmaller ? encSmall : encLarge;
      const encHex2 = enc.startsWith("0x") ? enc.slice(2) : enc;
      if (encHex2)
        return await decryptConversationKeyForAddress(encHex2, myAddress);
    }
  } catch {}

  return null;
}
