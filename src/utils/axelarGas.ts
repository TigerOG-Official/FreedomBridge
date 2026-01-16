/**
 * Axelar Gas Estimation for Interchain Token Service
 * Uses the Axelarscan API to get accurate gas estimates
 */

const AXELAR_API_URL = "https://api.gmp.axelarscan.io";

// Map chain IDs to Axelar chain names
const CHAIN_ID_TO_AXELAR_NAME: Record<number, string> = {
  1: "ethereum",
  56: "binance",
  8453: "base",
  59144: "linea",
  1440000: "xrpl-evm",
  137: "polygon",
  43114: "avalanche",
};

// Map chain IDs to native token symbols
const CHAIN_ID_TO_GAS_TOKEN: Record<number, string> = {
  1: "ETH",
  56: "BNB",
  8453: "ETH",
  59144: "ETH",
  1440000: "XRP",
  137: "POL",
  43114: "AVAX",
};

export type GasEstimate = {
  fee: string; // Fee in wei/smallest unit
  feeFormatted: string; // Human readable fee
  symbol: string; // Native token symbol
  isLoading: boolean;
  error: string | null;
};

/**
 * Estimate gas fee for an ITS interchain transfer
 */
export async function estimateITSGasFee(
  sourceChainId: number,
  destinationChainId: number,
  gasMultiplier: number = 1.1
): Promise<{ fee: bigint; feeFormatted: string; symbol: string }> {
  const sourceChain = CHAIN_ID_TO_AXELAR_NAME[sourceChainId];
  const destinationChain = CHAIN_ID_TO_AXELAR_NAME[destinationChainId];
  const symbol = CHAIN_ID_TO_GAS_TOKEN[sourceChainId] || "ETH";

  if (!sourceChain || !destinationChain) {
    throw new Error(`Unsupported chain: ${sourceChainId} or ${destinationChainId}`);
  }

  const params = new URLSearchParams({
    sourceChain,
    destinationChain,
    gasMultiplier: gasMultiplier.toString(),
    showDetailedFees: "true",
  });

  const response = await fetch(`${AXELAR_API_URL}/estimateITSFee?${params}`);

  if (!response.ok) {
    throw new Error(`Failed to estimate gas: ${response.statusText}`);
  }

  const data = await response.json();

  // The API returns the fee in the source chain's native token (in wei)
  const feeWei = data.fee || data.baseFee || "0";
  const fee = BigInt(feeWei);

  // Format for display (18 decimals for most chains)
  const feeFormatted = formatGasFee(fee, 18);

  return { fee, feeFormatted, symbol };
}

/**
 * Format gas fee for display
 */
function formatGasFee(fee: bigint, decimals: number): string {
  const divisor = BigInt(10 ** decimals);
  const whole = fee / divisor;
  const remainder = fee % divisor;

  // Get first 6 significant decimal places
  const decimalStr = remainder.toString().padStart(decimals, "0").slice(0, 6);

  // Trim trailing zeros
  const trimmed = decimalStr.replace(/0+$/, "") || "0";

  if (whole === 0n && fee > 0n) {
    return `0.${decimalStr.slice(0, 4)}`;
  }

  return `${whole}.${trimmed}`;
}

/**
 * Get Axelar chain name from chain ID
 */
export function getAxelarChainName(chainId: number): string | undefined {
  return CHAIN_ID_TO_AXELAR_NAME[chainId];
}

/**
 * Get native gas token symbol for a chain
 */
export function getGasTokenSymbol(chainId: number): string {
  return CHAIN_ID_TO_GAS_TOKEN[chainId] || "ETH";
}
