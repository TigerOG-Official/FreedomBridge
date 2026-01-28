import { motion } from "motion/react";
import { RefreshCw, Activity, TrendingUp, Droplets, ExternalLink } from "lucide-react";
import { useTokenStats, formatLargeNumber } from "../../hooks/useTokenStats";
import { useLiquidityStats, groupPoolsByToken } from "../../hooks/useLiquidityStats";
import { usePrices, formatUSD } from "../../hooks/usePrices";
import { useTranslation } from "react-i18next";

// Chain icons
import BnbIcon from "../../assets/chain-icons/BNB.png";
import EthereumIcon from "../../assets/chain-icons/Ethereum.png";
import BaseIcon from "../../assets/chain-icons/Base.png";
import LineaIcon from "../../assets/chain-icons/Linea.png";
import XrpevmIcon from "../../assets/chain-icons/Xrpevm.png";
import PolygonIcon from "../../assets/chain-icons/Polygon.png";
import AvalancheIcon from "../../assets/chain-icons/Avalanche.png";

const CHAIN_ICONS: Record<number, string> = {
  56: BnbIcon,
  1: EthereumIcon,
  8453: BaseIcon,
  59144: LineaIcon,
  1440000: XrpevmIcon,
  137: PolygonIcon,
  43114: AvalancheIcon,
};

// Token accent colors
const TOKEN_COLORS: Record<string, string> = {
  TigerOG: "var(--accent-primary)",
  LionOG: "var(--accent-secondary)",
  FrogOG: "var(--accent-signal)",
};

// OG Token addresses (same on all chains) - to identify which reserve is the OG token
const OG_TOKEN_ADDRESSES: Record<string, string> = {
  TigerOG: "0xCF7Fc0De71238c9EC45EC2Fd24FDc8521345dbB5".toLowerCase(),
  LionOG: "0x6731F2d7ADF86cfba30d15c4D10113Ce98f3492A".toLowerCase(),
  FrogOG: "0x0E3b564bdD09348840811C7e1106BbD0e98b5b4f".toLowerCase(),
};

// Format reserve amount (9 decimals for OG tokens)
function formatReserve(reserve: bigint): string {
  const num = Number(reserve) / 1e9; // OG tokens have 9 decimals
  if (num >= 1e21) return `${(num / 1e21).toFixed(2)} sextillion`;
  if (num >= 1e18) return `${(num / 1e18).toFixed(2)} quintillion`;
  if (num >= 1e15) return `${(num / 1e15).toFixed(2)} quadrillion`;
  if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
  return num.toFixed(2);
}

function formatTimeAgo(date: Date | null): string {
  if (!date) return "Never";
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

// Stale time in milliseconds for refresh button
const STALE_TIME = 15 * 60 * 1000; // 15 minutes

export default function StatsSection() {
  const { t } = useTranslation();
  const { stats, isLoading: statsLoading, refetch: refetchStats, lastUpdated } = useTokenStats();
  const { pools, isLoading: poolsLoading, refetch: refetchPools } = useLiquidityStats();
  const { prices, isLoading: pricesLoading, refetch: refetchPrices } = usePrices();

  const isLoading = statsLoading || poolsLoading || pricesLoading;
  const poolsByToken = groupPoolsByToken(pools);

  // Check if data is stale (older than STALE_TIME)
  const isStale = !lastUpdated || (Date.now() - lastUpdated.getTime()) >= STALE_TIME;
  const canRefresh = isStale && !isLoading;

  // Calculate time until refresh is available
  const getTimeUntilRefresh = (): string => {
    if (!lastUpdated || isStale) return "";
    const msRemaining = STALE_TIME - (Date.now() - lastUpdated.getTime());
    const minutes = Math.ceil(msRemaining / 60000);
    return `${minutes}m`;
  };

  // Get price based on chain (BSC uses BNB, others use ETH)
  const getPriceForChain = (chainId: number): number => {
    return chainId === 56 ? prices.BNB : prices.ETH;
  };

  const handleRefresh = () => {
    if (!canRefresh) return;
    refetchStats();
    refetchPools();
    refetchPrices();
  };

  return (
    <section className="relative z-10 max-w-7xl mx-auto px-4 pb-32 w-full">
      {/* Section Header */}
      <div className="mb-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-block mb-4"
        >
          <span className="py-1 px-3 rounded-full bg-[var(--theme-percent-25-bg)] border border-[var(--theme-card-border)] text-[var(--accent-primary)] text-xs font-bold tracking-widest uppercase flex items-center gap-2">
            <Activity className="w-3 h-3" />
            {t('landing.liveStats.badge', 'Live Protocol Stats')}
          </span>
        </motion.div>
        <h2 className="text-4xl md:text-5xl font-bold mb-6 feature-title">
          {t('landing.liveStats.title', 'Token Statistics')}
        </h2>
        <p className="text-lg feature-text max-w-2xl mx-auto font-light">
          {t('landing.liveStats.description', 'Real-time data from the blockchain showing converted supply and distribution across all supported chains.')}
        </p>
      </div>

      {/* Token Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        {stats.map((tokenStat) => (
          <div
            key={tokenStat.symbol}
            className="bento-card p-6 relative overflow-hidden group"
          >
            {/* Accent gradient */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
              style={{
                background: `linear-gradient(135deg, ${TOKEN_COLORS[tokenStat.symbol]}, transparent)`
              }}
            />

            <div className="relative z-10">
              {/* Token header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${TOKEN_COLORS[tokenStat.symbol]}, color-mix(in srgb, ${TOKEN_COLORS[tokenStat.symbol]} 70%, transparent))`,
                      boxShadow: `0 4px 12px color-mix(in srgb, ${TOKEN_COLORS[tokenStat.symbol]} 30%, transparent)`
                    }}
                  >
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold feature-title">{tokenStat.symbol}</h3>
                    <p className="text-xs text-muted-foreground">{t('landing.liveStats.totalConverted', 'Total Converted')}</p>
                  </div>
                </div>
              </div>

              {/* Total supply */}
              <div className="mb-6">
                {isLoading ? (
                  <div className="h-8 w-32 bg-muted/30 animate-pulse rounded" />
                ) : (
                  <p className="text-2xl font-bold feature-title">
                    {formatLargeNumber(tokenStat.totalConverted, tokenStat.decimals)}
                  </p>
                )}
              </div>

              {/* Chain distribution */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  {t('landing.liveStats.distribution', 'Chain Distribution')}
                </p>

                {isLoading ? (
                  <div className="space-y-1.5">
                    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                      <div key={i} className="h-5 bg-muted/20 animate-pulse rounded" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {tokenStat.distribution.map((chain) => (
                      <div key={chain.chainId} className="flex items-center gap-2">
                        <img
                          src={CHAIN_ICONS[chain.chainId]}
                          alt={chain.chainName}
                          className="w-4 h-4 rounded-full"
                        />
                        <span className="text-xs text-muted-foreground flex-1 truncate">
                          {chain.chainName}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-1.5 bg-muted/30 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.min(chain.percentage, 100)}%`,
                                background: TOKEN_COLORS[tokenStat.symbol]
                              }}
                            />
                          </div>
                          <span className="text-xs font-medium w-12 text-right">
                            {chain.percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Liquidity Pools Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="bento-card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="feature-icon-box text-blue-600 dark:text-blue-400 border-blue-500/30 bg-blue-500/10 mb-0">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold feature-title">
                {t('landing.liveStats.liquidityPools', 'Liquidity Pools')}
              </h3>
              <p className="text-xs text-muted-foreground">
                {t('landing.liveStats.liquidityDescription', 'Active trading pools across DEXs')}
              </p>
            </div>
          </div>
        </div>

        {poolsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted/20 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(poolsByToken).map(([token, tokenPools]) => (
              <div
                key={token}
                className="rounded-xl p-4 border border-[var(--theme-card-border)] bg-muted/10"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${TOKEN_COLORS[token]}, color-mix(in srgb, ${TOKEN_COLORS[token]} 70%, transparent))`
                    }}
                  >
                    <Droplets className="w-3 h-3 text-white" />
                  </div>
                  <span className="font-semibold text-sm">{token}</span>
                  <span className="text-xs text-muted-foreground">
                    ({tokenPools.length} {t('landing.liveStats.pools', 'pools')})
                  </span>
                </div>
                <div className="space-y-2">
                  {tokenPools.map((pool) => {
                    // Determine which reserve is the OG token vs base asset
                    const ogAddress = OG_TOKEN_ADDRESSES[token];
                    const isToken0OG = pool.token0.toLowerCase() === ogAddress;
                    const baseReserve = isToken0OG ? pool.reserve1 : pool.reserve0;

                    // Calculate USD value of base asset (WBNB/WETH has 18 decimals)
                    const baseAmount = Number(baseReserve) / 1e18;
                    const price = getPriceForChain(pool.chainId);
                    const usdValue = baseAmount * price;

                    return (
                      <a
                        key={`${pool.chainId}-${pool.poolAddress}`}
                        href={pool.dexUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors group/pool"
                      >
                        <img
                          src={CHAIN_ICONS[pool.chainId]}
                          alt={pool.chainName}
                          className="w-4 h-4 rounded-full"
                        />
                        <span className="flex-1">{pool.dex}</span>
                        <span className="text-[10px] font-medium text-foreground/70">
                          {usdValue > 0 ? formatUSD(usdValue) : "—"}
                        </span>
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover/pool:opacity-100 transition-opacity" />
                      </a>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Last Updated & Refresh */}
      <div className="mt-6 flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <span>
          {t('landing.liveStats.lastUpdated', 'Last updated')}: {formatTimeAgo(lastUpdated)}
        </span>
        <button
          onClick={handleRefresh}
          disabled={!canRefresh}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--theme-card-border)] hover:bg-muted/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title={!canRefresh && !isLoading ? `Available in ${getTimeUntilRefresh()}` : undefined}
        >
          <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          {t('landing.liveStats.refresh', 'Refresh')}
          {!canRefresh && !isLoading && (
            <span className="text-[10px] opacity-70">({getTimeUntilRefresh()})</span>
          )}
        </button>
      </div>
    </section>
  );
}
