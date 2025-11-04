// Minimal ABI for Dehive Message (facet) used by frontend Pay-as-you-go
export const messageAbi = [
  // events
  {
    type: "event",
    name: "MessageSent",
    inputs: [
      { name: "conversationId", type: "uint256", indexed: true },
      { name: "from", type: "address", indexed: true },
      { name: "to", type: "address", indexed: true },
      { name: "encryptedMessage", type: "string", indexed: false },
    ],
  },
  {
    type: "function",
    stateMutability: "view",
    name: "conversations",
    inputs: [{ name: "conversationId", type: "uint256" }],
    outputs: [
      { name: "smallerAddress", type: "address" },
      { name: "largerAddress", type: "address" },
      { name: "encryptedConversationKeyForSmallerAddress", type: "bytes" },
      { name: "encryptedConversationKeyForLargerAddress", type: "bytes" },
      { name: "createdAt", type: "uint256" },
    ],
  },
  // reads
  {
    type: "function",
    stateMutability: "view",
    name: "payAsYouGoFee",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    stateMutability: "view",
    name: "relayerFee",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    stateMutability: "view",
    name: "funds",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    stateMutability: "view",
    name: "getMyEncryptedConversationKeys",
    inputs: [{ name: "conversationId", type: "uint256" }],
    outputs: [{ name: "", type: "string" }],
  },
  // writes
  {
    type: "function",
    stateMutability: "nonpayable",
    name: "createConversation",
    inputs: [
      { name: "to", type: "address" },
      { name: "encryptedConversationKeyForSender", type: "bytes" },
      { name: "encryptedConversationKeyForReceiver", type: "bytes" },
    ],
    outputs: [{ name: "conversationId", type: "uint256" }],
  },
  {
    type: "function",
    stateMutability: "payable",
    name: "sendMessage",
    inputs: [
      { name: "conversationId", type: "uint256" },
      { name: "to", type: "address" },
      { name: "encryptedMessage", type: "string" },
    ],
    outputs: [{ name: "success", type: "bool" }],
  },
] as const;
