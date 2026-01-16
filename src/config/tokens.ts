export type TokenInfo = {
  symbol: string;
  name: string;
  decimals: number;
  logoUrl?: string;
  isNative?: boolean;
};

export type TokenChainConfig = {
  tokenAddress: `0x${string}`; // Token address on this chain
  axelarChainName: string; // Axelar chain identifier for interchainTransfer
  decimals: number;
  explorer?: string; // Block explorer URL
  isCanonical?: boolean; // True if this is the home/canonical chain
};

export type TokenConfig = {
  token: TokenInfo;
  chains: {
    [chainId: number]: TokenChainConfig;
  };
};

// Axelar mainnet token configurations
export const MAINNET_TOKENS: Record<string, TokenConfig> = {
  LionOG: {
    token: {
      symbol: "LionOG",
      name: "LionOG",
      decimals: 9,
      // logoUrl: "/src/assets/tokens/lionog.png", // TODO: Add token logo
    },
    chains: {
      // BNB Mainnet - Canonical chain
      56: {
        tokenAddress: "0x6731F2d7ADF86cfba30d15c4D10113Ce98f3492A",
        axelarChainName: "binance",
        decimals: 9,
        explorer: "https://bscscan.com",
        isCanonical: true,
      },
      // Ethereum Mainnet
      1: {
        tokenAddress: "0x6731F2d7ADF86cfba30d15c4D10113Ce98f3492A",
        axelarChainName: "Ethereum",
        decimals: 9,
        explorer: "https://etherscan.io",
      },
      // Base Mainnet
      8453: {
        tokenAddress: "0x6731F2d7ADF86cfba30d15c4D10113Ce98f3492A",
        axelarChainName: "base",
        decimals: 9,
        explorer: "https://basescan.org",
      },
      // Linea Mainnet
      59144: {
        tokenAddress: "0x6731F2d7ADF86cfba30d15c4D10113Ce98f3492A",
        axelarChainName: "linea",
        decimals: 9,
        explorer: "https://lineascan.build",
      },
      // XRPL EVM Mainnet
      1440000: {
        tokenAddress: "0x6731F2d7ADF86cfba30d15c4D10113Ce98f3492A",
        axelarChainName: "xrpl-evm",
        decimals: 9,
        explorer: "https://explorer.xrplevm.org",
      },
      // Polygon Mainnet
      137: {
        tokenAddress: "0x6731F2d7ADF86cfba30d15c4D10113Ce98f3492A",
        axelarChainName: "Polygon",
        decimals: 9,
        explorer: "https://polygonscan.com",
      },
      // Avalanche Mainnet
      43114: {
        tokenAddress: "0x6731F2d7ADF86cfba30d15c4D10113Ce98f3492A",
        axelarChainName: "Avalanche",
        decimals: 9,
        explorer: "https://snowtrace.io",
      },
    },
  },
  TigerOG: {
    token: {
      symbol: "TigerOG",
      name: "TigerOG",
      decimals: 9,
    },
    chains: {
      // BNB Mainnet - Canonical chain
      56: {
        tokenAddress: "0xCF7Fc0De71238c9EC45EC2Fd24FDc8521345dbB5",
        axelarChainName: "binance",
        decimals: 9,
        explorer: "https://bscscan.com",
        isCanonical: true,
      },
      // Ethereum Mainnet
      1: {
        tokenAddress: "0xCF7Fc0De71238c9EC45EC2Fd24FDc8521345dbB5",
        axelarChainName: "Ethereum",
        decimals: 9,
        explorer: "https://etherscan.io",
      },
      // Base Mainnet
      8453: {
        tokenAddress: "0xCF7Fc0De71238c9EC45EC2Fd24FDc8521345dbB5",
        axelarChainName: "base",
        decimals: 9,
        explorer: "https://basescan.org",
      },
      // Linea Mainnet
      59144: {
        tokenAddress: "0xCF7Fc0De71238c9EC45EC2Fd24FDc8521345dbB5",
        axelarChainName: "linea",
        decimals: 9,
        explorer: "https://lineascan.build",
      },
      // XRPL EVM Mainnet
      1440000: {
        tokenAddress: "0xCF7Fc0De71238c9EC45EC2Fd24FDc8521345dbB5",
        axelarChainName: "xrpl-evm",
        decimals: 9,
        explorer: "https://explorer.xrplevm.org",
      },
      // Polygon Mainnet
      137: {
        tokenAddress: "0xCF7Fc0De71238c9EC45EC2Fd24FDc8521345dbB5",
        axelarChainName: "Polygon",
        decimals: 9,
        explorer: "https://polygonscan.com",
      },
      // Avalanche Mainnet
      43114: {
        tokenAddress: "0xCF7Fc0De71238c9EC45EC2Fd24FDc8521345dbB5",
        axelarChainName: "Avalanche",
        decimals: 9,
        explorer: "https://snowtrace.io",
      },
    },
  },
  FrogOG: {
    token: {
      symbol: "FrogOG",
      name: "FrogOG",
      decimals: 9,
    },
    chains: {
      // BNB Mainnet - Canonical chain
      56: {
        tokenAddress: "0x0E3b564bdD09348840811C7e1106BbD0e98b5b4f",
        axelarChainName: "binance",
        decimals: 9,
        explorer: "https://bscscan.com",
        isCanonical: true,
      },
      // Ethereum Mainnet
      1: {
        tokenAddress: "0x0E3b564bdD09348840811C7e1106BbD0e98b5b4f",
        axelarChainName: "Ethereum",
        decimals: 9,
        explorer: "https://etherscan.io",
      },
      // Base Mainnet
      8453: {
        tokenAddress: "0x0E3b564bdD09348840811C7e1106BbD0e98b5b4f",
        axelarChainName: "base",
        decimals: 9,
        explorer: "https://basescan.org",
      },
      // Linea Mainnet
      59144: {
        tokenAddress: "0x0E3b564bdD09348840811C7e1106BbD0e98b5b4f",
        axelarChainName: "linea",
        decimals: 9,
        explorer: "https://lineascan.build",
      },
      // XRPL EVM Mainnet
      1440000: {
        tokenAddress: "0x0E3b564bdD09348840811C7e1106BbD0e98b5b4f",
        axelarChainName: "xrpl-evm",
        decimals: 9,
        explorer: "https://explorer.xrplevm.org",
      },
      // Polygon Mainnet
      137: {
        tokenAddress: "0x0E3b564bdD09348840811C7e1106BbD0e98b5b4f",
        axelarChainName: "Polygon",
        decimals: 9,
        explorer: "https://polygonscan.com",
      },
      // Avalanche Mainnet
      43114: {
        tokenAddress: "0x0E3b564bdD09348840811C7e1106BbD0e98b5b4f",
        axelarChainName: "Avalanche",
        decimals: 9,
        explorer: "https://snowtrace.io",
      },
    },
  },
};

// Combined tokens for all environments
export const ALL_TOKENS: Record<string, TokenConfig> = {
  ...MAINNET_TOKENS,
};

// Helper to determine if a chainId is mainnet
export function isMainnetChain(chainId: number): boolean {
  return [1, 56, 8453, 59144, 1440000, 137, 43114].includes(chainId);
}

// Helper to get token config by symbol
export function getTokenConfig(symbol: string): TokenConfig | undefined {
  return MAINNET_TOKENS[symbol];
}

// Helper to get all tokens available on a chain
export function getTokensForChain(chainId: number): Array<{ symbol: string; config: TokenConfig }> {
  const tokens = MAINNET_TOKENS;
  return Object.entries(tokens)
    .filter(([, config]: [string, TokenConfig]) => config.chains[chainId])
    .map(([symbol, config]) => ({ symbol, config }));
}

// Helper to get chain config for a specific token on a chain
export function getTokenOnChain(symbol: string, chainId: number): TokenChainConfig | undefined {
  return ALL_TOKENS[symbol]?.chains[chainId];
}
