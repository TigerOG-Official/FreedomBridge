import { useQueries } from "@tanstack/react-query";
import { createPublicClient, http, fallback, parseAbi } from "viem";
import { bsc, mainnet } from "viem/chains";
import defaultRpcs from "../config/default-rpcs.json";

// Build fallback transport from configured RPCs
function getTransport(chainId: number) {
  const rpcs = (defaultRpcs as Record<string, string[]>)[String(chainId)];
  if (rpcs && rpcs.length > 0) {
    return fallback(rpcs.map((url) => http(url)));
  }
  return http();
}

// Chainlink Price Feed addresses (all on their native chains)
const PRICE_FEEDS = {
  // BNB/USD on BSC
  BNB: {
    chainId: 56,
    chain: bsc,
    address: "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE" as `0x${string}`,
  },
  // ETH/USD on Ethereum (also used for Base and Linea)
  ETH: {
    chainId: 1,
    chain: mainnet,
    address: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419" as `0x${string}`,
  },
  // MATIC/USD on BSC (Chainlink feed)
  MATIC: {
    chainId: 56,
    chain: bsc,
    address: "0x7CA57b0cA6367191c94C8914d7Df09A57655905f" as `0x${string}`,
  },
  // AVAX/USD on BSC (Chainlink feed)
  AVAX: {
    chainId: 56,
    chain: bsc,
    address: "0x5974855ce31EE8E1fff2e76591CbF83D7110F151" as `0x${string}`,
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
  MATIC: number;
  AVAX: number;
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
        // Batch BNB, MATIC, AVAX prices via BSC multicall
        queryKey: ["chainlinkPrices", "bsc"],
        queryFn: async (): Promise<{ BNB: number; MATIC: number; AVAX: number }> => {
          const client = createPublicClient({
            chain: bsc,
            transport: getTransport(56),
          });

          const results = await client.multicall({
            contracts: [
              { address: PRICE_FEEDS.BNB.address, abi: chainlinkAbi, functionName: "latestAnswer" },
              { address: PRICE_FEEDS.MATIC.address, abi: chainlinkAbi, functionName: "latestAnswer" },
              { address: PRICE_FEEDS.AVAX.address, abi: chainlinkAbi, functionName: "latestAnswer" },
            ],
          });

          return {
            BNB: results[0].status === "success" ? Number(results[0].result) / 1e8 : 0,
            MATIC: results[1].status === "success" ? Number(results[1].result) / 1e8 : 0,
            AVAX: results[2].status === "success" ? Number(results[2].result) / 1e8 : 0,
          };
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
            chain: mainnet,
            transport: getTransport(1),
          });

          const result = await client.readContract({
            address: PRICE_FEEDS.ETH.address,
            abi: chainlinkAbi,
            functionName: "latestAnswer",
          });

          return Number(result) / 1e8;
        },
        staleTime: STALE_TIME,
        gcTime: GC_TIME,
        refetchOnWindowFocus: false,
        retry: 2,
      },
    ],
  });

  const [bscQuery, ethQuery] = queries;

  const prices: PriceData = {
    BNB: bscQuery.data?.BNB ?? 0,
    ETH: ethQuery.data ?? 0,
    MATIC: bscQuery.data?.MATIC ?? 0,
    AVAX: bscQuery.data?.AVAX ?? 0,
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
