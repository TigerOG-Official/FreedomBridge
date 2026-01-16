import { useState, useMemo } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Search, Copy, Check, ExternalLink, Layers, ShieldCheck, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { useTranslation } from "react-i18next";
import { useEnvironment } from "../context/EnvironmentContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";

// Helper component for copy button
function CopyButton({ text, className }: { text: string; className?: string }) {
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
      title={copied ? "Copied!" : "Copy address"}
    >
      {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

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

  // Filter tokens based on search
  const filteredTokens = useMemo(() => {
    return Object.entries(tokens).filter(([key, data]) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        key.toLowerCase().includes(searchLower) ||
        data.token.name.toLowerCase().includes(searchLower) ||
        data.token.symbol.toLowerCase().includes(searchLower)
      );
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
            <TabsList className="grid w-full grid-cols-3 lg:w-[300px]">
              <TabsTrigger value="overview">{t('contracts.tabs.overview', 'Overview')}</TabsTrigger>
              <TabsTrigger value="by-token">{t('contracts.tabs.byToken', 'By Token')}</TabsTrigger>
              <TabsTrigger value="by-chain">{t('contracts.tabs.byChain', 'By Chain')}</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
               <div className="grid md:grid-cols-3 gap-6">
                 <Card className="border-muted bg-card">
                   <CardHeader>
                     <CardTitle className="flex items-center gap-2">
                       <Globe className="w-5 h-5 text-blue-500" />
                       Interchain Tokens
                     </CardTitle>
                   </CardHeader>
                   <CardContent>
                     <p className="text-muted-foreground text-sm">
                       Omnichain-capable tokens deployed via Axelar Interchain Token Service (ITS). These tokens maintain consistent addresses across all supported networks.
                     </p>
                   </CardContent>
                 </Card>
                 
                 <Card className="border-muted bg-card">
                   <CardHeader>
                     <CardTitle className="flex items-center gap-2">
                       <Layers className="w-5 h-5 text-amber-500" />
                       Axelar Network
                     </CardTitle>
                   </CardHeader>
                   <CardContent>
                     <p className="text-muted-foreground text-sm">
                       The underlying messaging protocol that secures cross-chain transfers and ensures data integrity between different blockchains.
                     </p>
                   </CardContent>
                 </Card>

                 <Card className="border-muted bg-card">
                   <CardHeader>
                     <CardTitle className="flex items-center gap-2">
                       <ShieldCheck className="w-5 h-5 text-green-500" />
                       Migration Contracts
                     </CardTitle>
                   </CardHeader>
                   <CardContent>
                     <p className="text-muted-foreground text-sm">
                       Responsible for upgrading legacy tokens into new TigerOG interchain assets. These contracts handle the lock/mint or burn/mint logic on the origin chain.
                     </p>
                   </CardContent>
                 </Card>
               </div>
            </TabsContent>

            <TabsContent value="by-token" className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                 <Search className="w-4 h-4 text-muted-foreground" />
                 <Input 
                   placeholder="Filter tokens..." 
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
                        <CardDescription>Interchain Asset via Axelar ITS</CardDescription>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        Available on {Object.keys(data.chains).length} chains
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase bg-muted/50 border-b">
                          <tr>
                            <th className="px-6 py-3 font-medium text-muted-foreground">Chain</th>
                            <th className="px-6 py-3 font-medium text-muted-foreground">Token Address</th>
                            <th className="px-6 py-3 font-medium text-muted-foreground">Axelar Chain Name</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {Object.entries(data.chains).map(([chainId, chainData]) => (
                            <tr key={chainId} className="hover:bg-muted/10 transition-colors">
                              <td className="px-6 py-3 font-medium">
                                <div className="flex flex-col">
                                  <span>{getChainName(chainId)}</span>
                                  <span className="text-xs text-muted-foreground font-mono">ID: {chainId}</span>
                                </div>
                              </td>
                              <td className="px-6 py-3 font-mono text-xs">
                                <div className="flex items-center gap-2">
                                  {truncateAddress(chainData.tokenAddress)}
                                  {chainData.tokenAddress && (
                                    <CopyButton text={chainData.tokenAddress} />
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
                     const chainTokens = Object.entries(tokens).filter(([_, tData]) => tData.chains[Number(chainId)]);
                     
                     return (
                       <Card key={chainId} className="border-muted bg-card h-full">
                         <CardHeader className="pb-3 border-b border-border/40">
                           <CardTitle className="text-lg flex items-center gap-2">
                             {meta.chain.name}
                           </CardTitle>
                           <CardDescription className="font-mono text-xs">
                             Axelar ID: {meta.axelarChainName}
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
                                     <CopyButton text={cData.tokenAddress} className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
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
          </Tabs>

        </div>
      </main>
    </div>
  );
}