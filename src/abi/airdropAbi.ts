// ABI for ServerAirdropRegistry
export const registryAbi = [
  {
    type: "function",
    stateMutability: "view",
    name: "getFactoryByServerId",
    inputs: [{ name: "serverId", type: "string" }],
    outputs: [{ name: "", type: "address" }],
  },
  {
    type: "function",
    stateMutability: "nonpayable",
    name: "createFactoryForServer",
    inputs: [
      { name: "serverId", type: "string" },
      { name: "owner", type: "address" },
    ],
    outputs: [{ name: "factory", type: "address" }],
  },
  {
    type: "event",
    name: "FactoryCreated",
    inputs: [
      { name: "factory", type: "address", indexed: true },
      { name: "serverId", type: "string", indexed: true },
      { name: "owner", type: "address", indexed: true },
    ],
  },
] as const;

// ABI for AirdropFactory
export const factoryAbi = [
  {
    type: "function",
    stateMutability: "nonpayable",
    name: "createAirdropAndFund",
    inputs: [
      { name: "token", type: "address" },
      { name: "merkleRoot", type: "bytes32" },
      { name: "metadataURI", type: "string" },
      { name: "totalAmount", type: "uint256" },
    ],
    outputs: [{ name: "campaign", type: "address" }],
  },
  {
    type: "event",
    name: "AirdropCampaignCreated",
    inputs: [
      { name: "campaign", type: "address", indexed: true },
      { name: "creator", type: "address", indexed: true },
      { name: "serverId", type: "string", indexed: true },
      { name: "token", type: "address", indexed: false },
      { name: "merkleRoot", type: "bytes32", indexed: false },
      { name: "metadataURI", type: "string", indexed: false },
      { name: "totalAmount", type: "uint256", indexed: false },
    ],
  },
] as const;

// ABI for MerkleAirdrop
export const merkleAirdropAbi = [
  {
    type: "function",
    stateMutability: "nonpayable",
    name: "claim",
    inputs: [
      { name: "index", type: "uint256" },
      { name: "account", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "merkleProof", type: "bytes32[]" },
    ],
    outputs: [],
  },
  {
    type: "function",
    stateMutability: "view",
    name: "isClaimed",
    inputs: [{ name: "index", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    stateMutability: "view",
    name: "token",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
  {
    type: "function",
    stateMutability: "view",
    name: "merkleRoot",
    inputs: [],
    outputs: [{ name: "", type: "bytes32" }],
  },
  {
    type: "function",
    stateMutability: "view",
    name: "metadataURI",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
  {
    type: "function",
    stateMutability: "view",
    name: "totalAmount",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    stateMutability: "view",
    name: "claimDeadline",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    stateMutability: "view",
    name: "unlockTimestamp",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "event",
    name: "Claimed",
    inputs: [
      { name: "index", type: "uint256", indexed: true },
      { name: "account", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
] as const;

// ABI for ERC20 Token
export const erc20Abi = [
  {
    type: "function",
    stateMutability: "view",
    name: "name",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
  {
    type: "function",
    stateMutability: "view",
    name: "symbol",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
  {
    type: "function",
    stateMutability: "view",
    name: "decimals",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
  {
    type: "function",
    stateMutability: "view",
    name: "balanceOf",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    stateMutability: "nonpayable",
    name: "approve",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    stateMutability: "view",
    name: "allowance",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;
