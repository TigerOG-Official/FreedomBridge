import { useQuery } from "@tanstack/react-query";
import { createPublicClient, fallback, http } from "viem";
import { bsc } from "viem/chains";
import defaultRpcs from "../config/default-rpcs.json";
import { useTokenStats } from "./useTokenStats";

// Build fallback transport from configured RPCs (same pattern as the other hooks)
function getTransport(chainId: number) {
  const rpcs = (defaultRpcs as Record<string, string[]>)[String(chainId)];
  if (rpcs && rpcs.length > 0) {
    return fallback(rpcs.map((url) => http(url)));
  }
  return http();
}

// New-style burn contracts that expose totalBurned(). LionOG uses the legacy contract
// with no counter, so we derive its burn total from supply-delta math (see below).
const BURN_CONTRACTS = {
  TigerOG: "0x999775Ae662a176131EB44C6F62d275A24e39d97",
  FrogOG: "0x34b9f2e2d76f850977557a3acdfe6e740d417e4f",
} as const;

const burnAbi = [
  {
    type: "function",
    stateMutability: "view",
    name: "totalBurned",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
] as const;

// Initial mints from launch (Documentation / Wiki — Supply Breakdown tables).
// These are the human-readable values; raw on-chain bigints multiply by 10^decimals.
// All three OG tokens use 9 decimals.
const DECIMALS = 9n;
const SCALE = 10n ** DECIMALS;
const INITIAL_MINT_RAW: Record<string, bigint> = {
  TigerOG: 3_662_233_757_674_602_416_819_986n * SCALE,
  LionOG: 3_832_903_409_282_876_056_519_182n * SCALE,
  FrogOG: 8_385_795_686_123_088_377_024_138n * SCALE,
};

const STALE_TIME = 5 * 60 * 1000; // 5 min
const GC_TIME = 15 * 60 * 1000; // 15 min

export type BurnSource = "counter" | "supplyDelta";

export type TokenBurnStat = {
  symbol: string;
  burned: bigint;
  decimals: number;
  source: BurnSource;
};

export type UseBurnStatsReturn = {
  burns: TokenBurnStat[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
};

export function useBurnStats(): UseBurnStatsReturn {
  // Single BSC multicall reading totalBurned() on TigerOG + FrogOG burn contracts.
  const countersQuery = useQuery({
    queryKey: ["burnCounters"],
    queryFn: async (): Promise<Record<string, bigint>> => {
      const client = createPublicClient({
        chain: bsc,
        transport: getTransport(56),
      });

      const symbols = Object.keys(BURN_CONTRACTS) as Array<keyof typeof BURN_CONTRACTS>;
      const contracts = symbols.map((symbol) => ({
        address: BURN_CONTRACTS[symbol] as `0x${string}`,
        abi: burnAbi,
        functionName: "totalBurned" as const,
      }));

      const results = await client.multicall({ contracts });

      const out: Record<string, bigint> = {};
      symbols.forEach((symbol, i) => {
        const r = results[i];
        out[symbol] = r.status === "success" ? (r.result as bigint) : BigInt(0);
      });
      return out;
    },
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: 1000,
  });

  // LionOG burn is derived: INITIAL_MINT − Σ totalSupply(every chain).
  // useTokenStats already fetches per-chain totalSupply for the distribution bars —
  // we read its raw sum, so no additional RPC calls are needed for LionOG.
  const { stats } = useTokenStats();
  const lionStats = stats.find((s) => s.symbol === "LionOG");
  const lionInitial = INITIAL_MINT_RAW.LionOG;
  // Guard against undercounted supply (e.g. one chain query still loading) producing
  // a falsely-inflated burn figure — only compute once the raw sum is plausibly full.
  const lionRawSupply = lionStats?.totalSupplyRaw ?? BigInt(0);
  const lionBurned =
    lionRawSupply > BigInt(0) && lionInitial > lionRawSupply
      ? lionInitial - lionRawSupply
      : BigInt(0);

  const counters = countersQuery.data ?? {};

  const burns: TokenBurnStat[] = [
    {
      symbol: "TigerOG",
      burned: counters.TigerOG ?? BigInt(0),
      decimals: 9,
      source: "counter",
    },
    {
      symbol: "LionOG",
      burned: lionBurned,
      decimals: 9,
      source: "supplyDelta",
    },
    {
      symbol: "FrogOG",
      burned: counters.FrogOG ?? BigInt(0),
      decimals: 9,
      source: "counter",
    },
  ];

  return {
    burns,
    isLoading: countersQuery.isLoading,
    isError: countersQuery.isError,
    refetch: () => {
      countersQuery.refetch();
    },
  };
}
