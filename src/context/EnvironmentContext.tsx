import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import type { Chain } from "viem";
import {
  MAINNET_TOKENS,
  type TokenConfig,
  type TokenChainConfig,
  type TokenInfo,
} from "../config/tokens";
import {
  readRpcEnvOverrides,
  readChainLabelOverrides,
  readChainConfigOverrides,
  getChainPreset,
  type RpcState,
} from "./chainUtils";
import chainsJson from "../config/chains.json";

export type EnvironmentKey = "mainnet";

export type ChainMetadata = {
  chain: Chain;
  axelarChainName: string;
  explorer?: string;
};

const LOCAL_RPC_FALLBACK_KEY = "VITE_RPC_URL_LOCAL_FALLBACK";
function getEnvValue(key: string): string | undefined {
  const value = (import.meta.env as Record<string, unknown>)[key];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

const DEFAULT_LOCAL_RPC_FALLBACK = getEnvValue(LOCAL_RPC_FALLBACK_KEY) ?? "";

// Read all RPC configurations from environment variables
const DEFAULT_RPC: RpcState = readRpcEnvOverrides();
const CHAIN_CONFIG_OVERRIDES = readChainConfigOverrides();
const CHAIN_LABEL_OVERRIDES = readChainLabelOverrides();

const STORAGE_ENV_KEY = "freedom-bridge:env";
const STORAGE_RPC_KEY = "freedom-bridge:rpc";

export type EnvironmentContextValue = {
  environment: EnvironmentKey;
  chainMetadata: Record<number, ChainMetadata>;
  availableChains: Record<number, Chain>;
  chainOptions: Array<{ chainId: number; name: string }>;
  tokens: Record<string, TokenConfig>;
  getTokenOnChain: (symbol: string, chainId: number) => (TokenInfo & TokenChainConfig) | null;
  getTokensForChain: (chainId: number) => Array<{ symbol: string; token: TokenInfo }>;
  rpcConfig: Record<number, string>;
  updateRpcConfig: (chainId: number, url: string) => void;
};

const EnvironmentContext = createContext<EnvironmentContextValue | undefined>(undefined);

function loadRpcState(): RpcState {
  if (typeof window === "undefined") {
    return { ...DEFAULT_RPC };
  }
  try {
    const raw = window.sessionStorage.getItem(STORAGE_RPC_KEY);
    if (!raw) {
      return { ...DEFAULT_RPC };
    }
    const parsed = JSON.parse(raw) as Partial<RpcState>;
    const merged: RpcState = {
      mainnet: { ...DEFAULT_RPC.mainnet, ...(parsed.mainnet ?? {}) },
    };
    return merged;
  } catch (error) {
    console.warn("Failed to parse RPC settings", error);
    return { ...DEFAULT_RPC };
  }
}

function mergeRpcDefaults(state: RpcState, environment: EnvironmentKey): Record<number, string> {
  return { ...DEFAULT_RPC[environment], ...state[environment] };
}

function buildAvailableChains(
  environment: EnvironmentKey,
  rpcConfig: Record<number, string>,
): Record<number, Chain> {
  // Only allow chains defined in chains.json
  const chainIds = new Set<number>(
    Object.keys(chainsJson)
      .map((id) => Number(id))
      .filter((id) => Number.isFinite(id))
  );

  const chains: Record<number, Chain> = {};
  for (const chainId of chainIds) {
    const chain = getChainPreset(
      chainId,
      environment,
      rpcConfig[chainId],
      CHAIN_CONFIG_OVERRIDES,
      CHAIN_LABEL_OVERRIDES,
      DEFAULT_LOCAL_RPC_FALLBACK,
      DEFAULT_RPC,
    );
    if (chain) {
      chains[chainId] = chain;
    }
  }
  return chains;
}

function extractChainMetadata(
  tokens: Record<string, TokenConfig>,
  chainLookup: Record<number, Chain>,
): Record<number, ChainMetadata> {
  const metadata: Record<number, ChainMetadata> = {};

  for (const token of Object.values(tokens)) {
    for (const [chainIdStr, chainConfig] of Object.entries(token.chains)) {
      const chainId = Number(chainIdStr);
      if (!Number.isFinite(chainId) || metadata[chainId]) continue;
      const chain = chainLookup[chainId];
      if (!chain) continue;
      metadata[chainId] = {
        chain,
        axelarChainName: chainConfig.axelarChainName,
        explorer: chainConfig.explorer,
      };
    }
  }

  return metadata;
}

export const EnvironmentProvider = ({ children }: { children: ReactNode }) => {
  const [environment] = useState<EnvironmentKey>("mainnet");
  const [rpcState, setRpcState] = useState<RpcState>(loadRpcState);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(STORAGE_RPC_KEY, JSON.stringify(rpcState));
    }
  }, [rpcState]);

  // Use mainnet tokens
  const tokens = MAINNET_TOKENS;

  const rpcConfig = useMemo(() => mergeRpcDefaults(rpcState, environment), [rpcState, environment]);

  const availableChains = useMemo(
    () => buildAvailableChains(environment, rpcConfig),
    [environment, rpcConfig],
  );

  const chainMetadata = useMemo(
    () => extractChainMetadata(tokens, availableChains),
    [tokens, availableChains],
  );

  const chainOptions = useMemo(() => {
    const ids = new Set<number>(Object.keys(availableChains).map(Number).filter(Number.isFinite));

    const sortedIds = Array.from(ids).sort((a, b) => a - b);

    return sortedIds.map((chainId) => {
      const chain = availableChains[chainId];
      return {
        chainId,
        name: chain?.name ?? `Chain ${chainId}`,
      };
    });
  }, [availableChains]);

  const updateRpcConfig = (chainId: number, url: string) => {
    setRpcState((prev) => ({
      ...prev,
      [environment]: {
        ...(prev[environment] ?? {}),
        [chainId]: url,
      },
    }));
  };

  const getTokenOnChain = (symbol: string, chainId: number) => {
    const token = tokens[symbol];
    if (!token) return null;
    const chainConfig = token.chains[chainId];
    if (!chainConfig) return null;
    return {
      ...token.token,
      ...chainConfig,
    };
  };

  const getTokensForChain = (chainId: number) =>
    Object.entries(tokens)
      .filter(([, config]) => Boolean(config.chains[chainId]))
      .map(([symbol, config]) => ({ symbol, token: config.token }));

  const value: EnvironmentContextValue = {
    environment,
    chainMetadata,
    availableChains,
    chainOptions,
    tokens,
    getTokenOnChain,
    getTokensForChain,
    rpcConfig,
    updateRpcConfig,
  };

  return <EnvironmentContext.Provider value={value}>{children}</EnvironmentContext.Provider>;
};

export function useEnvironment(): EnvironmentContextValue {
  const context = useContext(EnvironmentContext);
  if (!context) {
    throw new Error("useEnvironment must be used within an EnvironmentProvider");
  }
  return context;
}
