import { useMemo, useState } from "react";
import type { Chain } from "viem";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEnvironment } from "../context/EnvironmentContext";
import { AddNetworkButton } from "./AddNetworkButton";
import { ExternalLink, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import chainsJson from "../config/chains.json";

type AddNetworksModalProps = {
  show: boolean;
  onClose: () => void;
};

const AddNetworksModal = ({ show, onClose }: AddNetworksModalProps) => {
  const { t } = useTranslation();
  const { availableChains } = useEnvironment();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedChainId, setExpandedChainId] = useState<number | null>(null);
  const [addedChainIds, setAddedChainIds] = useState<Set<number>>(new Set());

  const chains = useMemo(
    () =>
      Object.values(availableChains)
        .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase())),
    [availableChains],
  );

  const filteredChains = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {return chains;}
    return chains.filter(
      (chain) =>
        chain.name.toLowerCase().includes(term) ||
        chain.nativeCurrency.symbol.toLowerCase().includes(term) ||
        String(chain.id).includes(term),
    );
  }, [chains, searchTerm]);

  const toggleExpanded = (chainId: number) => {
    setExpandedChainId((current) => (current === chainId ? null : chainId));
  };

  const markAsAdded = (chainId: number) => {
    setAddedChainIds((prev) => new Set(prev).add(chainId));
    // Remove from added state after 3 seconds to allow re-adding if needed
    setTimeout(() => {
      setAddedChainIds((prev) => {
        const next = new Set(prev);
        next.delete(chainId);
        return next;
      });
    }, 3000);
  };

  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{t('addNetworks.title', 'Add Networks to Wallet')}</DialogTitle>
          <DialogDescription>
            {t('addNetworks.description', 'Click any network to add it to MetaMask, Rabby, or other Web3 wallets')}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            placeholder={t('addNetworks.searchPlaceholder', 'Search networks...')}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="h-9"
          />
          <div className="overflow-y-auto max-h-[60vh] pr-2 -mr-2">
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
              {filteredChains.map((chain) => {
                const isAdded = addedChainIds.has(chain.id);
                const iconUrl = (chain as Chain & { iconUrl?: string }).iconUrl;

                return (
                  <div
                    key={chain.id}
                    className={`group relative xl:aspect-square rounded-lg border bg-card hover:shadow-md transition-all ${
                      isAdded ? "border-green-500 ring-2 ring-green-500/20" : "hover:border-primary/50"
                    }`}
                  >
                    <div className="p-3 xl:p-2 flex flex-col items-center gap-2 xl:gap-1.5 xl:justify-between xl:h-full text-center">
                      {/* Network Icon */}
                      <div className="relative w-12 h-12 xl:w-10 xl:h-10 flex items-center justify-center xl:shrink-0">
                        {iconUrl ? (
                          <img
                            src={iconUrl}
                            alt={chain.name}
                            className="w-10 h-10 xl:w-9 xl:h-9 rounded-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`w-10 h-10 xl:w-9 xl:h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-xs font-bold ${iconUrl ? 'hidden' : ''}`}>
                          {chain.name.slice(0, 2).toUpperCase()}
                        </div>
                        {isAdded && (
                          <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5">
                            <Check className="h-3 w-3 xl:h-2.5 xl:w-2.5 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Network Name */}
                      <div className="w-full min-h-10 xl:min-h-0 xl:flex-1 flex items-center justify-center xl:px-1">
                        <p className="text-xs xl:text-[11px] font-medium leading-tight line-clamp-2">
                          {chain.name}
                        </p>
                      </div>

                      {/* Add Button */}
                      <AddNetworkButton
                        chain={chain}
                        variant="secondary"
                        size="sm"
                        className="w-full h-7 xl:h-6 text-xs xl:text-[10px] px-2 xl:px-1 xl:shrink-0"
                        onSuccess={() => markAsAdded(chain.id)}
                      />

                      {/* Expandable Details */}
                      {expandedChainId === chain.id && (
                        <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-popover border rounded-lg shadow-lg z-10 text-left">
                          <p className="text-xs font-semibold mb-1">{chain.name}</p>
                          <p className="text-[10px] text-muted-foreground mb-2">
                            Chain ID: {chain.id} · {chain.nativeCurrency.symbol}
                          </p>
                          {chain.blockExplorers?.default?.url && (
                            <a
                              href={chain.blockExplorers.default.url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1 text-[10px] text-primary hover:underline"
                            >
                              <ExternalLink className="h-2.5 w-2.5" />
                              Explorer
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Info button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpanded(chain.id);
                      }}
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded"
                      aria-label="Show details"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="16" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12.01" y2="8" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
            {filteredChains.length === 0 && (
              <div className="text-center py-12">
                <p className="text-sm text-muted-foreground">{t('addNetworks.noResults', 'No networks found')}</p>
              </div>
            )}
          </div>
        </div>
        <DialogFooter className="border-t pt-3">
          <div className="flex items-center justify-between w-full">
            <p className="text-xs text-muted-foreground">
              {filteredChains.length} {t('addNetworks.networkCount', 'network')}{filteredChains.length !== 1 ? "s" : ""}
            </p>
            <Button variant="outline" size="sm" onClick={onClose}>
              {t('nav.close', 'Close')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddNetworksModal;
