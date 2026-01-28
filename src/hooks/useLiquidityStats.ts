import { useQueries } from "@tanstack/react-query";
import { createPublicClient, http, parseAbi } from "viem";
import { bsc, mainnet, base } from "viem/chains";

// Liquidity pools from ContractsPage
const LIQUIDITY_POOLS = [
  // TigerOG
  {
    token: "TigerOG",
    chainId: 56,
    chainName: "BNB Chain",
    dex: "PancakeSwap",
    poolAddress: "0x26ceae47acb9aab7c70b7021e6e5118dd1da1fb3" as `0x${string}`,
    dexUrl: "https://pancakeswap.finance/info/v2/pairs/0x26ceae47acb9aab7c70b7021e6e5118dd1da1fb3",
  },
  {
    token: "TigerOG",
    chainId: 1,
    chainName: "Ethereum",
    dex: "Uniswap",
    poolAddress: "0x0f29973c9117f287177efa54d0feb371cf578885" as `0x${string}`,
    dexUrl: "https://app.uniswap.org/explore/pools/ethereum/0x0f29973c9117f287177efa54d0feb371cf578885",
  },
  {
    token: "TigerOG",
    chainId: 8453,
    chainName: "Base",
    dex: "Uniswap",
    poolAddress: "0x6b9667bf054d3d7f48c411b261e35a0dff3c5d77" as `0x${string}`,
    dexUrl: "https://app.uniswap.org/explore/pools/base/0x6b9667bf054d3d7f48c411b261e35a0dff3c5d77",
  },
  // LionOG
  {
    token: "LionOG",
    chainId: 56,
    chainName: "BNB Chain",
    dex: "PancakeSwap",
    poolAddress: "0xec5c0d52feddd893569bd07ff1fa1b9703b04a7c" as `0x${string}`,
    dexUrl: "https://pancakeswap.finance/info/v2/pairs/0xec5c0d52feddd893569bd07ff1fa1b9703b04a7c",
  },
  {
    token: "LionOG",
    chainId: 1,
    chainName: "Ethereum",
    dex: "Uniswap",
    poolAddress: "0x20f0f72f518026ef8c11401fb12ab0bcae85ce87" as `0x${string}`,
    dexUrl: "https://app.uniswap.org/explore/pools/ethereum/0x20f0f72f518026ef8c11401fb12ab0bcae85ce87",
  },
  {
    token: "LionOG",
    chainId: 8453,
    chainName: "Base",
    dex: "Uniswap",
    poolAddress: "0x5a6d4769463c8aeb188aa45363f999a6f807e9e9" as `0x${string}`,
    dexUrl: "https://app.uniswap.org/explore/pools/base/0x5a6d4769463c8aeb188aa45363f999a6f807e9e9",
  },
  // FrogOG
  {
    token: "FrogOG",
    chainId: 56,
    chainName: "BNB Chain",
    dex: "PancakeSwap",
    poolAddress: "0x575c344853bc3d258b4c2d1e57b93aa26a457350" as `0x${string}`,
    dexUrl: "https://pancakeswap.finance/info/v2/pairs/0x575c344853bc3d258b4c2d1e57b93aa26a457350",
  },
  {
    token: "FrogOG",
    chainId: 1,
    chainName: "Ethereum",
    dex: "Uniswap",
    poolAddress: "0xc92a638a4e29d05caa40a201fb0c92acd83ef805" as `0x${string}`,
    dexUrl: "https://app.uniswap.org/explore/pools/ethereum/0xc92a638a4e29d05caa40a201fb0c92acd83ef805",
  },
  {
    token: "FrogOG",
    chainId: 8453,
    chainName: "Base",
    dex: "Uniswap",
    poolAddress: "0x2524ec2b91a6566a6df0260a8a80989e4b556cb4" as `0x${string}`,
    dexUrl: "https://app.uniswap.org/explore/pools/base/0x2524ec2b91a6566a6df0260a8a80989e4b556cb4",
  },
];

// Map chainId to viem chain object
const CHAIN_MAP: Record<number, typeof bsc> = {
  56: bsc,
  1: mainnet,
  8453: base,
};

// UniswapV2/PancakeSwap pair ABI for getReserves
const pairAbi = parseAbi([
  "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
  "function token0() external view returns (address)",
  "function token1() external view returns (address)",
]);

// Cache settings
const STALE_TIME = 5 * 60 * 1000; // 5 minutes
const GC_TIME = 15 * 60 * 1000; // 15 minutes

export type LiquidityPoolData = {
  token: string;
  chainId: number;
  chainName: string;
  dex: string;
  poolAddress: string;
  dexUrl: string;
  reserve0: bigint;
  reserve1: bigint;
  token0: string;
  token1: string;
};

export type UseLiquidityStatsReturn = {
  pools: LiquidityPoolData[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
};

// Group pools by chain for batched queries
const POOLS_BY_CHAIN = LIQUIDITY_POOLS.reduce((acc, pool) => {
  if (!acc[pool.chainId]) acc[pool.chainId] = [];
  acc[pool.chainId].push(pool);
  return acc;
}, {} as Record<number, typeof LIQUIDITY_POOLS>);

export function useLiquidityStats(): UseLiquidityStatsReturn {
  // Query pools per chain using multicall (batches all pools on same chain)
  const queries = useQueries({
    queries: Object.entries(POOLS_BY_CHAIN).map(([chainIdStr, chainPools]) => {
      const chainId = Number(chainIdStr);
      const chain = CHAIN_MAP[chainId];

      return {
        queryKey: ["liquidityPools", chainId],
        queryFn: async (): Promise<LiquidityPoolData[]> => {
          if (!chain) {
            throw new Error(`Unsupported chain: ${chainId}`);
          }

          const client = createPublicClient({
            chain,
            transport: http(),
          });

          // Build multicall contracts - 3 calls per pool (reserves, token0, token1)
          const contracts = chainPools.flatMap((pool) => [
            { address: pool.poolAddress, abi: pairAbi, functionName: "getReserves" as const },
            { address: pool.poolAddress, abi: pairAbi, functionName: "token0" as const },
            { address: pool.poolAddress, abi: pairAbi, functionName: "token1" as const },
          ]);

          const results = await client.multicall({ contracts });

          // Parse results - every 3 results is one pool
          return chainPools.map((pool, i) => {
            const reservesResult = results[i * 3];
            const token0Result = results[i * 3 + 1];
            const token1Result = results[i * 3 + 2];

            const reserves = reservesResult.status === "success"
              ? (reservesResult.result as [bigint, bigint, number])
              : [BigInt(0), BigInt(0), 0];

            return {
              ...pool,
              reserve0: reserves[0],
              reserve1: reserves[1],
              token0: token0Result.status === "success" ? (token0Result.result as string) : "",
              token1: token1Result.status === "success" ? (token1Result.result as string) : "",
            };
          });
        },
        staleTime: STALE_TIME,
        gcTime: GC_TIME,
        refetchOnWindowFocus: false,
        retry: 2,
        retryDelay: 1000,
      };
    }),
  });

  // Flatten all pools from all chains
  const pools = queries
    .filter((q) => q.isSuccess && q.data)
    .flatMap((q) => q.data!);

  const isLoading = queries.some((q) => q.isLoading);
  const isError = queries.some((q) => q.isError);

  const refetch = () => {
    queries.forEach((q) => q.refetch());
  };

  return {
    pools,
    isLoading,
    isError,
    refetch,
  };
}

// Group pools by token for display
export function groupPoolsByToken(pools: LiquidityPoolData[]): Record<string, LiquidityPoolData[]> {
  return pools.reduce((acc, pool) => {
    if (!acc[pool.token]) {
      acc[pool.token] = [];
    }
    acc[pool.token].push(pool);
    return acc;
  }, {} as Record<string, LiquidityPoolData[]>);
}
