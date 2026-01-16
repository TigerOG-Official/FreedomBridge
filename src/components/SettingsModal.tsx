import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEnvironment } from "../context/EnvironmentContext";
import { useTranslation } from "react-i18next";

interface SettingsModalProps {
  show: boolean;
  onClose: () => void;
}

const SettingsModal = ({ show, onClose }: SettingsModalProps) => {
  const { t } = useTranslation();
  const { availableChains, rpcConfig, updateRpcConfig, chainOptions } = useEnvironment();
  const [rpcInputs, setRpcInputs] = useState<Record<number, string>>({});

  useEffect(() => {
    const entries = chainOptions.reduce<Record<number, string>>((acc, { chainId }) => {
      acc[chainId] = rpcConfig[chainId] ?? availableChains[chainId]?.rpcUrls.default.http?.[0] ?? "";
      return acc;
    }, {});
    setRpcInputs(entries);
  }, [availableChains, chainOptions, rpcConfig]);

  const handleInputChange = (chainId: number, value: string) => {
    setRpcInputs((prev) => ({
      ...prev,
      [chainId]: value,
    }));
  };

  const handleSave = () => {
    for (const [id, url] of Object.entries(rpcInputs)) {
      updateRpcConfig(Number(id), url.trim());
    }
    onClose();
  };

  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] settings-modal-content">
        <DialogHeader>
          <DialogTitle>{t('settings.title')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>{t('settings.environment')}</Label>
            <p className="text-sm text-muted-foreground">
              Mainnet (BNB Chain, Ethereum, Base, Linea, Polygon, Avalanche, XRPL EVM)
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <h6 className="text-base font-semibold">{t('settings.rpcEndpoints')}</h6>
              <p className="text-sm text-muted-foreground mt-1">
                {t('settings.rpcEndpointsHelp')}
              </p>
            </div>
            <div className="space-y-3">
              {chainOptions.map(({ chainId, name }) => (
                <div key={chainId} className="space-y-2">
                  <Label htmlFor={`rpc-${chainId}`}>
                    {name} ({t('common.chainId')} {chainId})
                  </Label>
                  <Input
                    id={`rpc-${chainId}`}
                    value={rpcInputs[chainId] ?? ""}
                    onChange={(event) => handleInputChange(chainId, event.target.value)}
                    placeholder="https://..."
                  />
                </div>
              ))}
              {chainOptions.length === 0 && (
                <p className="text-sm text-muted-foreground">{t('settings.noChainsConfigured')}</p>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('settings.cancel')}
          </Button>
          <Button onClick={handleSave}>
            {t('settings.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
