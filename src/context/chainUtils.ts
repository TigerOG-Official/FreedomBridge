import { defineChain } from "viem";
import type { Chain } from "viem";
import type { EnvironmentKey } from "./EnvironmentContext";
import defaultRpcsJson from "../config/default-rpcs.json";
import chainsJson from "../config/chains.json";
import { getChainIcon } from "../utils/chainIcons";

// Parse default RPCs - handle both string and array formats (supports failover)
const DEFAULT_PUBLIC_RPCS: Record<number, string[]> = Object.entries(
  defaultRpcsJson as Record<string, string | string[]>
).reduce((acc, [id, url]) => {
  const num = Number(id);
  if (Number.isFinite(num)) {
    acc[num] = Array.isArray(url) ? url : [url];
  }
  return acc;
}, {} as Record<number, string[]>);

// Single RPC for backwards compatibility
const DEFAULT_RPCS: Record<number, string> = {};
for (const [chainId, rpcs] of Object.entries(DEFAULT_PUBLIC_RPCS)) {
  const id = Number(chainId);
  if (Number.isFinite(id) && rpcs.length > 0) {
    DEFAULT_RPCS[id] = rpcs[0];
  }
}

export type ChainConfigOverride = {
  name?: string;
  nativeCurrency?: Chain["nativeCurrency"];
  blockExplorer?: {
    name?: string;
    url: string;
    apiUrl?: string;
  };
};

const RPC_ENV_PREFIX = "VITE_RPC_URL_";
const CHAIN_LABEL_ENV_PREFIX = "VITE_CHAIN_LABEL_";
const CHAIN_CONFIG_PREFIX = "VITE_CHAIN_CONFIG_";
const LEGACY_MAPPING_KEY = "VITE_LEGACY_RPC_MAPPING";

export const ENV_KEYS: EnvironmentKey[] = ["mainnet"];

export type RpcState = Record<EnvironmentKey, Record<number, string>>;

function getEnvValue(key: string): string | undefined {
  const value = (import.meta.env as Record<string, unknown>)[key];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function parseJsonValue<T>(key: string): T | undefined {
  const raw = getEnvValue(key);
  if (!raw) {return undefined;}
  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`Failed to parse JSON for env key ${key}`, error);
    return undefined;
  }
}

function parseEnvChainKey(
  key: string,
  prefix: string,
): { environment: EnvironmentKey; chainId: number } | null {
  if (!key.startsWith(prefix)) {return null;}
  const [environmentSegment, chainSegment] = key.slice(prefix.length).split("_");
  if (!environmentSegment || !chainSegment) {return null;}
  const environment = environmentSegment.toLowerCase() as EnvironmentKey;
  if (!ENV_KEYS.includes(environment)) {return null;}
  const chainId = Number(chainSegment);
  if (!Number.isFinite(chainId)) {return null;}
  return { environment, chainId };
}

function parseLegacyRpcMapping(): Array<{ key: string; environment: EnvironmentKey; chainId: number }> {
  const mappingStr = getEnvValue(LEGACY_MAPPING_KEY);
  if (!mappingStr) {return [];}

  const entries: Array<{ key: string; environment: EnvironmentKey; chainId: number }> = [];
  const parts = mappingStr.split(",");

  for (const part of parts) {
    const [chainIdStr, environment, key] = part.split(":");
    if (!chainIdStr || !environment || !key) {continue;}

    const chainId = Number(chainIdStr);
    if (!Number.isFinite(chainId)) {continue;}

    if (!ENV_KEYS.includes(environment as EnvironmentKey)) {continue;}

    entries.push({
      key,
      environment: environment as EnvironmentKey,
      chainId,
    });
  }

  return entries;
}

export function readRpcEnvOverrides(): RpcState {
  const overrides: RpcState = {
    mainnet: { ...DEFAULT_RPCS }, // Start with default RPCs for mainnet
  };

  // Read new format: VITE_RPC_URL_{ENVIRONMENT}_{CHAINID}
  for (const key of Object.keys(import.meta.env)) {
    if (!key.startsWith(RPC_ENV_PREFIX)) {continue;}
    const value = getEnvValue(key);
    if (!value) {continue;}
    const parsed = parseEnvChainKey(key, RPC_ENV_PREFIX);
    if (!parsed) {continue;}
    overrides[parsed.environment][parsed.chainId] = value;
  }

  // Read legacy format from environment variable configuration
  const legacyMappings = parseLegacyRpcMapping();
  for (const { key, environment, chainId } of legacyMappings) {
    const value = getEnvValue(key);
    if (!value) {continue;}
    overrides[environment][chainId] = value;
  }

  return overrides;
}

export function readChainLabelOverrides(): RpcState {
  const overrides: RpcState = {
    mainnet: {},
  };

  for (const key of Object.keys(import.meta.env)) {
    if (!key.startsWith(CHAIN_LABEL_ENV_PREFIX)) {continue;}
    const value = getEnvValue(key);
    if (!value) {continue;}
    const parsed = parseEnvChainKey(key, CHAIN_LABEL_ENV_PREFIX);
    if (!parsed) {continue;}
    overrides[parsed.environment][parsed.chainId] = value;
  }

  return overrides;
}

export function readChainConfigOverrides(): Record<
  EnvironmentKey,
  Record<number, ChainConfigOverride>
> {
  const overrides: Record<EnvironmentKey, Record<number, ChainConfigOverride>> = {
    mainnet: {},
  };

  for (const key of Object.keys(import.meta.env)) {
    if (!key.startsWith(CHAIN_CONFIG_PREFIX)) {continue;}
    const parsedKey = parseEnvChainKey(key, CHAIN_CONFIG_PREFIX);
    if (!parsedKey) {continue;}
    const config = parseJsonValue<ChainConfigOverride>(key);
    if (!config) {continue;}
    overrides[parsedKey.environment][parsedKey.chainId] = config;
  }

  return overrides;
}

export function buildBlockExplorers(
  override?: ChainConfigOverride["blockExplorer"],
  chainName?: string,
): Chain["blockExplorers"] | undefined {
  if (override?.url) {
    return {
      default: {
        name: override.name ?? `${chainName ?? "Explorer"}`,
        url: override.url,
        apiUrl: override.apiUrl,
      },
    };
  }

  return undefined;
}

export function getChainPreset(
  chainId: number,
  environment: EnvironmentKey,
  rpcUrl: string | undefined,
  chainConfigOverrides: Record<EnvironmentKey, Record<number, ChainConfigOverride>>,
  chainLabelOverrides: RpcState,
  defaultRpcFallback: string,
  defaultRpc: RpcState,
): Chain | null {
  const overrides = chainConfigOverrides[environment]?.[chainId];
  const url = rpcUrl?.trim();
  const envDefault = defaultRpc[environment]?.[chainId];
  const publicRpcs = DEFAULT_PUBLIC_RPCS[chainId] || [];

  // Build array of RPC URLs with priority: explicit env > env default > public RPCs
  const configuredRpcs: string[] = [];
  if (url) {
    configuredRpcs.push(url);
  }
  if (envDefault && envDefault !== url) {
    configuredRpcs.push(envDefault);
  }
  // Add all public RPC fallbacks
  configuredRpcs.push(...publicRpcs.filter(rpc => rpc !== url && rpc !== envDefault));

  if (configuredRpcs.length === 0) {
    console.error(
      `❌ No RPC URL configured for chain ${chainId} in ${environment} environment.\n` +
      `   Please configure one of:\n` +
      `   - VITE_RPC_URL_${environment.toUpperCase()}_${chainId}\n` +
      `   - VITE_CHAIN_CONFIG_${environment.toUpperCase()}_${chainId} (JSON with name, nativeCurrency, blockExplorer)\n` +
      `   - Or add to VITE_LEGACY_RPC_MAPPING`
    );
    return null;
  }

  const name = overrides?.name ?? resolveChainLabel(environment, chainId, chainConfigOverrides, chainLabelOverrides);

  // Try to get nativeCurrency from chains.json config first
  const chainConfig = (chainsJson as Record<string, { name?: string; nativeCurrency?: Chain["nativeCurrency"] }>)[String(chainId)];
  const nativeCurrency = overrides?.nativeCurrency ?? chainConfig?.nativeCurrency ?? {
    name,
    symbol: "NATIVE",
    decimals: 18,
  };
  const blockExplorers = buildBlockExplorers(overrides?.blockExplorer, name);
  const iconUrl = resolveChainIcon(chainId);

  const chain = defineChain({
    id: chainId,
    name,
    nativeCurrency,
    rpcUrls: {
      default: { http: configuredRpcs },
      public: { http: configuredRpcs },
    },
    blockExplorers,
  });

  // Extend with icon properties for RainbowKit compatibility
  return Object.assign(chain, {
    iconUrl,
    iconBackground: "#0b0b13",
  }) as Chain & { iconUrl?: string; iconBackground?: string };
}

function resolveChainIcon(chainId: number): string | undefined {
  return getChainIcon(chainId);
}

function resolveChainLabel(
  environment: EnvironmentKey,
  chainId: number,
  chainConfigOverrides: Record<EnvironmentKey, Record<number, ChainConfigOverride>>,
  chainLabelOverrides: RpcState,
): string {
  const chainNameFromList = (chainsJson as Record<string, { name?: string }>)[String(chainId)]?.name;
  const configName = chainConfigOverrides[environment]?.[chainId]?.name;
  if (configName) {return configName;}
  const override = chainLabelOverrides[environment]?.[chainId];
  if (override) {return override;}
  if (chainNameFromList) {return chainNameFromList;}
  return `Chain ${chainId}`;
}
