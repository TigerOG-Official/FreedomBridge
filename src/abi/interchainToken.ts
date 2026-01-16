/**
 * InterchainToken ABI - Axelar ITS Token with cross-chain transfer capabilities
 *
 * This ABI includes both standard ERC20 functions and Axelar ITS bridge methods.
 */
export const interchainTokenAbi = [
  // ERC20 Standard
  {
    type: "function",
    name: "name",
    inputs: [],
    outputs: [{ type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "symbol",
    inputs: [],
    outputs: [{ type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "decimals",
    inputs: [],
    outputs: [{ type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalSupply",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "allowance",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "approve",
    inputs: [
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "transfer",
    inputs: [
      { name: "to", type: "address" },
      { name: "value", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "transferFrom",
    inputs: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "value", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
    stateMutability: "nonpayable",
  },

  // Axelar InterchainToken - Bridge Methods
  {
    type: "function",
    name: "interchainTokenId",
    inputs: [],
    outputs: [{ type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "interchainTokenService",
    inputs: [],
    outputs: [{ type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "interchainTransfer",
    inputs: [
      { name: "destinationChain", type: "string" },
      { name: "recipient", type: "bytes" },
      { name: "amount", type: "uint256" },
      { name: "metadata", type: "bytes" },
    ],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "interchainTransferFrom",
    inputs: [
      { name: "sender", type: "address" },
      { name: "destinationChain", type: "string" },
      { name: "recipient", type: "bytes" },
      { name: "amount", type: "uint256" },
      { name: "metadata", type: "bytes" },
    ],
    outputs: [],
    stateMutability: "payable",
  },

  // Events
  {
    type: "event",
    name: "Transfer",
    inputs: [
      { name: "from", type: "address", indexed: true },
      { name: "to", type: "address", indexed: true },
      { name: "value", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "Approval",
    inputs: [
      { name: "owner", type: "address", indexed: true },
      { name: "spender", type: "address", indexed: true },
      { name: "value", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "InterchainTransfer",
    inputs: [
      { name: "tokenId", type: "bytes32", indexed: true },
      { name: "sourceAddress", type: "address", indexed: true },
      { name: "destinationChain", type: "string", indexed: false },
      { name: "destinationAddress", type: "bytes", indexed: false },
      { name: "amount", type: "uint256", indexed: false },
      { name: "dataHash", type: "bytes32", indexed: true },
    ],
  },
] as const;

/**
 * Axelar Gas Service ABI - For estimating and paying cross-chain gas
 */
export const axelarGasServiceAbi = [
  {
    type: "function",
    name: "payNativeGasForContractCall",
    inputs: [
      { name: "sender", type: "address" },
      { name: "destinationChain", type: "string" },
      { name: "destinationAddress", type: "string" },
      { name: "payload", type: "bytes" },
      { name: "refundAddress", type: "address" },
    ],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "estimateGasFee",
    inputs: [
      { name: "destinationChain", type: "string" },
      { name: "destinationAddress", type: "string" },
      { name: "payload", type: "bytes" },
      { name: "executionGasLimit", type: "uint256" },
      { name: "params", type: "bytes" },
    ],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
] as const;
