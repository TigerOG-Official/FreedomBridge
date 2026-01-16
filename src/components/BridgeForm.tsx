import { useEffect, useMemo, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { NumberInput } from "./NumberInput";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowDown, Loader2, CheckCircle, ExternalLink } from "lucide-react";
import { useAccount, useChainId, usePublicClient, useSwitchChain, useWalletClient } from "wagmi";
import { formatUnits, parseUnits } from "viem";
import { interchainTokenAbi } from "../abi/interchainToken";
import { erc20Abi } from "../utils/erc20Abi";
import { useEnvironment, ChainMetadata } from "../context/EnvironmentContext";
import { formatLargeNumber, formatInputWithCommas } from "../utils/numberFormat";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import WalletIcon from "./icons/WalletIcon";
import { getChainIcon } from "../utils/chainIcons";
import { extractErrorMessage } from "../utils/errors";
import { estimateITSGasFee, getGasTokenSymbol } from "../utils/axelarGas";
import { useTransactionHistory, formatRelativeTime } from "../hooks/useTransactionHistory";
import { Clock, Trash2 } from "lucide-react";

const AXELARSCAN_BASE_URL = "https://axelarscan.io/gmp";

// Estimated transfer times based on source chain finality + Axelar processing
const CHAIN_TRANSFER_TIMES: Record<number, string> = {
  1: "15-20 min",      // Ethereum - ~12-15 min finality
  56: "2-4 min",       // BSC - fast finality
  8453: "3-5 min",     // Base - L2 with fast finality
  59144: "3-5 min",    // Linea - L2 with fast finality
  137: "3-5 min",      // Polygon - fast finality
  43114: "2-3 min",    // Avalanche - near instant finality
  1440000: "3-5 min",  // XRPL EVM
};

const BridgeForm = () => {
  const { t } = useTranslation();
  const chainId = useChainId();
  const { address, isConnected } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { chainMetadata, getTokenOnChain, getTokensForChain, tokens } = useEnvironment();
  const [selectedToken, setSelectedToken] = useState<string>("");
  const [sourceChainId, setSourceChainId] = useState<number | undefined>(undefined);
  const [destinationChainId, setDestinationChainId] = useState<number | undefined>(undefined);
  const [amount, setAmount] = useState("");
  const [sending, setSending] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tokenBalance, setTokenBalance] = useState<bigint>(0n);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [destinationTokenBalance, setDestinationTokenBalance] = useState<bigint>(0n);
  const [destinationBalanceLoading, setDestinationBalanceLoading] = useState(false);
  const [refreshBalanceCounter, setRefreshBalanceCounter] = useState(0);
  const [addingDestinationToken, setAddingDestinationToken] = useState(false);
  const [sourceChainSearchTerm, setSourceChainSearchTerm] = useState("");
  const [destinationChainSearchTerm, setDestinationChainSearchTerm] = useState("");
  const [sourceOpen, setSourceOpen] = useState(false);
  const [destinationOpen, setDestinationOpen] = useState(false);
  const lastTxAmountRef = useRef<string>("");

  // Dynamic gas estimation from Axelar API
  const [gasEstimate, setGasEstimate] = useState<string>("0");
  const [gasEstimateWei, setGasEstimateWei] = useState<bigint>(0n);
  const [gasLoading, setGasLoading] = useState(false);
  const [gasSymbol, setGasSymbol] = useState<string>("BNB");

  // Transaction history
  const { transactions, addTransaction, clearHistory } = useTransactionHistory(address);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (chainId && chainMetadata[chainId]) {
      setSourceChainId(chainId);
    }
  }, [chainId, chainMetadata]);

  useEffect(() => {
    setTxHash(null);
    setAmount("");
    lastTxAmountRef.current = "";
  }, [sourceChainId, destinationChainId, selectedToken]);

  // Fetch gas estimate when chains change
  useEffect(() => {
    if (!sourceChainId || !destinationChainId) {
      setGasEstimate("0");
      setGasEstimateWei(0n);
      return;
    }

    let cancelled = false;
    const fetchGasEstimate = async () => {
      setGasLoading(true);
      try {
        const { fee, feeFormatted, symbol } = await estimateITSGasFee(
          sourceChainId,
          destinationChainId,
          1.1 // 10% buffer for gas price fluctuations
        );
        if (!cancelled) {
          setGasEstimateWei(fee);
          setGasEstimate(feeFormatted);
          setGasSymbol(symbol);
        }
      } catch (err) {
        console.error("Failed to estimate gas:", err);
        if (!cancelled) {
          // Fallback to conservative estimate
          const fallbackSymbol = getGasTokenSymbol(sourceChainId);
          setGasEstimate("0.005");
          setGasEstimateWei(parseUnits("0.005", 18));
          setGasSymbol(fallbackSymbol);
        }
      } finally {
        if (!cancelled) setGasLoading(false);
      }
    };

    fetchGasEstimate();
    return () => { cancelled = true; };
  }, [sourceChainId, destinationChainId]);

  const sourceChainMeta = sourceChainId ? chainMetadata[sourceChainId] : undefined;
  const destinationChainMeta = destinationChainId ? chainMetadata[destinationChainId] : undefined;
  const sourceTokenConfig =
    selectedToken && sourceChainId ? getTokenOnChain(selectedToken, sourceChainId) : undefined;
  const destinationTokenConfig =
    selectedToken && destinationChainId ? getTokenOnChain(selectedToken, destinationChainId) : undefined;

  const availableTokens = useMemo(() => {
    if (!sourceChainId) {return [];}
    const tokenOrder = ['TigerOG', 'LionOG', 'FrogOG'];
    return getTokensForChain(sourceChainId).filter(({ symbol }) => {
      const config = getTokenOnChain(symbol, sourceChainId);
      if (!config) {return false;}

      const entry = tokens[symbol];
      if (!entry) {return false;}
      return Object.entries(entry.chains).some(([chainKey]) => {
        const targetChainId = Number(chainKey);
        return Number.isFinite(targetChainId) && targetChainId !== sourceChainId;
      });
    }).sort((a, b) => {
      const aIndex = tokenOrder.indexOf(a.symbol);
      const bIndex = tokenOrder.indexOf(b.symbol);
      if (aIndex === -1 && bIndex === -1) return a.symbol.localeCompare(b.symbol);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
  }, [sourceChainId, getTokensForChain, getTokenOnChain, tokens]);

  useEffect(() => {
    if (availableTokens.length > 0 && !availableTokens.some(({ symbol }) => symbol === selectedToken)) {
      setSelectedToken(availableTokens[0]!.symbol);
    }
  }, [availableTokens, selectedToken]);

  const destinationOptions = useMemo(() => {
    if (!selectedToken) {return [] as ChainMetadata[];}
    return Object.values(chainMetadata).filter((meta) => {
      if (meta.chain.id === sourceChainId) {return false;}
      const config = getTokenOnChain(selectedToken, meta.chain.id);
      return Boolean(config);
    });
  }, [chainMetadata, selectedToken, sourceChainId, getTokenOnChain]);

  useEffect(() => {
    if (destinationOptions.length > 0 && !destinationOptions.some((meta) => meta.chain.id === destinationChainId)) {
      setDestinationChainId(destinationOptions[0]!.chain.id);
    }
  }, [destinationOptions, destinationChainId]);

  const publicClient = usePublicClient({ chainId: sourceChainId });
  const { data: walletClient } = useWalletClient();

  const amountBigInt = useMemo(() => {
    if (!sourceTokenConfig) {return 0n;}
    try {
      return parseUnits(amount || "0", sourceTokenConfig.decimals);
    } catch {
      return 0n;
    }
  }, [amount, sourceTokenConfig]);

  useEffect(() => {
    if (!publicClient || !address || !sourceTokenConfig || !sourceChainId || chainId !== sourceChainId) {
      setTokenBalance(0n);
      return;
    }

    let cancelled = false;
    const fetchBalance = async () => {
      setBalanceLoading(true);
      try {
        const balance = await publicClient.readContract({ 
            address: sourceTokenConfig.tokenAddress, 
            abi: erc20Abi, 
            functionName: "balanceOf", 
            args: [address] 
        }) as bigint;
        if (!cancelled) {setTokenBalance(balance);}
      } catch {
        if (!cancelled) {setTokenBalance(0n);}
      } finally {
        if (!cancelled) {setBalanceLoading(false);}
      }
    };

    fetchBalance();
    return () => { cancelled = true; };
  }, [
    publicClient,
    address,
    sourceChainId,
    chainId,
    sourceTokenConfig?.tokenAddress,
    refreshBalanceCounter,
  ]);

  const destinationPublicClient = usePublicClient({ chainId: destinationChainId });

  useEffect(() => {
    if (!destinationPublicClient || !address || !destinationTokenConfig || !destinationChainId) {
      setDestinationTokenBalance(0n);
      return;
    }

    let cancelled = false;
    const fetchDestinationBalance = async () => {
      setDestinationBalanceLoading(true);
      try {
        const balance = await destinationPublicClient.readContract({ 
            address: destinationTokenConfig.tokenAddress, 
            abi: erc20Abi, 
            functionName: "balanceOf", 
            args: [address] 
        }) as bigint;
        if (!cancelled) {setDestinationTokenBalance(balance);}
      } catch {
        if (!cancelled) {setDestinationTokenBalance(0n);}
      } finally {
        if (!cancelled) {setDestinationBalanceLoading(false);}
      }
    };

    fetchDestinationBalance();
    return () => { cancelled = true; };
  }, [
    destinationPublicClient,
    address,
    destinationChainId,
    destinationTokenConfig?.tokenAddress,
    refreshBalanceCounter,
  ]);

  const handleSwitchSource = async (targetChainId: number) => {
    if (switchChainAsync) {
      try {
        await switchChainAsync({ chainId: targetChainId });
      } catch {
        setError(t('common.failedToSwitchNetwork'));
      }
    }
  };

  const handleSwap = () => {
    if (sourceChainId && destinationChainId) {
      const newSource = destinationChainId;
      const newDest = sourceChainId;
      setSourceChainId(newSource);
      setDestinationChainId(newDest);
      handleSwitchSource(newSource);
    }
  };

  const submitBridge = async () => {
    if (!publicClient || !walletClient || !sourceTokenConfig || !destinationTokenConfig || !address || amountBigInt === 0n) {return;}
    if (exceedsBalance) {
      setError(t('common.insufficientBalance'));
      return;
    }
    setError(null);
    setTxHash(null);
    setSending(true);

    try {
      // Use raw address bytes (20 bytes), not ABI-encoded (32 bytes)
      const recipientBytes = address as `0x${string}`;

      const gasValue = gasEstimateWei > 0n ? gasEstimateWei : parseUnits("0.005", 18);

      const txHash = await walletClient.writeContract({
        address: sourceTokenConfig.tokenAddress,
        abi: interchainTokenAbi,
        functionName: "interchainTransfer",
        args: [
          destinationTokenConfig.axelarChainName,
          recipientBytes,
          amountBigInt,
          "0x", // empty metadata
        ],
        value: gasValue,
      });

      await publicClient.waitForTransactionReceipt({ hash: txHash });
      lastTxAmountRef.current = amount;
      setTxHash(txHash);
      setRefreshBalanceCounter((c) => c + 1);

      // Save to transaction history
      if (sourceChainId && destinationChainId && sourceChainMeta && destinationChainMeta) {
        addTransaction({
          txHash,
          sourceChainId,
          sourceChainName: sourceChainMeta.chain.name,
          destChainId: destinationChainId,
          destChainName: destinationChainMeta.chain.name,
          tokenSymbol: selectedToken,
          amount,
          axelarscanUrl: `${AXELARSCAN_BASE_URL}/${txHash}`,
        });
      }
    } catch (sendError: unknown) {
      setError(extractErrorMessage(sendError) ?? t('common.bridgeTxFailed'));
    } finally {
      setSending(false);
    }
  };

  const setPercentageAmount = (percentage: number) => {
    if (tokenBalance > 0n && sourceTokenConfig) {
      const percentageBalance = (tokenBalance * BigInt(percentage)) / 100n;
      setAmount(formatUnits(percentageBalance, sourceTokenConfig.decimals));
    }
  };

  const addDestinationTokenToWallet = async () => {
    if (!walletClient || !destinationTokenConfig?.tokenAddress || !destinationChainId) {return;}
    try {
      setAddingDestinationToken(true);
      const originalChainId = chainId;
      if (switchChainAsync && chainId !== destinationChainId) {
        await switchChainAsync({ chainId: destinationChainId });
      }
      await walletClient.watchAsset({
        type: "ERC20",
        options: {
          address: destinationTokenConfig.tokenAddress,
          decimals: destinationTokenConfig.decimals,
          symbol: destinationDisplaySymbol,
        },
      });
      if (switchChainAsync && originalChainId && originalChainId !== destinationChainId) {
        await switchChainAsync({ chainId: originalChainId });
      }
    } catch (err) {
      setError(extractErrorMessage(err) ?? t('bridge.addTokenError'));
    } finally {
      setAddingDestinationToken(false);
    }
  };

  const sourceDisplaySymbol = sourceTokenConfig?.symbol ?? selectedToken;
  const destinationDisplaySymbol = destinationTokenConfig?.symbol ?? selectedToken;
  const sourceExplorerUrl = sourceChainMeta?.chain.blockExplorers?.default.url;
  const axelarscanUrl = txHash ? `${AXELARSCAN_BASE_URL}/${txHash}` : null;

  const balanceDecimals = sourceTokenConfig?.decimals ?? 18;
  const balanceValue = formatUnits(tokenBalance, balanceDecimals);
  const balanceFormatted = formatLargeNumber(balanceValue);

  const destinationBalanceDecimals = destinationTokenConfig?.decimals ?? 18;
  const destinationBalanceValue = formatUnits(destinationTokenBalance, destinationBalanceDecimals);
  const destinationBalanceFormatted = formatLargeNumber(destinationBalanceValue);

  const amountDisplayValue = amount.length > 0 ? amount : '0';
  const amountFormatted = formatLargeNumber(amountDisplayValue);

  const totalRequired = amountBigInt;
  const exceedsBalance = totalRequired > tokenBalance;
  const amountChangedSinceLastTx = txHash && amount !== lastTxAmountRef.current;
  const canSubmit =
    isConnected &&
    sourceTokenConfig &&
    destinationTokenConfig &&
    amountBigInt > 0n &&
    !sending &&
    (!txHash || amountChangedSinceLastTx) &&
    !exceedsBalance;

  return (
    <div className="bridge-form-container">
      {/* Source Card */}
      <div className="asset-panel">
        <div className="asset-panel-header">
          <span className="asset-panel-label">{t('bridge.fromChain')}</span>
          <div className="chain-selector-wrapper">
            <Select
              value={sourceChainId?.toString() ?? ""}
              onValueChange={(value) => {
                handleSwitchSource(Number(value));
                setSourceOpen(false);
              }}
              open={sourceOpen}
              onOpenChange={setSourceOpen}
            >
              <SelectTrigger className="chain-selector-pill w-auto border-none bg-transparent p-0 hover:bg-accent/10 focus:ring-0">
                {sourceChainId ? (
                  <div className="flex items-center gap-2">
                    {getChainIcon(sourceChainId) && <img src={getChainIcon(sourceChainId)} alt="" className="w-5 h-5 rounded-full" />}
                    {sourceChainMeta?.chain.name}
                  </div>
                ) : (
                  <SelectValue placeholder={t('bridge.selectChainPlaceholder')} />
                )}
              </SelectTrigger>
              <SelectContent className="shadcn-select-content p-0 max-h-80" onKeyDown={(e) => { if (e.target instanceof HTMLInputElement) e.stopPropagation(); }}>
                <div className="sticky -top-1 z-10 px-2 py-2 -mx-1 border-b border-border" style={{ backgroundColor: 'hsl(var(--popover))' }} onPointerDown={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    placeholder={t('common.search')}
                    className="w-full p-2 rounded-md border border-input bg-background"
                    value={sourceChainSearchTerm}
                    onChange={(e) => setSourceChainSearchTerm(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                    onFocus={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                    autoFocus
                  />
                </div>
                <div className="p-1">
                {Object.values(chainMetadata)
                  .filter(
                    (meta) =>
                      meta.chain.name.toLowerCase().includes(sourceChainSearchTerm.toLowerCase())
                  )
                  .sort((a, b) => a.chain.name.localeCompare(b.chain.name))
                  .map((meta) => {
                    const icon = getChainIcon(meta.chain.id);
                    return (
                      <SelectItem key={meta.chain.id} value={meta.chain.id.toString()}>
                        <div className="flex items-center gap-2">
                          {icon && <img src={icon} alt="" className="w-5 h-5 rounded-full" />}
                          {meta.chain.name}
                        </div>
                      </SelectItem>
                    );
                  })}
                </div>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="asset-panel-input-row">
          <NumberInput
            value={amount}
            onValueChange={setAmount}
            placeholder="0"
            className="asset-input-large"
          />
          
          <Select
            value={selectedToken}
            onValueChange={setSelectedToken}
            disabled={availableTokens.length === 0}
          >
            <SelectTrigger className="asset-token-pill w-auto h-auto hover:bg-accent/10 focus:ring-0 border-0 shadow-none">
              <div className="flex items-center gap-2">
                 <span className="font-bold text-lg">{sourceDisplaySymbol}</span>
              </div>
            </SelectTrigger>
            <SelectContent className="shadcn-select-content">
              {availableTokens.length === 0 ? (
                <SelectItem value="none" disabled>{t('bridge.noBridgeableTokens')}</SelectItem>
              ) : (
                availableTokens.map(({ symbol, token }) => {
                  const displayName = token.name ?? symbol;
                  const displaySymbol = symbol;
                  return (
                    <SelectItem key={symbol} value={symbol}>
                      {displayName} ({displaySymbol})
                    </SelectItem>
                  );
                })
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="asset-panel-footer">
          <div className="flex items-center gap-2">
            {amount.length > 0 && amountFormatted.word && (
              <span className="text-xs text-muted-foreground">
                {amountFormatted.word}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
             <span className="text-sm text-muted-foreground">
                {t('convert.balance')}: {balanceLoading ? <Loader2 className="inline h-3 w-3 animate-spin" /> : balanceFormatted.formatted}
             </span>
             <div className="amount-buttons-row compact-buttons">
              {[25, 50, 75].map((percentage) => (
                <button
                  key={percentage}
                  className={`percent-button compact-percent-button percent-${percentage}`}
                  onClick={() => setPercentageAmount(percentage)}
                  type="button"
                >
                  {percentage}%
                </button>
              ))}
              <button
                className="percent-button compact-percent-button percent-100"
                onClick={() => setPercentageAmount(100)}
                type="button"
              >
                {t('common.max')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Swap Button */}
      <div className="swap-arrow-container">
        <button
          onClick={handleSwap}
          className="swap-arrow-button"
          aria-label="Swap Chains"
          disabled={sending}
        >
          <ArrowDown size={20} />
        </button>
      </div>

      {/* Destination Card */}
      <div className="asset-panel">
        <div className="asset-panel-header">
          <span className="asset-panel-label">{t('bridge.toChain')}</span>
          <div className="chain-selector-wrapper">
             <Select
              value={destinationChainId?.toString() ?? ""}
              onValueChange={(value) => {
                setDestinationChainId(Number(value));
                setDestinationOpen(false);
              }}
              disabled={destinationOptions.length === 0}
              open={destinationOpen}
              onOpenChange={setDestinationOpen}
            >
              <SelectTrigger className="chain-selector-pill w-auto border-none bg-transparent p-0 hover:bg-accent/10 focus:ring-0">
                {destinationChainId ? (
                  <div className="flex items-center gap-2">
                    {getChainIcon(destinationChainId) && <img src={getChainIcon(destinationChainId)} alt="" className="w-5 h-5 rounded-full" />}
                    {destinationChainMeta?.chain.name}
                  </div>
                ) : (
                  <SelectValue placeholder={t('bridge.selectDestinationPlaceholder')} />
                )}
              </SelectTrigger>
              <SelectContent className="shadcn-select-content p-0 max-h-80" onKeyDown={(e) => { if (e.target instanceof HTMLInputElement) e.stopPropagation(); }}>
                <div className="sticky -top-1 z-10 px-2 py-2 -mx-1 border-b border-border" style={{ backgroundColor: 'hsl(var(--popover))' }} onPointerDown={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    placeholder={t('common.search')}
                    className="w-full p-2 rounded-md border border-input bg-background"
                    value={destinationChainSearchTerm}
                    onChange={(e) => setDestinationChainSearchTerm(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                    onFocus={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                    autoFocus
                  />
                </div>
                <div className="p-1">
                {destinationOptions.length === 0 ? (
                  <SelectItem value="none" disabled>{t('bridge.noDestination')}</SelectItem>
                ) : (
                  [...destinationOptions]
                    .filter(
                      (meta) =>
                        meta.chain.name.toLowerCase().includes(destinationChainSearchTerm.toLowerCase())
                    )
                    .sort((a, b) => a.chain.name.localeCompare(b.chain.name))
                    .map((meta) => {
                      const icon = getChainIcon(meta.chain.id);
                      return (
                        <SelectItem key={meta.chain.id} value={meta.chain.id.toString()}>
                          <div className="flex items-center gap-2">
                            {icon && <img src={icon} alt="" className="w-5 h-5 rounded-full" />}
                            {meta.chain.name}
                          </div>
                        </SelectItem>
                      );
                    })
                )}
                </div>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="asset-panel-input-row">
          <div className="asset-input-large">
            {amount.length > 0 ? formatInputWithCommas(amount) : '0'}
          </div>
          <div className="flex items-center gap-2">
            <div className="asset-token-pill cursor-default hover:transform-none hover:shadow-none">
               <span className="font-bold text-lg">{destinationDisplaySymbol}</span>
            </div>
            {destinationTokenConfig?.tokenAddress && (
              <Button
                className="wallet-icon-button"
                onClick={addDestinationTokenToWallet}
                disabled={addingDestinationToken}
                title={t('convert.addToWalletButton')}
              >
                {addingDestinationToken ? <Loader2 className="h-4 w-4 animate-spin" /> : <WalletIcon className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>

        <div className="asset-panel-footer">
           <div className="flex items-center gap-2">
            {amount.length > 0 && amountFormatted.word && (
              <span className="text-xs text-muted-foreground">
                {amountFormatted.word}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
             <span className="text-sm text-muted-foreground">
                {t('convert.balance')}: {destinationBalanceLoading ? <Loader2 className="inline h-3 w-3 animate-spin" /> : destinationBalanceFormatted.formatted}
             </span>
          </div>
        </div>
      </div>

      {/* Gas & Time Estimates */}
      <Alert className="fee-quote-alert">
        <AlertDescription className="text-sm flex justify-between items-center">
          <span>
            {t('common.estimatedGas')}: {gasLoading ? <Loader2 className="inline h-3 w-3 animate-spin" /> : `~${gasEstimate} ${gasSymbol}`}
          </span>
          {sourceChainId && (
            <span className="text-muted-foreground">
              {t('bridge.estimatedTime', { defaultValue: 'Est. time' })}: {CHAIN_TRANSFER_TIMES[sourceChainId] ?? "3-5 min"}
            </span>
          )}
        </AlertDescription>
      </Alert>

      {error && (
        <Alert className="error-alert">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {txHash && (
        <Alert className="alert-custom-success">
          <AlertDescription>
            <div className="success-container">
              <div className="success-header">
                <CheckCircle className="success-icon" />
                <span className="success-title">{t('common.success')}!</span>
              </div>
              
              <div className="success-actions">
                <div className="success-links-row">
                  {sourceExplorerUrl && (
                    <a
                      href={`${sourceExplorerUrl}/tx/${txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="success-explorer-link"
                    >
                      <ExternalLink />
                      {t('common.viewOnExplorer')}
                    </a>
                  )}
                  {axelarscanUrl && (
                    <a
                      href={axelarscanUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="success-explorer-link"
                    >
                      <ExternalLink />
                      {t('bridge.viewOnAxelarscan')}
                    </a>
                  )}
                </div>

                {destinationTokenConfig?.tokenAddress && destinationChainMeta && (
                  <button
                    type="button"
                    className="wallet-add-card"
                    onClick={addDestinationTokenToWallet}
                    disabled={addingDestinationToken}
                  >
                    <div className="wallet-add-details">
                      <span className="wallet-add-title">
                        {t('convert.addToWalletButton')} {destinationDisplaySymbol}
                      </span>
                      <span className="wallet-add-subtitle">
                        on {destinationChainMeta.chain.name}
                      </span>
                    </div>
                    <div className="wallet-add-icon-wrapper">
                      {addingDestinationToken ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <WalletIcon />
                      )}
                    </div>
                  </button>
                )}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-2 pt-2">
        <Button onClick={submitBridge} disabled={!canSubmit} className="bridge-button w-full h-12 text-lg">
          {sending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {t('common.bridging')}
            </>
          ) : (
            t('bridge.bridgeButton')
          )}
        </Button>
      </div>

      {/* Transaction History */}
      {transactions.length > 0 && (
        <div
          className="mt-6 pt-4"
          style={{ borderTop: '1px solid var(--theme-section-border)' }}
        >
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center justify-between w-full text-sm transition-colors"
            style={{ color: 'var(--theme-text-secondary)' }}
          >
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {t('bridge.recentTransactions', { defaultValue: 'Recent Transactions' })} ({transactions.length})
            </span>
            <span className="text-xs">{showHistory ? '▼' : '▶'}</span>
          </button>

          {showHistory && (
            <div className="mt-3 space-y-2">
              {transactions.map((tx) => (
                <a
                  key={tx.txHash}
                  href={tx.axelarscanUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block p-3 rounded-lg transition-all"
                  style={{
                    background: 'var(--theme-section-bg)',
                    border: '1px solid var(--theme-card-border)',
                    color: 'var(--theme-text-primary)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--theme-section-hover-bg)';
                    e.currentTarget.style.borderColor = 'var(--theme-link-color)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--theme-section-bg)';
                    e.currentTarget.style.borderColor = 'var(--theme-card-border)';
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getChainIcon(tx.sourceChainId) && (
                        <img src={getChainIcon(tx.sourceChainId)} alt="" className="w-4 h-4 rounded-full" />
                      )}
                      <span className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>{tx.sourceChainName}</span>
                      <span className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>→</span>
                      {getChainIcon(tx.destChainId) && (
                        <img src={getChainIcon(tx.destChainId)} alt="" className="w-4 h-4 rounded-full" />
                      )}
                      <span className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>{tx.destChainName}</span>
                    </div>
                    <span className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>{formatRelativeTime(tx.timestamp)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-medium" style={{ color: 'var(--theme-text-primary)' }}>
                      {formatLargeNumber(tx.amount).formatted} {tx.tokenSymbol}
                    </span>
                    <ExternalLink className="w-3 h-3" style={{ color: 'var(--theme-link-color)' }} />
                  </div>
                </a>
              ))}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clearHistory();
                }}
                className="flex items-center gap-1 text-xs transition-colors mt-2"
                style={{ color: 'var(--theme-text-muted)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent-danger, #ff6b6b)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--theme-text-muted)'; }}
              >
                <Trash2 className="w-3 h-3" />
                {t('bridge.clearHistory', { defaultValue: 'Clear history' })}
              </button>

              <p className="text-xs mt-2" style={{ color: 'var(--theme-text-muted)' }}>
                {t('bridge.historyStoredLocally', { defaultValue: 'Transaction history stored locally on this device' })}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BridgeForm;