import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY_PREFIX = "freedom-bridge:txns:";
const MAX_TRANSACTIONS = 10;
const EXPIRY_DAYS = 7;

export type StoredTransaction = {
  txHash: string;
  sourceChainId: number;
  sourceChainName: string;
  destChainId: number;
  destChainName: string;
  tokenSymbol: string;
  amount: string;
  timestamp: number;
  axelarscanUrl: string;
};

function getStorageKey(address: string): string {
  return `${STORAGE_KEY_PREFIX}${address.toLowerCase()}`;
}

function isExpired(timestamp: number): boolean {
  const expiryMs = EXPIRY_DAYS * 24 * 60 * 60 * 1000;
  return Date.now() - timestamp > expiryMs;
}

function loadTransactions(address: string): StoredTransaction[] {
  if (typeof window === "undefined" || !address) return [];

  try {
    const raw = localStorage.getItem(getStorageKey(address));
    if (!raw) return [];

    const parsed = JSON.parse(raw) as StoredTransaction[];
    // Filter out expired transactions
    const valid = parsed.filter((tx) => !isExpired(tx.timestamp));

    // If we filtered some out, save the cleaned list
    if (valid.length !== parsed.length) {
      localStorage.setItem(getStorageKey(address), JSON.stringify(valid));
    }

    return valid;
  } catch {
    return [];
  }
}

function saveTransactions(address: string, transactions: StoredTransaction[]): void {
  if (typeof window === "undefined" || !address) return;

  try {
    localStorage.setItem(getStorageKey(address), JSON.stringify(transactions));
  } catch (err) {
    console.warn("Failed to save transaction history:", err);
  }
}

export function useTransactionHistory(address: string | undefined) {
  const [transactions, setTransactions] = useState<StoredTransaction[]>([]);

  // Load transactions when address changes
  useEffect(() => {
    if (address) {
      setTransactions(loadTransactions(address));
    } else {
      setTransactions([]);
    }
  }, [address]);

  const addTransaction = useCallback(
    (tx: Omit<StoredTransaction, "timestamp">) => {
      if (!address) return;

      const newTx: StoredTransaction = {
        ...tx,
        timestamp: Date.now(),
      };

      setTransactions((prev) => {
        // Add to front, remove duplicates, limit to max
        const filtered = prev.filter((t) => t.txHash !== tx.txHash);
        const updated = [newTx, ...filtered].slice(0, MAX_TRANSACTIONS);
        saveTransactions(address, updated);
        return updated;
      });
    },
    [address]
  );

  const clearHistory = useCallback(() => {
    if (!address) return;
    setTransactions([]);
    localStorage.removeItem(getStorageKey(address));
  }, [address]);

  const removeTransaction = useCallback(
    (txHash: string) => {
      if (!address) return;

      setTransactions((prev) => {
        const updated = prev.filter((t) => t.txHash !== txHash);
        saveTransactions(address, updated);
        return updated;
      });
    },
    [address]
  );

  return {
    transactions,
    addTransaction,
    clearHistory,
    removeTransaction,
  };
}

// Helper to format relative time
export function formatRelativeTime(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
