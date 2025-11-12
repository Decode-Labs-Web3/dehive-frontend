export interface PaymentTransferRecord {
  sender: string; // checksummed address
  recipient: string; // checksummed address
  amount: string; // human-readable decimal string (e.g. 1.25)
  token: string; // "native" | symbol like USDC
  token_address: string; // address(0) for native
  message: string; // optional memo
}

export interface PaymentTransferResult {
  txHash: `0x${string}`;
  cid: string; // IPFS CID of stored JSON
  record: PaymentTransferRecord;
}

export interface TransferMoneyParams {
  recipient: string;
  amount: string; // decimal string
  assetType: "native" | "erc20";
  tokenAddress?: string; // required for erc20
  tokenSymbol?: string; // optional display symbol
  memo?: string; // optional note/message
  mode?: 0 | 1; // PaymentHub visibility mode (0 public, 1 secret)
}
