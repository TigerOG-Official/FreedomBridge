import { useQueries } from "@tanstack/react-query";
import { createPublicClient, http, parseAbi } from "viem";
import { bsc, mainnet, base } from "viem/chains";

// Chainlink Price Feed addresses
const PRICE_FEEDS = {
  // BNB/USD on BSC
  BNB: {
    chainId: 56,
    chain: bsc,
    address: "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE" as `0x${string}`,
  },
  // ETH/USD on Ethereum
  ETH: {
    chainId: 1,
    chain: mainnet,
    address: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419" as `0x${string}`,
  },
  // ETH/USD on Base (for Base pools)
  ETH_BASE: {
    chainId: 8453,
    chain: base,
    address: "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70" as `0x${string}`,
  },
};

// Chainlink Aggregator V3 ABI (minimal)
const chainlinkAbi = parseAbi([
  "function latestAnswer() external view returns (int256)",
]);

// Cache settings
const STALE_TIME = 5 * 60 * 1000; // 5 minutes
const GC_TIME = 15 * 60 * 1000; // 15 minutes

export type PriceData = {
  BNB: number;
  ETH: number;
};

export type UsePricesReturn = {
  prices: PriceData;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
};

export function usePrices(): UsePricesReturn {
  const queries = useQueries({
    queries: [
      {
        queryKey: ["chainlinkPrice", "BNB"],
        queryFn: async (): Promise<number> => {
          const client = createPublicClient({
            chain: PRICE_FEEDS.BNB.chain,
            transport: http(),
          });

          const result = await client.readContract({
            address: PRICE_FEEDS.BNB.address,
            abi: chainlinkAbi,
            functionName: "latestAnswer",
          });

          // Chainlink returns price with 8 decimals
          return Number(result) / 1e8;
        },
        staleTime: STALE_TIME,
        gcTime: GC_TIME,
        refetchOnWindowFocus: false,
        retry: 2,
      },
      {
        queryKey: ["chainlinkPrice", "ETH"],
        queryFn: async (): Promise<number> => {
          const client = createPublicClient({
            chain: PRICE_FEEDS.ETH.chain,
            transport: http(),
          });

          const result = await client.readContract({
            address: PRICE_FEEDS.ETH.address,
            abi: chainlinkAbi,
            functionName: "latestAnswer",
          });

          // Chainlink returns price with 8 decimals
          return Number(result) / 1e8;
        },
        staleTime: STALE_TIME,
        gcTime: GC_TIME,
        refetchOnWindowFocus: false,
        retry: 2,
      },
    ],
  });

  const [bnbQuery, ethQuery] = queries;

  const prices: PriceData = {
    BNB: bnbQuery.data ?? 0,
    ETH: ethQuery.data ?? 0,
  };

  const isLoading = queries.some((q) => q.isLoading);
  const isError = queries.some((q) => q.isError);

  const refetch = () => {
    queries.forEach((q) => q.refetch());
  };

  return {
    prices,
    isLoading,
    isError,
    refetch,
  };
}

// Helper to format USD value
export function formatUSD(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(2)}K`;
  }
  if (value >= 1) {
    return `$${value.toFixed(2)}`;
  }
  return `$${value.toFixed(4)}`;
}
