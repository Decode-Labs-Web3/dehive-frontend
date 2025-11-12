# Payment Transfers (PaymentHub + IPFS)

This adds a client-side hook and API route to send payments through the PaymentHub facet (via the shared proxy) and store a transfer receipt JSON on IPFS after success.

## Environment

Add these to your environment (e.g. `.env.local`):

- `NEXT_PUBLIC_PROXY_ADDRESS` — Diamond proxy address that hosts the PaymentHub facet.
- `IPFS_GATEWAY_URL_POST` — HTTP API endpoint for IPFS add, e.g. `http://35.247.142.76:5001/api/v0/add`
- `NEXT_PUBLIC_IPFS_GATEWAY_URL_GET` — Public gateway for retrieval, e.g. `http://35.247.142.76:8080/ipfs`

## Files

- `src/abi/paymentHubAbi.ts` — Minimal ABI subset for PaymentHub interactions.
- `src/interfaces/payment.interface.ts` — Types for transfer inputs/outputs and IPFS record.
- `src/hooks/useTransferMoney.ts` — React hook exposing `transferMoney(params)`.
- `src/app/api/ipfs/add/route.ts` — Server route to upload JSON to IPFS HTTP API.
- `src/app/app/test/page.tsx` — Demo UI wired to call `transferMoney`.

## Usage

In a client component:

```tsx
import { useTransferMoney } from "@/hooks/useTransferMoney";

const { transferMoney } = useTransferMoney();

await transferMoney({
  recipient: "0xRecipient…",
  amount: "0.5", // decimal string
  assetType: "native", // or "erc20"
  tokenAddress: undefined, // required if assetType = "erc20"
  tokenSymbol: "USDC", // optional display label
  memo: "optional note",
  mode: 0, // 0 public, 1 secret (for PaymentHub)
});
```

Returns `{ txHash, cid, record }`. The `record` JSON saved to IPFS:

```json
{
  "sender": "0x…",
  "recipient": "0x…",
  "amount": "1.23",
  "token": "native", // or symbol like "USDC"
  "token_address": "0x0000000000000000000000000000000000000000",
  "message": "optional memo"
}
```

Notes:

- For ERC‑20, the hook will read `decimals()` from the token to parse the `amount`.
- The on-chain call passes empty `ipfsCid`/`contentHash` and uploads to IPFS after the transaction is confirmed (as requested).
- If you need on-chain linkage to the IPFS CID, switch the flow to upload first, then include `cid` and `keccak256(JSON)` in the contract call.

## Test UI

Navigate to `/app/app/test` and use the dialog to try a transfer. Ensure your wallet is connected to the same network as the proxy.
