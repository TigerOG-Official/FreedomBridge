import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ArrowDown, Loader2, CheckCircle, ExternalLink, AlertTriangle } from "lucide-react";
import WalletIcon from "./icons/WalletIcon";
import { useAccount, useChainId, usePublicClient, useWalletClient } from "wagmi";
import { formatUnits, parseUnits } from "viem";
import { migrationAbi } from "../abi/migration";
import { erc20Abi } from "../utils/erc20Abi";
import { NumberInput } from "./NumberInput";
import { formatLargeNumber, formatInputWithCommas } from "../utils/numberFormat";
import { useTranslation } from "react-i18next";
import { getChainIcon } from "../utils/chainIcons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

// Token pairs available for conversion
type TokenPair = {
  id: string;
  legacyName: string;
  legacySymbol: string;
  newName: string;
  newSymbol: string;
  legacyAddress: `0x${string}`;
  newAddress: `0x${string}`;
  migrationAddress: `0x${string}`;
};

// Contract addresses per network
const TOKEN_PAIRS: Record<number, TokenPair[]> = {
  // BSC Mainnet (56)
  56: [
    {
      id: "tigerog",
      legacyName: "BNBTiger",
      legacySymbol: "BNBTIGER",
      newName: "TigerOG",
      newSymbol: "TIGEROG",
      legacyAddress: "0xAC68931B666E086E9de380CFDb0Fb5704a35dc2D",
      newAddress: "0xCF7Fc0De71238c9EC45EC2Fd24FDc8521345dbB5",
      migrationAddress: "0x18b2AeD6Aa6aE20A70be57739F8B5C26706Ff2af",
    },
    {
      id: "lionog",
      legacyName: "BNBLion",
      legacySymbol: "BNBLION",
      newName: "LionOG",
      newSymbol: "LIONOG",
      legacyAddress: "0xdA1689C5557564d06E2A546F8FD47350b9D44a73",
      newAddress: "0x6731F2d7ADF86cfba30d15c4D10113Ce98f3492A",
      migrationAddress: "0x4272b9EeBde520Dfb9cFc3C16bBfc8d3868b467b",
    },
    {
      id: "frogog",
      legacyName: "BNBFrog",
      legacySymbol: "BNBFROG",
      newName: "FrogOG",
      newSymbol: "FROGOG",
      legacyAddress: "0x64da67A12a46f1DDF337393e2dA12eD0A507Ad3D",
      newAddress: "0x0E3b564bdD09348840811C7e1106BbD0e98b5b4f",
      migrationAddress: "0xbF4b1F662247147afCefecbdEa5590fd103dF1FB",
    },
  ],
};

const EXPLORERS: Record<number, string> = {
  56: "https://bscscan.com",
};

const DECIMALS = 9;

const ConverterForm = () => {
  const { t } = useTranslation();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  // Get available token pairs for current chain
  const availableTokenPairs = TOKEN_PAIRS[chainId as keyof typeof TOKEN_PAIRS] ?? [];
  const isBSC = chainId === 56;

  // Selected token pair state - default to first available pair
  const [selectedPairId, setSelectedPairId] = useState<string>(
    () => availableTokenPairs[0]?.id ?? ""
  );

  // Get selected token pair
  const selectedPair = availableTokenPairs.find(p => p.id === selectedPairId) ?? availableTokenPairs[0];

  const [amount, setAmount] = useState("");
  const [legacyBalance, setLegacyBalance] = useState<bigint>(0n);
  const [newTokenBalance, setNewTokenBalance] = useState<bigint>(0n);
  const [availableForUpgrade, setAvailableForUpgrade] = useState<bigint>(0n);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [converting, setConverting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showFinalConfirmModal, setShowFinalConfirmModal] = useState(false);
  const [addingToken, setAddingToken] = useState(false);

  // Get addresses from selected pair
  const LEGACY_ADDRESS = selectedPair?.legacyAddress;
  const NEW_TOKEN_ADDRESS = selectedPair?.newAddress;
  const MIGRATION_ADDRESS = selectedPair?.migrationAddress;
  const BSC_EXPLORER = EXPLORERS[56];

  // Reset amount when token pair changes
  useEffect(() => {
    setAmount("");
    setTxHash(null);
    setError(null);
  }, [selectedPairId]);

  // Fetch balances
  useEffect(() => {
    if (!publicClient || !address || !selectedPair || !LEGACY_ADDRESS || !NEW_TOKEN_ADDRESS || !MIGRATION_ADDRESS) {
      setLegacyBalance(0n);
      setNewTokenBalance(0n);
      return;
    }

    let cancelled = false;
    const fetchBalances = async () => {
      setBalanceLoading(true);
      try {
        const [legacy, newToken, available] = await Promise.all([
          publicClient.readContract({
            address: LEGACY_ADDRESS,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: [address],
          }) as Promise<bigint>,
          publicClient.readContract({
            address: NEW_TOKEN_ADDRESS,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: [address],
          }) as Promise<bigint>,
          publicClient.readContract({
            address: MIGRATION_ADDRESS,
            abi: migrationAbi,
            functionName: "availableForUpgrade",
          }) as Promise<bigint>,
        ]);

        if (!cancelled) {
          setLegacyBalance(legacy);
          setNewTokenBalance(newToken);
          setAvailableForUpgrade(available);
        }
      } catch (err) {
        console.error("Failed to fetch balances:", err);
        if (!cancelled) {
          setLegacyBalance(0n);
          setNewTokenBalance(0n);
        }
      } finally {
        if (!cancelled) setBalanceLoading(false);
      }
    };

    fetchBalances();
    const interval = setInterval(fetchBalances, 15000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [publicClient, address, txHash, selectedPair, LEGACY_ADDRESS, NEW_TOKEN_ADDRESS, MIGRATION_ADDRESS]);

  const amountBigInt = useMemo(() => {
    try {
      return parseUnits(amount || "0", DECIMALS);
    } catch {
      return 0n;
    }
  }, [amount]);

  const exceedsBalance = amountBigInt > legacyBalance;
  const exceedsAvailable = amountBigInt > availableForUpgrade && availableForUpgrade > 0n;

  const canConvert =
    isConnected &&
    amountBigInt > 0n &&
    !converting &&
    !exceedsBalance &&
    !exceedsAvailable;

  const ensureApproval = async (): Promise<boolean> => {
    if (!publicClient || !walletClient || !address) return false;

    try {
      const allowance = (await publicClient.readContract({
        address: LEGACY_ADDRESS,
        abi: erc20Abi,
        functionName: "allowance",
        args: [address, MIGRATION_ADDRESS],
        blockTag: "latest",
      })) as bigint;

      if (allowance >= amountBigInt) return true;

      const approveTx = await walletClient.writeContract({
        address: LEGACY_ADDRESS,
        abi: erc20Abi,
        functionName: "approve",
        args: [MIGRATION_ADDRESS, amountBigInt],
      });
      await publicClient.waitForTransactionReceipt({ hash: approveTx, confirmations: 1 });

      return true;
    } catch (err) {
      setError("Approval failed. Please try again.");
      console.error("Approval error:", err);
      return false;
    }
  };

  const handleConvertClick = () => {
    if (!canConvert) return;
    setShowConfirmModal(true);
  };

  const handleFirstConfirm = () => {
    setShowConfirmModal(false);
    setShowFinalConfirmModal(true);
  };

  const handleConfirmedConvert = async () => {
    if (!publicClient || !walletClient || !canConvert) return;

    setShowFinalConfirmModal(false);
    setError(null);
    setTxHash(null);
    setConverting(true);

    try {
      const approved = await ensureApproval();
      if (!approved) {
        setConverting(false);
        return;
      }

      const tx = await walletClient.writeContract({
        address: MIGRATION_ADDRESS,
        abi: migrationAbi,
        functionName: "upgrade",
        args: [amountBigInt],
      });

      await publicClient.waitForTransactionReceipt({ hash: tx, confirmations: 1 });
      setTxHash(tx);
      setAmount("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Conversion failed";
      setError(message);
      console.error("Conversion error:", err);
    } finally {
      setConverting(false);
    }
  };

  const setPercentageAmount = (percentage: number) => {
    if (legacyBalance > 0n) {
      const percentageBalance = (legacyBalance * BigInt(percentage)) / 100n;
      setAmount(formatUnits(percentageBalance, DECIMALS));
    }
  };

  const addTokenToWallet = async () => {
    if (!walletClient || !NEW_TOKEN_ADDRESS || !selectedPair) return;
    try {
      setAddingToken(true);
      await walletClient.watchAsset({
        type: "ERC20",
        options: {
          address: NEW_TOKEN_ADDRESS,
          decimals: DECIMALS,
          symbol: selectedPair.newSymbol,
        },
      });
    } catch {
      // User likely rejected - no error needed
    } finally {
      setAddingToken(false);
    }
  };

  const legacyFormatted = formatLargeNumber(formatUnits(legacyBalance, DECIMALS));
  const newTokenFormatted = formatLargeNumber(formatUnits(newTokenBalance, DECIMALS));
  const amountFormatted = formatLargeNumber(amount || "0");

  // Show warning if not on BSC
  if (!isBSC) {
    return (
      <div className="bridge-form-container">
        <Alert className="warning-alert" style={{ color: 'var(--theme-text-primary)' }}>
          <AlertDescription>
            <div className="font-semibold mb-1" style={{ color: 'var(--theme-text-primary)' }}>
              {t('convert.networkWarning.title')}
            </div>
            <div className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
              {t('convert.networkWarning.message')}
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="bridge-form-container">
      {/* Source: Legacy Token */}
      <div className="asset-panel">
        <div className="asset-panel-header">
          <span className="asset-panel-label">{t('common.from')}</span>
          <div className="chain-selector-pill cursor-default hover:bg-transparent opacity-100">
            <div className="flex items-center gap-2">
              {getChainIcon(chainId) && <img src={getChainIcon(chainId)} alt="" className="w-5 h-5 rounded-full" />}
              BSC Chain
            </div>
          </div>
        </div>

        <div className="asset-panel-input-row">
          <NumberInput
            value={amount}
            onValueChange={setAmount}
            placeholder="0"
            className="asset-input-large"
          />

          {availableTokenPairs.length > 1 ? (
            <Select
              value={selectedPairId}
              onValueChange={setSelectedPairId}
            >
              <SelectTrigger className="asset-token-pill w-auto h-auto hover:bg-accent/10 focus:ring-0 border-0 shadow-none">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg">{selectedPair?.legacySymbol ?? 'Select'}</span>
                </div>
              </SelectTrigger>
              <SelectContent className="shadcn-select-content">
                {availableTokenPairs.map((pair) => (
                  <SelectItem key={pair.id} value={pair.id}>
                    <span>{pair.legacyName} ({pair.legacySymbol})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="asset-token-pill cursor-default">
              <span className="font-bold text-lg">{selectedPair?.legacySymbol ?? 'Select Token'}</span>
            </div>
          )}
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
              {t('convert.balance')}: {balanceLoading ? <Loader2 className="inline h-3 w-3 animate-spin" /> : legacyFormatted.formatted}
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

      {/* Arrow (static - no flip on Convert page) */}
      <div className="swap-arrow-container">
        <div className="swap-arrow-button swap-arrow-static">
          <ArrowDown size={20} />
        </div>
      </div>

      {/* Destination: New Token */}
      <div className="asset-panel">
        <div className="asset-panel-header">
          <span className="asset-panel-label">{t('common.to')}</span>
          <div className="chain-selector-pill cursor-default hover:bg-transparent opacity-100">
            <div className="flex items-center gap-2">
              {getChainIcon(chainId) && <img src={getChainIcon(chainId)} alt="" className="w-5 h-5 rounded-full" />}
              BSC Chain
            </div>
          </div>
        </div>

        <div className="asset-panel-input-row">
          <div className="asset-input-large">
            {amount.length > 0 ? formatInputWithCommas(amount) : '0'}
          </div>
          <div className="flex items-center gap-2">
            <div className="asset-token-pill cursor-default hover:transform-none hover:shadow-none">
              <span className="font-bold text-lg">{selectedPair?.newSymbol ?? 'New Token'}</span>
            </div>
            {NEW_TOKEN_ADDRESS && (
              <Button
                className="wallet-icon-button"
                onClick={addTokenToWallet}
                disabled={addingToken}
                title={t('convert.addToWalletButton')}
              >
                {addingToken ? <Loader2 className="h-4 w-4 animate-spin" /> : <WalletIcon className="h-4 w-4" />}
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
              {t('convert.balance')}: {balanceLoading ? <Loader2 className="inline h-3 w-3 animate-spin" /> : newTokenFormatted.formatted}
            </span>
          </div>
        </div>
      </div>

      {/* Errors */}
      {error && (
        <Alert className="error-alert">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {exceedsBalance && amountBigInt > 0n && (
        <Alert className="error-alert">
          <AlertDescription>Insufficient {selectedPair?.legacySymbol} balance</AlertDescription>
        </Alert>
      )}

      {exceedsAvailable && amountBigInt > 0n && (
        <Alert className="warning-alert">
          <AlertDescription>
            Amount exceeds available {selectedPair?.newSymbol} in migration contract ({formatLargeNumber(formatUnits(availableForUpgrade, DECIMALS)).formatted})
          </AlertDescription>
        </Alert>
      )}

      {/* Success */}
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
                  <a
                    href={`${BSC_EXPLORER}/tx/${txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="success-explorer-link"
                  >
                    <ExternalLink />
                    {t('common.viewOnExplorer')}
                  </a>
                </div>

                {NEW_TOKEN_ADDRESS && selectedPair && (
                  <button
                    type="button"
                    className="wallet-add-card"
                    onClick={addTokenToWallet}
                    disabled={addingToken}
                  >
                    <div className="wallet-add-details">
                      <span className="wallet-add-title">
                        {t('convert.addToWalletButton')} {selectedPair.newSymbol}
                      </span>
                      <span className="wallet-add-subtitle">
                        on BSC Chain
                      </span>
                    </div>
                    <div className="wallet-add-icon-wrapper">
                      {addingToken ? (
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

      {/* Convert Button */}
      <div className="flex flex-col gap-2 pt-2">
        <Button onClick={handleConvertClick} disabled={!canConvert} className="bridge-button w-full h-12 text-lg">
          {converting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Converting...
            </>
          ) : (
            `Convert to ${selectedPair?.newSymbol ?? 'New Token'}`
          )}
        </Button>
      </div>

      {/* Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              </div>
              <DialogTitle className="text-xl">{t('convert.confirmModal.title')}</DialogTitle>
            </div>
            <DialogDescription className="text-left space-y-3 pt-2">
              <p className="text-base text-foreground/90">
                {t('convert.confirmModal.warning')}
              </p>
              <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 space-y-2">
                <p className="text-sm text-amber-200/90 font-medium">
                  {t('convert.confirmModal.irreversible')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t('convert.confirmModal.burnExplanation', {
                    legacySymbol: selectedPair?.legacySymbol,
                    newSymbol: selectedPair?.newSymbol
                  })}
                </p>
                <p className="text-sm text-green-400/90">
                  {t('convert.confirmModal.positiveNote', {
                    newSymbol: selectedPair?.newSymbol
                  })}
                </p>
              </div>
              <p className="text-sm text-muted-foreground pt-1">
                {t('convert.confirmModal.confirmQuestion', {
                  amount: formatInputWithCommas(amount),
                  legacySymbol: selectedPair?.legacySymbol,
                  newSymbol: selectedPair?.newSymbol
                })}
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
              className="flex-1"
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleFirstConfirm}
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
            >
              {t('convert.confirmModal.confirmButton')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Final Confirmation Modal */}
      <Dialog open={showFinalConfirmModal} onOpenChange={setShowFinalConfirmModal}>
        <DialogContent className="sm:max-w-md border-red-500/30">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <DialogTitle className="text-xl text-red-400">{t('convert.finalConfirmModal.title')}</DialogTitle>
            </div>
            <DialogDescription className="text-left space-y-3 pt-2">
              <p className="text-base text-foreground/90">
                {t('convert.finalConfirmModal.message', {
                  legacySymbol: selectedPair?.legacySymbol,
                  newSymbol: selectedPair?.newSymbol
                })}
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowFinalConfirmModal(false)}
              className="flex-1"
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleConfirmedConvert}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {t('convert.finalConfirmModal.confirmButton')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConverterForm;
