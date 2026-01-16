import chainIconsJson from "../config/chain-icons.json";

// Import all chain icons dynamically
const iconModules = import.meta.glob("../assets/chain-icons/*", { eager: true, as: "url" });

// Build a map of filename to resolved URL
// e.g. "Ethereum.png" -> "/assets/Ethereum-12345.png"
const filenameToUrl: Record<string, string> = {};

for (const [path, url] of Object.entries(iconModules)) {
  // path is like "../assets/chain-icons/Ethereum.png"
  const filename = path.split('/').pop();
  if (filename) {
    filenameToUrl[filename] = url as string;
  }
}

// Chain ID to resolved icon URL
const CHAIN_ICONS: Record<number, string> = {};

for (const [chainId, jsonPath] of Object.entries(chainIconsJson)) {
  const id = Number(chainId);
  // jsonPath is like "/src/assets/chain-icons/Ethereum.png"
  const filename = jsonPath.split('/').pop();
  
  if (Number.isFinite(id) && filename && filenameToUrl[filename]) {
    CHAIN_ICONS[id] = filenameToUrl[filename];
  }
}

export function getChainIcon(chainId: number): string | undefined {
  return CHAIN_ICONS[chainId];
}
