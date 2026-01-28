import { useState, useMemo } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Search, Copy, Check, ExternalLink, Layers, ShieldCheck, Globe, Droplets } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { useTranslation } from "react-i18next";
import { useEnvironment } from "../context/EnvironmentContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";

// Chain icons
import BnbIcon from "../assets/chain-icons/BNB.png";
import EthereumIcon from "../assets/chain-icons/Ethereum.png";
import BaseIcon from "../assets/chain-icons/Base.png";
import LineaIcon from "../assets/chain-icons/Linea.png";
import XrpevmIcon from "../assets/chain-icons/Xrpevm.png";
import PolygonIcon from "../assets/chain-icons/Polygon.png";
import AvalancheIcon from "../assets/chain-icons/Avalanche.png";

// Map chain IDs to their icons
const CHAIN_ICONS: Record<number, string> = {
  56: BnbIcon,        // BNB Chain
  1: EthereumIcon,    // Ethereum
  8453: BaseIcon,     // Base
  59144: LineaIcon,   // Linea
  1440000: XrpevmIcon, // XRPL EVM
  137: PolygonIcon,   // Polygon
  43114: AvalancheIcon, // Avalanche
};

// Helper component for copy button
function CopyButton({ text, className, copiedText, copyText }: { text: string; className?: string; copiedText: string; copyText: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`text-muted-foreground hover:text-primary transition-colors ${className}`}
      title={copied ? copiedText : copyText}
    >
      {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

// Token display order
const TOKEN_ORDER = ['tigerog', 'lionog', 'frogog'];

// Conversion contracts on BSC (chainId 56)
const CONVERSION_CONTRACTS = [
  {
    id: "tigerog",
    name: "TigerOG",
    symbol: "TIGEROG",
    legacyName: "BNBTiger",
    legacySymbol: "BNBTIGER",
    legacyAddress: "0xAC68931B666E086E9de380CFDb0Fb5704a35dc2D",
    conversionAddress: "0x18b2AeD6Aa6aE20A70be57739F8B5C26706Ff2af",
    newAddress: "0xCF7Fc0De71238c9EC45EC2Fd24FDc8521345dbB5",
  },
  {
    id: "lionog",
    name: "LionOG",
    symbol: "LIONOG",
    legacyName: "BNBLion",
    legacySymbol: "BNBLION",
    legacyAddress: "0xdA1689C5557564d06E2A546F8FD47350b9D44a73",
    conversionAddress: "0x4272b9EeBde520Dfb9cFc3C16bBfc8d3868b467b",
    newAddress: "0x6731F2d7ADF86cfba30d15c4D10113Ce98f3492A",
  },
  {
    id: "frogog",
    name: "FrogOG",
    symbol: "FROGOG",
    legacyName: "BNBFrog",
    legacySymbol: "BNBFROG",
    legacyAddress: "0x64da67A12a46f1DDF337393e2dA12eD0A507Ad3D",
    conversionAddress: "0xbF4b1F662247147afCefecbdEa5590fd103dF1FB",
    newAddress: "0x0E3b564bdD09348840811C7e1106BbD0e98b5b4f",
  },
];

// Liquidity pools
const LIQUIDITY_POOLS = [
  // TigerOG
  {
    token: "TigerOG",
    chainId: 56,
    chainName: "BNB Chain",
    dex: "PancakeSwap",
    poolAddress: "0x26ceae47acb9aab7c70b7021e6e5118dd1da1fb3",
    explorerUrl: "https://bscscan.com/address/0x26ceae47acb9aab7c70b7021e6e5118dd1da1fb3",
    dexUrl: "https://pancakeswap.finance/info/v2/pairs/0x26ceae47acb9aab7c70b7021e6e5118dd1da1fb3",
  },
  {
    token: "TigerOG",
    chainId: 1,
    chainName: "Ethereum",
    dex: "Uniswap",
    poolAddress: "0x0f29973c9117f287177efa54d0feb371cf578885",
    explorerUrl: "https://etherscan.io/address/0x0f29973c9117f287177efa54d0feb371cf578885",
    dexUrl: "https://app.uniswap.org/explore/pools/ethereum/0x0f29973c9117f287177efa54d0feb371cf578885",
  },
  {
    token: "TigerOG",
    chainId: 8453,
    chainName: "Base",
    dex: "Uniswap",
    poolAddress: "0x6b9667bf054d3d7f48c411b261e35a0dff3c5d77",
    explorerUrl: "https://basescan.org/address/0x6b9667bf054d3d7f48c411b261e35a0dff3c5d77",
    dexUrl: "https://app.uniswap.org/explore/pools/base/0x6b9667bf054d3d7f48c411b261e35a0dff3c5d77",
  },
  // LionOG
  {
    token: "LionOG",
    chainId: 56,
    chainName: "BNB Chain",
    dex: "PancakeSwap",
    poolAddress: "0xec5c0d52feddd893569bd07ff1fa1b9703b04a7c",
    explorerUrl: "https://bscscan.com/address/0xec5c0d52feddd893569bd07ff1fa1b9703b04a7c",
    dexUrl: "https://pancakeswap.finance/info/v2/pairs/0xec5c0d52feddd893569bd07ff1fa1b9703b04a7c",
  },
  {
    token: "LionOG",
    chainId: 1,
    chainName: "Ethereum",
    dex: "Uniswap",
    poolAddress: "0x20f0f72f518026ef8c11401fb12ab0bcae85ce87",
    explorerUrl: "https://etherscan.io/address/0x20f0f72f518026ef8c11401fb12ab0bcae85ce87",
    dexUrl: "https://app.uniswap.org/explore/pools/ethereum/0x20f0f72f518026ef8c11401fb12ab0bcae85ce87",
  },
  {
    token: "LionOG",
    chainId: 8453,
    chainName: "Base",
    dex: "Uniswap",
    poolAddress: "0x5a6d4769463c8aeb188aa45363f999a6f807e9e9",
    explorerUrl: "https://basescan.org/address/0x5a6d4769463c8aeb188aa45363f999a6f807e9e9",
    dexUrl: "https://app.uniswap.org/explore/pools/base/0x5a6d4769463c8aeb188aa45363f999a6f807e9e9",
  },
  // FrogOG
  {
    token: "FrogOG",
    chainId: 56,
    chainName: "BNB Chain",
    dex: "PancakeSwap",
    poolAddress: "0x575c344853bc3d258b4c2d1e57b93aa26a457350",
    explorerUrl: "https://bscscan.com/address/0x575c344853bc3d258b4c2d1e57b93aa26a457350",
    dexUrl: "https://pancakeswap.finance/info/v2/pairs/0x575c344853bc3d258b4c2d1e57b93aa26a457350",
  },
  {
    token: "FrogOG",
    chainId: 1,
    chainName: "Ethereum",
    dex: "Uniswap",
    poolAddress: "0xc92a638a4e29d05caa40a201fb0c92acd83ef805",
    explorerUrl: "https://etherscan.io/address/0xc92a638a4e29d05caa40a201fb0c92acd83ef805",
    dexUrl: "https://app.uniswap.org/explore/pools/ethereum/0xc92a638a4e29d05caa40a201fb0c92acd83ef805",
  },
  {
    token: "FrogOG",
    chainId: 8453,
    chainName: "Base",
    dex: "Uniswap",
    poolAddress: "0x2524ec2b91a6566a6df0260a8a80989e4b556cb4",
    explorerUrl: "https://basescan.org/address/0x2524ec2b91a6566a6df0260a8a80989e4b556cb4",
    dexUrl: "https://app.uniswap.org/explore/pools/base/0x2524ec2b91a6566a6df0260a8a80989e4b556cb4",
  },
];

export default function ContractsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { tokens, chainMetadata } = useEnvironment();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // Helper to get chain name
  const getChainName = (chainId: number | string) => {
    return chainMetadata[Number(chainId)]?.chain.name || `Chain ID ${chainId}`;
  };

  // Helper to truncate address
  const truncateAddress = (address?: string) => {
    if (!address) return "-";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Filter and sort tokens based on search
  const filteredTokens = useMemo(() => {
    const filtered = Object.entries(tokens).filter(([key, data]) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        key.toLowerCase().includes(searchLower) ||
        data.token.name.toLowerCase().includes(searchLower) ||
        data.token.symbol.toLowerCase().includes(searchLower)
      );
    });
    // Sort by TOKEN_ORDER
    return filtered.sort((a, b) => {
      const indexA = TOKEN_ORDER.indexOf(a[0].toLowerCase());
      const indexB = TOKEN_ORDER.indexOf(b[0].toLowerCase());
      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }, [tokens, searchQuery]);

  return (
    <div 
      className="min-h-screen transition-colors duration-300"
      style={{ 
        background: 'var(--theme-bg)', 
        color: 'var(--theme-text-primary)',
        fontFamily: 'var(--font-body)'
      }}
    >
      {/* Header */}
      <header 
        className="sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-300"
        style={{ 
          backgroundColor: 'var(--theme-navbar-bg)', 
          borderColor: 'var(--theme-navbar-border)' 
        }}
      >
        <div className="container flex h-14 max-w-screen-2xl items-center">
          <Button
            variant="ghost"
            size="sm"
            className="mr-4 hover:bg-transparent hover:text-[var(--primary)]"
            onClick={() => navigate("/")}
            style={{ color: 'var(--theme-text-secondary)' }}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('common.backToApp')}
          </Button>
          <div className="mr-4 flex">
            <span 
              className="font-bold sm:inline-block"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {t('contracts.title', 'Contract Addresses')}
            </span>
          </div>
        </div>
      </header>

      <main className="container max-w-screen-xl mx-auto py-10 px-4 md:px-8">
        <div className="space-y-8">
          
          <section className="space-y-4">
            <h1 
              className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--theme-text-primary)' }}
            >
              {t('contracts.header.title', 'Smart Contracts')}
            </h1>
            <p className="text-xl max-w-2xl" style={{ color: 'var(--theme-text-secondary)' }}>
              {t('contracts.header.subtitle', 'Official deployment addresses for tokens and bridges across the Freedom Bridge ecosystem.')}
            </p>
          </section>

          <Tabs defaultValue="overview" className="space-y-6" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
              <TabsTrigger value="overview">{t('contracts.tabs.overview', 'Overview')}</TabsTrigger>
              <TabsTrigger value="by-token">{t('contracts.tabs.byToken', 'By Token')}</TabsTrigger>
              <TabsTrigger value="by-chain">{t('contracts.tabs.byChain', 'By Chain')}</TabsTrigger>
              <TabsTrigger value="liquidity">{t('contracts.tabs.liquidity', 'Liquidity')}</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
               <div className="grid md:grid-cols-3 gap-6">
                 <Card className="border-muted bg-card">
                   <CardHeader>
                     <CardTitle className="flex items-center gap-2">
                       <Globe className="w-5 h-5 text-blue-500" />
                       {t('contracts.overview.interchainTokens.title')}
                     </CardTitle>
                   </CardHeader>
                   <CardContent>
                     <p className="text-muted-foreground text-sm">
                       {t('contracts.overview.interchainTokens.description')}
                     </p>
                   </CardContent>
                 </Card>

                 <Card className="border-muted bg-card">
                   <CardHeader>
                     <CardTitle className="flex items-center gap-2">
                       <Layers className="w-5 h-5 text-amber-500" />
                       {t('contracts.overview.axelarNetwork.title')}
                     </CardTitle>
                   </CardHeader>
                   <CardContent>
                     <p className="text-muted-foreground text-sm">
                       {t('contracts.overview.axelarNetwork.description')}
                     </p>
                   </CardContent>
                 </Card>

                 <Card className="border-muted bg-card">
                   <CardHeader>
                     <CardTitle className="flex items-center gap-2">
                       <ShieldCheck className="w-5 h-5 text-green-500" />
                       {t('contracts.overview.conversionContracts.title')}
                     </CardTitle>
                   </CardHeader>
                   <CardContent>
                     <p className="text-muted-foreground text-sm">
                       {t('contracts.overview.conversionContracts.description')}
                     </p>
                   </CardContent>
                 </Card>
               </div>

               {/* Conversion Contracts Table */}
               <Card className="overflow-hidden border-muted bg-card">
                 <CardHeader className="bg-muted/20 pb-4">
                   <CardTitle className="text-xl">{t('contracts.overview.conversionContractsTable.title')}</CardTitle>
                   <CardDescription>{t('contracts.overview.conversionContractsTable.subtitle')}</CardDescription>
                 </CardHeader>
                 <CardContent className="p-0">
                   <div className="overflow-x-auto">
                     <table className="w-full text-sm text-left">
                       <thead className="text-xs uppercase bg-muted/50 border-b">
                         <tr>
                           <th className="px-6 py-3 font-medium text-muted-foreground">{t('contracts.overview.conversionContractsTable.token')}</th>
                           <th className="px-6 py-3 font-medium text-muted-foreground">{t('contracts.overview.conversionContractsTable.legacyToken')}</th>
                           <th className="px-6 py-3 font-medium text-muted-foreground">{t('contracts.overview.conversionContractsTable.conversionContract')}</th>
                           <th className="px-6 py-3 font-medium text-muted-foreground">{t('contracts.overview.conversionContractsTable.newToken')}</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-border">
                         {CONVERSION_CONTRACTS.map((contract) => (
                           <tr key={contract.id} className="hover:bg-muted/10 transition-colors">
                             <td className="px-6 py-3 font-medium">
                               <div className="flex flex-col">
                                 <span>{contract.name}</span>
                                 <span className="text-xs text-muted-foreground">{contract.symbol}</span>
                               </div>
                             </td>
                             <td className="px-6 py-3 font-mono text-xs">
                               <div className="flex flex-col gap-1">
                                 <span className="text-muted-foreground">{contract.legacyName}</span>
                                 <div className="flex items-center gap-2">
                                   {truncateAddress(contract.legacyAddress)}
                                   <CopyButton text={contract.legacyAddress} copiedText={t('contracts.copied')} copyText={t('contracts.copyAddress')} />
                                   <a href={`https://bscscan.com/address/${contract.legacyAddress}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                                     <ExternalLink className="w-3 h-3" />
                                   </a>
                                 </div>
                               </div>
                             </td>
                             <td className="px-6 py-3 font-mono text-xs">
                               <div className="flex items-center gap-2">
                                 {truncateAddress(contract.conversionAddress)}
                                 <CopyButton text={contract.conversionAddress} copiedText={t('contracts.copied')} copyText={t('contracts.copyAddress')} />
                                 <a href={`https://bscscan.com/address/${contract.conversionAddress}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                                   <ExternalLink className="w-3 h-3" />
                                 </a>
                               </div>
                             </td>
                             <td className="px-6 py-3 font-mono text-xs">
                               <div className="flex items-center gap-2">
                                 {truncateAddress(contract.newAddress)}
                                 <CopyButton text={contract.newAddress} copiedText={t('contracts.copied')} copyText={t('contracts.copyAddress')} />
                                 <a href={`https://bscscan.com/address/${contract.newAddress}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                                   <ExternalLink className="w-3 h-3" />
                                 </a>
                               </div>
                             </td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                 </CardContent>
               </Card>

            </TabsContent>

            <TabsContent value="by-token" className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                 <Search className="w-4 h-4 text-muted-foreground" />
                 <Input
                   placeholder={t('contracts.filterTokens')}
                   className="max-w-xs"
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                 />
              </div>

              {filteredTokens.map(([key, data]) => (
                <Card key={key} className="overflow-hidden border-muted bg-card">
                  <CardHeader className="bg-muted/20 pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">{data.token.name} ({data.token.symbol})</CardTitle>
                        <CardDescription>{t('contracts.interchainAsset')}</CardDescription>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        {t('contracts.availableOnChains', { count: Object.keys(data.chains).length })}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase bg-muted/50 border-b">
                          <tr>
                            <th className="px-6 py-3 font-medium text-muted-foreground">{t('contracts.table.chain')}</th>
                            <th className="px-6 py-3 font-medium text-muted-foreground">{t('contracts.table.tokenAddress')}</th>
                            <th className="px-6 py-3 font-medium text-muted-foreground">{t('contracts.table.axelarChainName')}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {Object.entries(data.chains).map(([chainId, chainData]) => (
                            <tr key={chainId} className="hover:bg-muted/10 transition-colors">
                              <td className="px-6 py-3 font-medium">
                                <div className="flex items-center gap-3">
                                  {CHAIN_ICONS[Number(chainId)] && (
                                    <img
                                      src={CHAIN_ICONS[Number(chainId)]}
                                      alt={getChainName(chainId)}
                                      className="w-6 h-6 rounded-full"
                                    />
                                  )}
                                  <div className="flex flex-col">
                                    <span>{getChainName(chainId)}</span>
                                    <span className="text-xs text-muted-foreground font-mono">{t('contracts.table.chainId', { id: chainId })}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-3 font-mono text-xs">
                                <div className="flex items-center gap-2">
                                  {truncateAddress(chainData.tokenAddress)}
                                  {chainData.tokenAddress && (
                                    <CopyButton text={chainData.tokenAddress} copiedText={t('contracts.copied')} copyText={t('contracts.copyAddress')} />
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-3 text-xs">
                                <span className="px-2 py-1 rounded bg-muted/50 font-mono">
                                  {chainData.axelarChainName}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="by-chain" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                 {Object.entries(chainMetadata)
                   .sort((a, b) => a[1].chain.name.localeCompare(b[1].chain.name))
                   .map(([chainId, meta]) => {
                     const chainTokens = Object.entries(tokens)
                       .filter(([_, tData]) => tData.chains[Number(chainId)])
                       .sort((a, b) => {
                         const indexA = TOKEN_ORDER.indexOf(a[0].toLowerCase());
                         const indexB = TOKEN_ORDER.indexOf(b[0].toLowerCase());
                         if (indexA === -1 && indexB === -1) return 0;
                         if (indexA === -1) return 1;
                         if (indexB === -1) return -1;
                         return indexA - indexB;
                       });

                     return (
                       <Card key={chainId} className="border-muted bg-card h-full">
                         <CardHeader className="pb-3 border-b border-border/40">
                           <CardTitle className="text-lg flex items-center gap-2">
                             {CHAIN_ICONS[Number(chainId)] && (
                               <img
                                 src={CHAIN_ICONS[Number(chainId)]}
                                 alt={meta.chain.name}
                                 className="w-6 h-6 rounded-full"
                               />
                             )}
                             {meta.chain.name}
                           </CardTitle>
                           <CardDescription className="font-mono text-xs">
                             {t('contracts.axelarId', { name: meta.axelarChainName })}
                           </CardDescription>
                         </CardHeader>
                         <CardContent className="pt-4 space-y-4">
                           {chainTokens.map(([tokenKey, tData]) => {
                             const cData = tData.chains[Number(chainId)];
                             return (
                               <div key={tokenKey} className="space-y-1">
                                 <div className="font-medium text-sm text-foreground flex justify-between">
                                   <span>{tData.token.name}</span>
                                   <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{tData.token.symbol}</span>
                                 </div>
                                 <div className="text-xs font-mono bg-muted/30 p-2 rounded border border-border/50 flex justify-between items-center group">
                                   <span className="truncate">{cData.tokenAddress}</span>
                                   {cData.tokenAddress && (
                                     <CopyButton text={cData.tokenAddress} className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity" copiedText={t('contracts.copied')} copyText={t('contracts.copyAddress')} />
                                   )}
                                 </div>
                               </div>
                             );
                           })}
                         </CardContent>
                       </Card>
                     );
                   })}
              </div>
            </TabsContent>

            <TabsContent value="liquidity" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {LIQUIDITY_POOLS.map((pool, index) => (
                  <Card key={index} className="border-muted bg-card h-full">
                    <CardHeader className="pb-3 border-b border-border/40">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {CHAIN_ICONS[pool.chainId] && (
                          <img
                            src={CHAIN_ICONS[pool.chainId]}
                            alt={pool.chainName}
                            className="w-6 h-6 rounded-full"
                          />
                        )}
                        {pool.token} on {pool.chainName}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {pool.dex}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                      <div className="space-y-1">
                        <div className="font-medium text-sm text-foreground flex justify-between">
                          <span>{t('contracts.liquidity.poolAddress', 'Pool Address')}</span>
                        </div>
                        <div className="text-xs font-mono bg-muted/30 p-2 rounded border border-border/50 flex justify-between items-center group">
                          <span className="truncate">{pool.poolAddress}</span>
                          <CopyButton text={pool.poolAddress} className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity" copiedText={t('contracts.copied')} copyText={t('contracts.copyAddress')} />
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <a
                          href={pool.dexUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                        >
                          <Droplets className="w-4 h-4" />
                          {t('contracts.liquidity.tradeOn', 'Trade on')} {pool.dex}
                        </a>
                        <a
                          href={pool.explorerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md border border-border hover:bg-muted/50 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

        </div>
      </main>
    </div>
  );
}