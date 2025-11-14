// PaymentHub ABI (subset needed for transfers)
// If you later need more functions (fees, withdraw, etc.) extend this array.
export const paymentHubAbi = [
  {
    type: "function",
    stateMutability: "view",
    name: "computeConversationId",
    inputs: [
      { name: "user1", type: "address" },
      { name: "user2", type: "address" },
    ],
    outputs: [{ name: "conversationId", type: "uint256" }],
  },
  {
    type: "function",
    stateMutability: "payable",
    name: "sendNative",
    inputs: [
      { name: "conversationId", type: "uint256" },
      { name: "recipient", type: "address" },
      { name: "ipfsCid", type: "string" },
      { name: "contentHash", type: "bytes32" },
      { name: "mode", type: "uint8" },
      { name: "clientMsgId", type: "string" },
    ],
    outputs: [{ name: "success", type: "bool" }],
  },
  {
    type: "function",
    stateMutability: "nonpayable",
    name: "sendERC20",
    inputs: [
      { name: "conversationId", type: "uint256" },
      { name: "recipient", type: "address" },
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "ipfsCid", type: "string" },
      { name: "contentHash", type: "bytes32" },
      { name: "mode", type: "uint8" },
      { name: "clientMsgId", type: "string" },
    ],
    outputs: [{ name: "success", type: "bool" }],
  },
  {
    type: "function",
    stateMutability: "nonpayable",
    name: "sendERC20WithPermit",
    inputs: [
      { name: "conversationId", type: "uint256" },
      { name: "recipient", type: "address" },
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "ipfsCid", type: "string" },
      { name: "contentHash", type: "bytes32" },
      { name: "mode", type: "uint8" },
      { name: "clientMsgId", type: "string" },
      { name: "deadline", type: "uint256" },
      { name: "v", type: "uint8" },
      { name: "r", type: "bytes32" },
      { name: "s", type: "bytes32" },
    ],
    outputs: [{ name: "success", type: "bool" }],
  },
] as const;

export type PaymentHubAbi = typeof paymentHubAbi;
