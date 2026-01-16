/**
 * Extracts a human-readable error message from various error types.
 * Handles wagmi/viem errors with shortMessage, standard Error objects,
 * and nested cause chains.
 */
export const extractErrorMessage = (err: unknown): string | undefined => {
  if (!err) {
    return undefined;
  }
  if (typeof err === "string") {
    return err;
  }
  if (typeof err === "object") {
    const maybeError = err as { shortMessage?: string; message?: string; cause?: unknown };
    return maybeError.shortMessage || maybeError.message || extractErrorMessage(maybeError.cause);
  }
  return undefined;
};
