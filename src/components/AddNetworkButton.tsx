import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useWalletClient } from "wagmi";
import { useTranslation } from "react-i18next";
import type { Chain } from "viem";
import { Wallet } from "lucide-react";

interface AddNetworkButtonProps {
  chain: Chain;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  onSuccess?: () => void;
}

export const AddNetworkButton = ({
  chain,
  variant = "outline",
  size = "default",
  className,
  onSuccess
}: AddNetworkButtonProps) => {
  const { t } = useTranslation();
  const { data: walletClient } = useWalletClient();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddNetwork = async () => {
    if (!walletClient) {
      alert(t("addNetwork.connectWallet", "Please connect your wallet first"));
      return;
    }

    setIsAdding(true);

    try {
      await walletClient.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: `0x${chain.id.toString(16)}`,
            chainName: chain.name,
            nativeCurrency: {
              name: chain.nativeCurrency.name,
              symbol: chain.nativeCurrency.symbol,
              decimals: chain.nativeCurrency.decimals,
            },
            rpcUrls: [
              chain.rpcUrls.default.http[0] || chain.rpcUrls.public?.http?.[0] || "",
            ],
            blockExplorerUrls: chain.blockExplorers?.default
              ? [chain.blockExplorers.default.url]
              : undefined,
          },
        ],
      });

      // Success - call onSuccess callback
      onSuccess?.();
    } catch (error) {
      const err = error as { code?: number; message?: string };

      // User rejected
      if (err.code === 4001) {
        return;
      }

      // Chain already added
      if (err.code === -32002) {
        alert(t("addNetwork.alreadyPending", "Request already pending. Check your wallet."));
        return;
      }

      console.error("Failed to add network:", error);
      alert(t("addNetwork.error", "Failed to add network. Please add it manually."));
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleAddNetwork}
      disabled={isAdding || !walletClient}
      className={className}
    >
      {isAdding ? (
        <>
          <Wallet className="h-3 w-3 mr-1 animate-pulse" />
          {t("addNetwork.adding", "Adding...")}
        </>
      ) : (
        <>
          <Wallet className="h-3 w-3 mr-1" />
          {t("addNetwork.button", "Add")}
        </>
      )}
    </Button>
  );
};
