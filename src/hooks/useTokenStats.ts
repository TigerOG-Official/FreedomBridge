import { useQueries } from "@tanstack/react-query";
import { createPublicClient, http, erc20Abi } from "viem";
import { bsc, mainnet, base, linea, polygon, avalanche } from "viem/chains";
import { MAINNET_TOKENS } from "../config/tokens";

// Converter contract addresses on BSC - these hold the pre-minted OG tokens
// Actual "converted" = Total Supply - Converter Balance
const CONVERTER_CONTRACTS: Record<string, `0x${string}`> = {
  TigerOG: "0x18b2AeD6Aa6aE20A70be57739F8B5C26706Ff2af",
  LionOG: "0x4272b9EeBde520Dfb9cFc3C16bBfc8d3868b467b",
  FrogOG: "0xbF4b1F662247147afCefecbdEa5590fd103dF1FB",
};

// Define supported chains with their viem chain objects
const SUPPORTED_CHAINS = [
  { id: 56, chain: bsc, name: "BNB Chain" },
  { id: 1, chain: mainnet, name: "Ethereum" },
  { id: 8453, chain: base, name: "Base" },
  { id: 59144, chain: linea, name: "Linea" },
  { id: 137, chain: polygon, name: "Polygon" },
  { id: 43114, chain: avalanche, name: "Avalanche" },
  // XRPL EVM (1440000) needs custom chain definition
];

// Custom chain for XRPL EVM
const xrplEvm = {
  id: 1440000,
  name: "XRPL EVM",
  nativeCurrency: { name: "XRP", symbol: "XRP", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.xrplevm.org"] },
  },
  blockExplorers: {
    default: { name: "XRPL EVM Explorer", url: "https://explorer.xrplevm.org" },
  },
} as const;

// All chains including XRPL EVM
const ALL_CHAINS = [
  ...SUPPORTED_CHAINS,
  { id: 1440000, chain: xrplEvm, name: "XRPL EVM" },
];

// Token symbols we track
const OG_TOKENS = ["TigerOG", "LionOG", "FrogOG"] as const;

// Cache settings
const STALE_TIME = 5 * 60 * 1000; // 5 minutes
const GC_TIME = 15 * 60 * 1000; // 15 minutes

export type TokenSupplyData = {
  symbol: string;
  chainId: number;
  chainName: string;
  totalSupply: bigint;
  decimals: number;
};

export type TokenStats = {
  symbol: string;
  totalConverted: bigint;
  decimals: number;
  distribution: Array<{
    chainId: number;
    chainName: string;
    supply: bigint;
    percentage: number;
  }>;
};

export type UseTokenStatsReturn = {
  stats: TokenStats[];
  isLoading: boolean;
  isError: boolean;
  errors: Error[];
  refetch: () => void;
  lastUpdated: Date | null;
};

export function useTokenStats(): UseTokenStatsReturn {
  // Query all token supplies per chain using multicall (batches requests)
  const queries = useQueries({
    queries: ALL_CHAINS.map((chainInfo) => ({
      queryKey: ["tokenSupplies", chainInfo.id],
      queryFn: async (): Promise<TokenSupplyData[]> => {
        const client = createPublicClient({
          chain: chainInfo.chain,
          transport: http(),
        });

        // Build multicall contracts for all tokens on this chain
        const contracts = OG_TOKENS.map((symbol) => {
          const tokenConfig = MAINNET_TOKENS[symbol];
          const chainConfig = tokenConfig?.chains[chainInfo.id];
          return {
            address: chainConfig?.tokenAddress as `0x${string}`,
            abi: erc20Abi,
            functionName: "totalSupply" as const,
          };
        }).filter((c) => c.address);

        // Try multicall first, fall back to individual calls if multicall isn't available
        let results: Array<{ status: "success" | "failure"; result?: bigint }>;
        try {
          results = await client.multicall({ contracts });
        } catch {
          // Multicall not available on this chain, use individual calls
          results = await Promise.all(
            contracts.map(async (contract) => {
              try {
                const result = await client.readContract({
                  address: contract.address,
                  abi: contract.abi,
                  functionName: contract.functionName,
                });
                return { status: "success" as const, result: result as bigint };
              } catch {
                return { status: "failure" as const };
              }
            })
          );
        }

        return OG_TOKENS.map((symbol, i) => {
          const tokenConfig = MAINNET_TOKENS[symbol];
          const chainConfig = tokenConfig?.chains[chainInfo.id];
          const result = results[i];

          return {
            symbol,
            chainId: chainInfo.id,
            chainName: chainInfo.name,
            totalSupply: result?.status === "success" ? (result.result as bigint) : BigInt(0),
            decimals: chainConfig?.decimals ?? 9,
          };
        });
      },
      staleTime: STALE_TIME,
      gcTime: GC_TIME,
      refetchOnWindowFocus: false,
      retry: 2,
      retryDelay: 1000,
    })),
  });

  // Query converter contract balances on BSC using multicall
  const converterQuery = useQueries({
    queries: [{
      queryKey: ["converterBalances"],
      queryFn: async (): Promise<Record<string, bigint>> => {
        const client = createPublicClient({
          chain: bsc,
          transport: http(),
        });

        const contracts = OG_TOKENS.map((symbol) => {
          const tokenConfig = MAINNET_TOKENS[symbol];
          const bscConfig = tokenConfig?.chains[56];
          return {
            address: bscConfig?.tokenAddress as `0x${string}`,
            abi: erc20Abi,
            functionName: "balanceOf" as const,
            args: [CONVERTER_CONTRACTS[symbol]],
          };
        });

        const results = await client.multicall({ contracts });

        const balances: Record<string, bigint> = {};
        OG_TOKENS.forEach((symbol, i) => {
          const result = results[i];
          balances[symbol] = result.status === "success" ? (result.result as bigint) : BigInt(0);
        });

        return balances;
      },
      staleTime: STALE_TIME,
      gcTime: GC_TIME,
      refetchOnWindowFocus: false,
      retry: 2,
      retryDelay: 1000,
    }],
  });

  // Flatten supply data from all chains
  const allSupplyData = queries
    .filter((q) => q.isSuccess && q.data)
    .flatMap((q) => q.data!);

  // Get converter balances
  const converterBalances = converterQuery[0]?.data ?? {};

  // Aggregate results by token
  const stats: TokenStats[] = OG_TOKENS.map((symbol) => {
    const tokenData = allSupplyData.filter((d) => d.symbol === symbol);
    const converterBalance = converterBalances[symbol] ?? BigInt(0);

    const distribution = tokenData.map((data) => {
      let supply = data.totalSupply;

      // For BSC (chain 56), subtract the converter balance
      // The converter holds pre-minted tokens that haven't been converted yet
      if (data.chainId === 56 && converterBalance > BigInt(0)) {
        supply = supply > converterBalance ? supply - converterBalance : BigInt(0);
      }

      return {
        chainId: data.chainId,
        chainName: data.chainName,
        supply,
        percentage: 0, // Will calculate below
      };
    });

    // Calculate total converted (sum of all chain supplies, with BSC already adjusted)
    const totalConverted = distribution.reduce(
      (sum, d) => sum + d.supply,
      BigInt(0)
    );

    // Calculate percentages
    distribution.forEach((d) => {
      if (totalConverted > BigInt(0)) {
        // Multiply by 10000 for 2 decimal precision, then divide
        d.percentage =
          Number((d.supply * BigInt(10000)) / totalConverted) / 100;
      }
    });

    // Sort by supply (highest first)
    distribution.sort((a, b) => (b.supply > a.supply ? 1 : -1));

    const tokenConfig = MAINNET_TOKENS[symbol];

    return {
      symbol,
      totalConverted,
      decimals: tokenConfig?.token.decimals ?? 9,
      distribution,
    };
  });

  const isLoading = queries.some((q) => q.isLoading) || converterQuery.some((q) => q.isLoading);
  const isError = queries.some((q) => q.isError) || converterQuery.some((q) => q.isError);
  const errors = [
    ...queries.filter((q) => q.error).map((q) => q.error as Error),
    ...converterQuery.filter((q) => q.error).map((q) => q.error as Error),
  ];

  // Find the most recent successful fetch time
  const allQueries = [...queries, ...converterQuery];
  const lastUpdated = allQueries
    .filter((q) => q.dataUpdatedAt > 0)
    .reduce((latest, q) => {
      const date = new Date(q.dataUpdatedAt);
      return !latest || date > latest ? date : latest;
    }, null as Date | null);

  const refetch = () => {
    queries.forEach((q) => q.refetch());
    converterQuery.forEach((q) => q.refetch());
  };

  return {
    stats,
    isLoading,
    isError,
    errors,
    refetch,
    lastUpdated,
  };
}

// Helper to format large numbers with units (e.g., "3.66 septillion")
export function formatLargeNumber(value: bigint, decimals: number): string {
  // Convert to number with proper decimal handling
  const num = Number(value) / Math.pow(10, decimals);

  const units = [
    { value: 1e24, name: "septillion" },
    { value: 1e21, name: "sextillion" },
    { value: 1e18, name: "quintillion" },
    { value: 1e15, name: "quadrillion" },
    { value: 1e12, name: "trillion" },
    { value: 1e9, name: "billion" },
    { value: 1e6, name: "million" },
    { value: 1e3, name: "thousand" },
  ];

  for (const unit of units) {
    if (num >= unit.value) {
      const formatted = (num / unit.value).toFixed(2);
      return `${formatted} ${unit.name}`;
    }
  }

  return num.toFixed(2);
}

// Helper to format supply as compact number
export function formatCompactSupply(value: bigint, decimals: number): string {
  const num = Number(value) / Math.pow(10, decimals);

  if (num >= 1e24) return `${(num / 1e24).toFixed(2)}S`; // Septillion
  if (num >= 1e21) return `${(num / 1e21).toFixed(2)}Sx`; // Sextillion
  if (num >= 1e18) return `${(num / 1e18).toFixed(2)}Q`; // Quintillion
  if (num >= 1e15) return `${(num / 1e15).toFixed(2)}Qa`; // Quadrillion
  if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`; // Trillion
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`; // Billion
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`; // Million
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`; // Thousand

  return num.toFixed(2);
}
