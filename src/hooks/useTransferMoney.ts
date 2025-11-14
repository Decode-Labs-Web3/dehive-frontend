"use client";
import { useCallback, useState } from "react";
import {
  useWriteContract,
  useAccount,
  usePublicClient,
  useWalletClient,
} from "wagmi";
import { parseEther, parseUnits, getAddress, keccak256, toBytes } from "viem";
import { erc20Abi } from "@/abi/airdropAbi";
import { paymentHubAbi } from "@/abi/paymentHubAbi";
import { erc20PermitAbi } from "@/abi/erc20Permit";
import { computeConversationId } from "@/lib/scMessage";
import type {
  TransferMoneyParams,
  PaymentTransferRecord,
  PaymentTransferResult,
} from "@/interfaces/payment.interface";

// Assumes PaymentHub facet installed in same proxy used elsewhere.
const PAYMENT_PROXY_ADDRESS = process.env.NEXT_PUBLIC_PROXY_ADDRESS as
  | `0x${string}`
  | undefined;

export function useTransferMoney() {
  const { writeContractAsync } = useWriteContract();
  const { address: sender } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const transferMoney = useCallback(
    async (params: TransferMoneyParams): Promise<PaymentTransferResult> => {
      if (!PAYMENT_PROXY_ADDRESS)
        throw new Error(
          "Payment proxy address missing (NEXT_PUBLIC_PROXY_ADDRESS)"
        );
      if (!sender) throw new Error("Wallet not connected");
      const recipient = getAddress(params.recipient);
      const senderAddr = getAddress(sender);
      const convId = computeConversationId(senderAddr, recipient);
      const mode: 0 | 1 = params.mode ?? 0;

      setLoading(true);
      setError(null);

      // Prepare record JSON
      const record: PaymentTransferRecord = {
        sender: senderAddr,
        recipient,
        amount: params.amount,
        token:
          params.assetType === "native"
            ? "native"
            : params.tokenSymbol || "ERC20",
        token_address:
          params.assetType === "native"
            ? "0x0000000000000000000000000000000000000000"
            : getAddress(params.tokenAddress || "0x"),
        message: params.memo || "",
      };

      // Construct tx
      const clientMsgId = `client-${Date.now()}`;
      let txHash: `0x${string}` | undefined;
      if (params.assetType === "native") {
        if (process.env.NODE_ENV !== "production") {
          console.debug("PaymentHub.sendNative ->", {
            proxy: PAYMENT_PROXY_ADDRESS,
            recipient,
            amount: params.amount,
            convId: convId.toString(),
          });
        }
        // Value passed as ETH
        const value = parseEther(params.amount);
        txHash = await writeContractAsync({
          address: PAYMENT_PROXY_ADDRESS,
          // cast as any for wagmi when using const ABI subset
          abi: paymentHubAbi as any,
          functionName: "sendNative",
          // Post-IPFS upload strategy: pass empty cid/hash
          args: [
            convId,
            recipient,
            "",
            "0x0000000000000000000000000000000000000000000000000000000000000000",
            mode,
            clientMsgId,
          ],
          value,
        });
      } else {
        if (!params.tokenAddress)
          throw new Error("tokenAddress required for ERC-20 transfer");
        // Ensure the provided token address is a contract
        try {
          if (publicClient) {
            const code = await publicClient.getBytecode({
              address: getAddress(params.tokenAddress),
            });
            if (!code) throw new Error();
          }
        } catch {
          throw new Error(
            "Selected token address is not a valid ERC-20 contract"
          );
        }
        // Determine token decimals for accurate parsing
        let decimals = 18;
        try {
          if (publicClient) {
            const d = (await publicClient.readContract({
              address: getAddress(params.tokenAddress),
              abi: erc20Abi as any,
              functionName: "decimals",
              args: [],
            })) as number;
            if (typeof d === "number" && d > 0 && d <= 36) decimals = d;
          }
        } catch {}
        const amountWei = parseUnits(params.amount, decimals);

        // Try EIP-2612 permit path first to avoid approve transaction
        let usedPermit = false;
        try {
          if (!publicClient || !walletClient) throw new Error("no clients");
          const token = getAddress(params.tokenAddress);
          // Read token name (for EIP-712 domain)
          const [name, nonce] = await Promise.all([
            publicClient.readContract({
              address: token,
              abi: erc20Abi as any,
              functionName: "name",
              args: [],
            }) as Promise<string>,
            publicClient.readContract({
              address: token,
              abi: erc20PermitAbi as any,
              functionName: "nonces",
              args: [senderAddr],
            }) as Promise<bigint>,
          ]);

          // Some tokens have version(); fall back to "1"
          let version = "1";
          try {
            const v = (await publicClient.readContract({
              address: token,
              abi: erc20PermitAbi as any,
              functionName: "version",
              args: [],
            })) as string;
            if (typeof v === "string" && v.length) version = v;
          } catch {}

          const chainId = await publicClient.getChainId();
          const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 10); // +10 minutes

          const domain = {
            name,
            version,
            chainId,
            verifyingContract: token,
          } as const;

          const types = {
            Permit: [
              { name: "owner", type: "address" },
              { name: "spender", type: "address" },
              { name: "value", type: "uint256" },
              { name: "nonce", type: "uint256" },
              { name: "deadline", type: "uint256" },
            ],
          } as const;

          const message = {
            owner: senderAddr,
            spender: PAYMENT_PROXY_ADDRESS,
            value: amountWei,
            nonce,
            deadline,
          } as const;

          const signature = await walletClient.signTypedData({
            account: senderAddr,
            domain,
            types,
            primaryType: "Permit",
            message,
          });

          const sig = signature.startsWith("0x")
            ? signature.slice(2)
            : signature;
          const r = ("0x" + sig.slice(0, 64)) as `0x${string}`;
          const s = ("0x" + sig.slice(64, 128)) as `0x${string}`;
          let v = parseInt(sig.slice(128, 130), 16);
          if (v < 27) v += 27;

          if (process.env.NODE_ENV !== "production") {
            console.debug("PaymentHub.sendERC20WithPermit ->", {
              proxy: PAYMENT_PROXY_ADDRESS,
              token,
              recipient,
              amount: params.amount,
            });
          }
          txHash = await writeContractAsync({
            address: PAYMENT_PROXY_ADDRESS,
            abi: paymentHubAbi as any,
            functionName: "sendERC20WithPermit",
            args: [
              convId,
              recipient,
              token,
              amountWei,
              "",
              "0x0000000000000000000000000000000000000000000000000000000000000000",
              mode,
              clientMsgId,
              deadline,
              v,
              r,
              s,
            ],
          });
          usedPermit = true;
        } catch (e) {
          // Permit failed or not supported; fallback to plain send (requires prior allowance)
          // This will likely fail if allowance is insufficient; caller UI may opt to approve beforehand.
        }

        if (!usedPermit) {
          // Ensure allowance before calling sendERC20
          try {
            if (!publicClient)
              throw new Error("public client unavailable for allowance");
            const current = (await publicClient.readContract({
              address: getAddress(params.tokenAddress),
              abi: erc20Abi as any,
              functionName: "allowance",
              args: [senderAddr, PAYMENT_PROXY_ADDRESS],
            })) as bigint;
            if (current < amountWei) {
              // Approve exactly needed amount (safer than unlimited)
              if (process.env.NODE_ENV !== "production") {
                console.debug("ERC20.approve ->", {
                  token: getAddress(params.tokenAddress),
                  spender: PAYMENT_PROXY_ADDRESS,
                  amount: params.amount,
                });
              }
              await writeContractAsync({
                address: getAddress(params.tokenAddress),
                abi: erc20Abi as any,
                functionName: "approve",
                args: [PAYMENT_PROXY_ADDRESS, amountWei],
              });
            }
          } catch {
            // If allowance check/approve fails, we'll still attempt send; wallet may simulate/reject if not enough
          }

          if (process.env.NODE_ENV !== "production") {
            console.debug("PaymentHub.sendERC20 ->", {
              proxy: PAYMENT_PROXY_ADDRESS,
              token: getAddress(params.tokenAddress),
              recipient,
              amount: params.amount,
            });
          }
          txHash = await writeContractAsync({
            address: PAYMENT_PROXY_ADDRESS,
            abi: paymentHubAbi as any,
            functionName: "sendERC20",
            args: [
              convId,
              recipient,
              getAddress(params.tokenAddress),
              amountWei,
              "",
              "0x0000000000000000000000000000000000000000000000000000000000000000",
              mode,
              clientMsgId,
            ],
          });
        }
      }

      // Optionally wait for receipt (ensures success before returning)
      if (!txHash) throw new Error("Transaction not sent");
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash: txHash });
      }

      // Upload to IPFS after on-chain success
      const contentBytes = toBytes(JSON.stringify(record));
      const _contentHash = keccak256(contentBytes);
      const ipfsResp = await fetch("/api/ipfs/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        body: JSON.stringify({ record }),
      });
      if (!ipfsResp.ok) {
        throw new Error(`IPFS upload failed: ${await ipfsResp.text()}`);
      }
      const { cid } = (await ipfsResp.json()) as { cid: string };

      return { txHash, cid, record };
    },
    [sender, writeContractAsync, publicClient, walletClient]
  );

  return { transferMoney, loading, error };
}
