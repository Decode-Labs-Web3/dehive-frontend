"use client";
import { useCallback, useState } from "react";
import { useWriteContract, useAccount, usePublicClient } from "wagmi";
import { parseEther, parseUnits, getAddress, keccak256, toBytes } from "viem";
import { erc20Abi } from "@/abi/airdropAbi";
import { paymentHubAbi } from "@/abi/paymentHubAbi";
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
      let txHash: `0x${string}`;
      if (params.assetType === "native") {
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

      // Optionally wait for receipt (ensures success before returning)
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash: txHash });
      }

      // Upload to IPFS after on-chain success
      const contentBytes = toBytes(JSON.stringify(record));
      const _contentHash = keccak256(contentBytes); // not used on-chain in this flow but computed for parity
      const ipfsResp = await fetch("/api/ipfs/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ record }),
      });
      if (!ipfsResp.ok) {
        throw new Error(`IPFS upload failed: ${await ipfsResp.text()}`);
      }
      const { cid } = (await ipfsResp.json()) as { cid: string };

      return { txHash, cid, record };
    },
    [sender, writeContractAsync, publicClient]
  );

  return { transferMoney, loading, error };
}
