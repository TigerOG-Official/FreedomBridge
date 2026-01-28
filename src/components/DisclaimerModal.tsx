import { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "./ui/button";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";

const DISCLAIMER_ACCEPTED_KEY = "freedom-bridge-disclaimer-accepted";

interface DisclaimerModalProps {
  onAccept: () => void;
}

export function useDisclaimerAccepted() {
  const [accepted, setAccepted] = useState<boolean>(() => {
    return sessionStorage.getItem(DISCLAIMER_ACCEPTED_KEY) === "true";
  });

  const acceptDisclaimer = () => {
    sessionStorage.setItem(DISCLAIMER_ACCEPTED_KEY, "true");
    setAccepted(true);
  };

  return { accepted, acceptDisclaimer };
}

export default function DisclaimerModal({ onAccept }: DisclaimerModalProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(true);

  const handleAccept = () => {
    onAccept();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-lg max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: 'var(--theme-card-bg)',
          borderColor: 'var(--theme-card-border)',
          color: 'var(--theme-text-primary)'
        }}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div
              className="p-2 rounded-full"
              style={{ backgroundColor: 'var(--theme-percent-25-bg)' }}
            >
              <AlertTriangle className="w-5 h-5" style={{ color: 'var(--primary)' }} />
            </div>
            <DialogTitle
              className="text-xl font-bold"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {t('disclaimerModal.title', 'Important Disclaimer')}
            </DialogTitle>
          </div>
          <DialogDescription style={{ color: 'var(--theme-text-secondary)' }}>
            {t('disclaimerModal.subtitle', 'Please read and acknowledge before proceeding.')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-4">
          <div
            className="p-4 rounded-lg border text-sm"
            style={{
              backgroundColor: 'var(--theme-section-bg)',
              borderColor: 'var(--theme-section-border)',
              color: 'var(--theme-text-secondary)'
            }}
          >
            <p className="mb-3">
              {t('disclaimerModal.noAdvice', 'Freedom Bridge does not provide investment, financial, or trading advice. Cryptocurrency investments are volatile and risky.')}
            </p>
            <p className="mb-3">
              {t('disclaimerModal.risks', 'By using this platform, you acknowledge that smart contracts may contain vulnerabilities, cross-chain bridges carry inherent risks, and transactions are irreversible.')}
            </p>
            <p>
              {t('disclaimerModal.dyor', 'Always do your own research (DYOR) and only use funds you can afford to lose.')}
            </p>
          </div>

          <p
            className="text-sm text-center"
            style={{ color: 'var(--theme-text-muted)' }}
          >
            {t('disclaimerModal.fullDisclaimer', 'For full details, see our')}{' '}
            <a
              href="/#/disclaimer"
              target="_blank"
              className="underline hover:opacity-80"
              style={{ color: 'var(--primary)' }}
            >
              {t('disclaimerModal.fullDisclaimerLink', 'Legal Disclaimer')}
            </a>.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            onClick={handleAccept}
            className="btn-primary w-full"
          >
            {t('disclaimerModal.accept', 'I Understand and Accept')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
