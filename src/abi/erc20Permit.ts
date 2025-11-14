// Minimal ABI bits for EIP-2612 permit-capable tokens
export const erc20PermitAbi = [
  {
    type: "function",
    stateMutability: "view",
    name: "nonces",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    stateMutability: "view",
    name: "version",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
] as const;

export type Erc20PermitAbi = typeof erc20PermitAbi;
