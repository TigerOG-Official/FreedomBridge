export const resolvePublicUrl = (assetPath: string): string => {
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(assetPath)) {
    return assetPath;
  }

  const normalizedPath = assetPath.replace(/^\/+/, "");
  const baseUrl = new URL(import.meta.env.BASE_URL, window.location.href);
  return new URL(normalizedPath, baseUrl).toString();
};
