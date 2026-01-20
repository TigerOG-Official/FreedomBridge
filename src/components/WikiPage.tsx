import { motion } from "motion/react";
import { ArrowLeft, Search, Book, Code, Zap, Globe2, ShieldCheck, Link as LinkIcon, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { useState } from "react";
import { useTranslation, Trans } from "react-i18next";
import chainsConfig from "../config/chains.json";

type ChainConfig = {
  name: string;
  network: string;
  testnet: boolean;
};

const chains = chainsConfig as Record<string, ChainConfig>;

export default function WikiPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    {
      id: "getting-started",
      title: t('wiki.nav.gettingStarted'),
      icon: <RocketIcon className="w-5 h-5" />,
      articles: [
        { title: t('wiki.articles.whatIs.title'), link: "#what-is-freedom-bridge" },
        { title: t('wiki.articles.howToConvert.title'), link: "#how-to-convert" },
        { title: t('wiki.articles.supportedNetworks.title'), link: "#supported-networks" },
      ]
    },
    {
      id: "core-concepts",
      title: t('wiki.nav.coreConcepts'),
      icon: <Book className="w-5 h-5" />,
      articles: [
        { title: t('wiki.articles.xerc20.title'), link: "#interchain-tokens" },
        { title: t('wiki.articles.axelar.title'), link: "#axelar" },
        { title: t('wiki.articles.conversion.title'), link: "#conversion-logic" },
        { title: t('wiki.nav.tigerogSupply'), link: "#tigerog-supply" },
        { title: t('wiki.nav.lionogSupply'), link: "#lionog-supply" },
        { title: t('wiki.nav.frogogSupply'), link: "#frogog-supply" },
      ]
    },
    {
      id: "developers",
      title: t('wiki.nav.developers'),
      icon: <Code className="w-5 h-5" />,
      articles: [
        { title: t('wiki.articles.security.title'), link: "#security" },
        { title: t('wiki.nav.githubRepo'), link: "https://github.com/TigerOG-Official/FreedomBridge", external: true },
        { title: t('wiki.nav.axelarDocs'), link: "https://docs.axelar.dev/dev/send-tokens/interchain-tokens/intro/", external: true },
      ]
    }
  ];

  const filteredCategories = searchQuery
    ? categories.map(cat => ({
        ...cat,
        articles: cat.articles.filter(article => 
          article.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(cat => cat.articles.length > 0)
    : categories;

  const scrollToSection = (id: string) => {
    const elementId = id.replace('#', '');
    const element = document.getElementById(elementId);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      
      // Update URL without jumping
      window.history.pushState(null, "", id);
    }
  };

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
          <div className="mr-4 hidden md:flex">
            <span 
              className="font-bold sm:inline-block"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {t('wiki.title')}
            </span>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4" style={{ color: 'var(--theme-text-muted)' }} />
                <input
                  placeholder={t('wiki.searchPlaceholder')}
                  className="flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 pl-8 md:w-[300px]"
                  style={{ 
                    backgroundColor: 'var(--theme-input-bg)',
                    borderColor: 'var(--theme-input-border)',
                    color: 'var(--theme-text-primary)'
                  }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-screen-xl mx-auto py-10 px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-10">
          
          {/* Sidebar Navigation */}
          <aside className="hidden md:block space-y-6 sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto">
            {filteredCategories.map((category) => (
              <div key={category.id}>
                <h4 
                  className="mb-2 px-2 text-sm font-semibold flex items-center gap-2"
                  style={{ color: 'var(--theme-text-primary)', fontFamily: 'var(--font-display)' }}
                >
                  {category.icon}
                  {category.title}
                </h4>
                <div className="grid grid-flow-row auto-rows-max text-sm">
                  {category.articles.map((article) => (
                    'external' in article && article.external ? (
                      <a
                        key={article.title}
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex w-full items-center gap-1 rounded-md border border-transparent px-2 py-1.5 hover:underline text-left transition-colors cursor-pointer"
                        style={{ color: 'var(--theme-text-secondary)' }}
                      >
                        {article.title}
                        <ExternalLink className="w-3 h-3 opacity-50" />
                      </a>
                    ) : (
                      <button
                        key={article.title}
                        onClick={() => scrollToSection(article.link)}
                        className="group flex w-full items-center rounded-md border border-transparent px-2 py-1.5 hover:underline text-left transition-colors cursor-pointer"
                        style={{ color: 'var(--theme-text-secondary)' }}
                      >
                        {article.title}
                      </button>
                    )
                  ))}
                </div>
              </div>
            ))}
          </aside>

          {/* Main Content Area */}
          <div className="space-y-12">
            
            {/* Hero for Wiki */}
            <section 
              className="space-y-4 pb-8 border-b"
              style={{ borderColor: 'var(--theme-section-border)' }}
            >
              <h1 
                className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--theme-text-primary)' }}
              >
                {t('wiki.header.title')}
              </h1>
              <p className="text-xl" style={{ color: 'var(--theme-text-secondary)' }}>
                {t('wiki.header.subtitle')}
              </p>
            </section>

            {/* Content Sections */}
            <div className="space-y-10">
              
              <section id="what-is-freedom-bridge" className="space-y-4 scroll-mt-24">
                <h2 
                  className="text-2xl font-bold tracking-tight"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--theme-text-primary)' }}
                >
                  {t('wiki.articles.whatIs.title')}
                </h2>
                <p className="leading-7" style={{ color: 'var(--theme-text-secondary)' }}>
                  <Trans i18nKey="wiki.articles.whatIs.content" values={{ count: Object.keys(chains).length }} />
                </p>
                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                  <div 
                    className="p-4 rounded-lg border shadow-sm transition-colors"
                    style={{ 
                      backgroundColor: 'var(--theme-card-bg)', 
                      borderColor: 'var(--theme-card-border)' 
                    }}
                  >
                    <div className="flex items-center gap-2 font-semibold mb-2" style={{ color: 'var(--theme-text-primary)' }}>
                      <Zap className="w-4 h-4 text-amber-500" />
                      {t('wiki.articles.whatIs.taxFreeTitle')}
                    </div>
                    <p className="text-sm" style={{ color: 'var(--theme-text-muted)' }}>
                      {t('wiki.articles.whatIs.taxFreeDesc')}
                    </p>
                  </div>
                  <div 
                    className="p-4 rounded-lg border shadow-sm transition-colors"
                    style={{ 
                      backgroundColor: 'var(--theme-card-bg)', 
                      borderColor: 'var(--theme-card-border)' 
                    }}
                  >
                    <div className="flex items-center gap-2 font-semibold mb-2" style={{ color: 'var(--theme-text-primary)' }}>
                      <Globe2 className="w-4 h-4 text-blue-500" />
                      {t('wiki.articles.whatIs.omnichainTitle')}
                    </div>
                    <p className="text-sm" style={{ color: 'var(--theme-text-muted)' }}>
                      {t('wiki.articles.whatIs.omnichainDesc', { count: Object.keys(chains).length })}
                    </p>
                  </div>
                </div>
              </section>

                            <section id="how-to-convert" className="space-y-4 scroll-mt-24">
                              <h2 
                                className="text-2xl font-bold tracking-tight"
                                style={{ fontFamily: 'var(--font-display)', color: 'var(--theme-text-primary)' }}
                              >
                                {t('wiki.articles.howToConvert.title')}
                              </h2>
                              <ol className="list-decimal list-inside space-y-2 ml-4" style={{ color: 'var(--theme-text-secondary)' }}>
                                <li>{t('wiki.articles.howToConvert.step1')}</li>
                                <li><Trans i18nKey="wiki.articles.howToConvert.step2" /></li>
                                <li>{t('wiki.articles.howToConvert.step3')}</li>
                                <li>{t('wiki.articles.howToConvert.step4')}</li>
                                <li><Trans i18nKey="wiki.articles.howToConvert.step5" /></li>
                              </ol>
                              <div 
                                className="p-4 rounded-md border-l-4 mt-4"
                                style={{
                                  backgroundColor: 'var(--theme-section-bg)', 
                                  borderColor: 'var(--primary)',
                                  color: 'var(--theme-text-secondary)'
                                }}
                              >
                                <p className="text-sm">
                                  <Trans i18nKey="wiki.articles.howToConvert.note" />
                                </p>
                              </div>
                            </section>
              
                            <section id="supported-networks" className="space-y-4 scroll-mt-24">
                              <h2 
                                className="text-2xl font-bold tracking-tight"
                                style={{ fontFamily: 'var(--font-display)', color: 'var(--theme-text-primary)' }}
                              >
                                {t('wiki.articles.supportedNetworks.title')}
                              </h2>
                              <p className="leading-7" style={{ color: 'var(--theme-text-secondary)' }}>
                                {t('wiki.articles.supportedNetworks.content', { count: Object.keys(chains).length })}
                              </p>
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
                                {Object.values(chains).sort((a,b) => a.name.localeCompare(b.name)).map(chain => (
                                  <div key={chain.name} className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]"></span>
                                    {chain.name}
                                  </div>
                                ))}
                              </div>
                            </section>
              
                            <section id="interchain-tokens" className="space-y-4 scroll-mt-24">
                              <h2 
                                className="text-2xl font-bold tracking-tight"
                                style={{ fontFamily: 'var(--font-display)', color: 'var(--theme-text-primary)' }}
                              >
                                {t('wiki.articles.xerc20.title')}
                              </h2>
                              <p className="leading-7" style={{ color: 'var(--theme-text-secondary)' }}>
                                <Trans i18nKey="wiki.articles.xerc20.content" />
                              </p>
                            </section>
              
                            <section id="axelar" className="space-y-4 scroll-mt-24">
                              <h2 
                                className="text-2xl font-bold tracking-tight"
                                style={{ fontFamily: 'var(--font-display)', color: 'var(--theme-text-primary)' }}
                              >
                                {t('wiki.articles.axelar.title')}
                              </h2>
                              <p className="leading-7" style={{ color: 'var(--theme-text-secondary)' }}>
                                {t('wiki.articles.axelar.content')}
                              </p>
                            </section>
              
                            <section id="conversion-logic" className="space-y-4 scroll-mt-24">
                              <h2
                                className="text-2xl font-bold tracking-tight"
                                style={{ fontFamily: 'var(--font-display)', color: 'var(--theme-text-primary)' }}
                              >
                                {t('wiki.articles.conversion.title')}
                              </h2>
                              <p className="leading-7" style={{ color: 'var(--theme-text-secondary)' }}>
                                {t('wiki.articles.conversion.content')}
                              </p>
                            </section>

                            {/* TigerOG Supply Section */}
                            <section id="tigerog-supply" className="space-y-4 scroll-mt-24">
                              <h2
                                className="text-2xl font-bold tracking-tight"
                                style={{ fontFamily: 'var(--font-display)', color: 'var(--theme-text-primary)' }}
                              >
                                {t('wiki.articles.tigerogSupply.title')}
                              </h2>
                              <p className="leading-7" style={{ color: 'var(--theme-text-secondary)' }}>
                                {t('wiki.articles.tigerogSupply.intro')}
                              </p>

                              <div
                                className="overflow-x-auto rounded-lg border"
                                style={{ borderColor: 'var(--theme-card-border)' }}
                              >
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr style={{ backgroundColor: 'var(--theme-section-bg)' }}>
                                      <th className="text-left p-3 font-semibold" style={{ color: 'var(--theme-text-primary)' }}>{t('wiki.articles.supplyCommon.table.category')}</th>
                                      <th className="text-right p-3 font-semibold" style={{ color: 'var(--theme-text-primary)' }}>{t('wiki.articles.supplyCommon.table.amount')}</th>
                                      <th className="text-right p-3 font-semibold" style={{ color: 'var(--theme-text-primary)' }}>{t('wiki.articles.supplyCommon.table.percentOfTotal')}</th>
                                    </tr>
                                  </thead>
                                  <tbody style={{ color: 'var(--theme-text-secondary)' }}>
                                    <tr style={{ borderTop: '1px solid var(--theme-card-border)' }}>
                                      <td className="p-3">{t('wiki.articles.supplyCommon.table.originalSupply')}</td>
                                      <td className="text-right p-3 font-mono">{t('wiki.articles.tigerogSupply.amounts.original')}</td>
                                      <td className="text-right p-3">100%</td>
                                    </tr>
                                    <tr style={{ borderTop: '1px solid var(--theme-card-border)', backgroundColor: 'var(--theme-section-bg)' }}>
                                      <td className="p-3 text-red-500">{t('wiki.articles.supplyCommon.table.deadAddress')}</td>
                                      <td className="text-right p-3 font-mono">{t('wiki.articles.tigerogSupply.amounts.dead')}</td>
                                      <td className="text-right p-3">{t('wiki.articles.tigerogSupply.amounts.deadPercent')}</td>
                                    </tr>
                                    <tr style={{ borderTop: '1px solid var(--theme-card-border)' }}>
                                      <td className="p-3 text-red-500">{t('wiki.articles.supplyCommon.table.contractBalance')}</td>
                                      <td className="text-right p-3 font-mono">{t('wiki.articles.tigerogSupply.amounts.contract')}</td>
                                      <td className="text-right p-3">{t('wiki.articles.tigerogSupply.amounts.contractPercent')}</td>
                                    </tr>
                                    <tr style={{ borderTop: '1px solid var(--theme-card-border)', backgroundColor: 'var(--theme-section-bg)' }}>
                                      <td className="p-3 text-red-500">{t('wiki.articles.tigerogSupply.lpLocked')}</td>
                                      <td className="text-right p-3 font-mono">{t('wiki.articles.tigerogSupply.amounts.lp')}</td>
                                      <td className="text-right p-3">{t('wiki.articles.tigerogSupply.amounts.lpPercent')}</td>
                                    </tr>
                                    <tr style={{ borderTop: '2px solid var(--theme-card-border)', fontWeight: 'bold' }}>
                                      <td className="p-3" style={{ color: 'var(--primary)' }}>{t('wiki.articles.supplyCommon.table.circulatingSupply')}</td>
                                      <td className="text-right p-3 font-mono" style={{ color: 'var(--primary)' }}>{t('wiki.articles.tigerogSupply.amounts.circulating')}</td>
                                      <td className="text-right p-3" style={{ color: 'var(--primary)' }}>{t('wiki.articles.tigerogSupply.amounts.circulatingPercent')}</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>

                              <h3
                                className="text-xl font-semibold mt-6"
                                style={{ fontFamily: 'var(--font-display)', color: 'var(--theme-text-primary)' }}
                              >
                                {t('wiki.articles.supplyCommon.howWeCalculated')}
                              </h3>

                              <div className="space-y-4" style={{ color: 'var(--theme-text-secondary)' }}>
                                <div
                                  className="p-4 rounded-lg border"
                                  style={{ backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-card-border)' }}
                                >
                                  <h4 className="font-semibold mb-2" style={{ color: 'var(--theme-text-primary)' }}>{t('wiki.articles.supplyCommon.deadAddressTitle')}</h4>
                                  <p className="text-sm">
                                    <Trans i18nKey="wiki.articles.tigerogSupply.deadAddressDesc" components={{ code: <code className="px-1 py-0.5 rounded" style={{ backgroundColor: 'var(--theme-section-bg)' }} /> }} />
                                  </p>
                                </div>

                                <div
                                  className="p-4 rounded-lg border"
                                  style={{ backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-card-border)' }}
                                >
                                  <h4 className="font-semibold mb-2" style={{ color: 'var(--theme-text-primary)' }}>{t('wiki.articles.supplyCommon.contractBalanceTitle')}</h4>
                                  <p className="text-sm">{t('wiki.articles.tigerogSupply.contractBalanceDesc')}</p>
                                </div>

                                <div
                                  className="p-4 rounded-lg border"
                                  style={{ backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-card-border)' }}
                                >
                                  <h4 className="font-semibold mb-2" style={{ color: 'var(--theme-text-primary)' }}>{t('wiki.articles.supplyCommon.lpLockedTitle')}</h4>
                                  <p className="text-sm mb-2">{t('wiki.articles.tigerogSupply.lpLockedDesc')}</p>
                                  <ul className="text-sm list-disc list-inside space-y-1 ml-2">
                                    <li>{t('wiki.articles.tigerogSupply.lpBurnedPercent')}</li>
                                    <li>{t('wiki.articles.tigerogSupply.lpLockedPercent')}</li>
                                  </ul>
                                </div>
                              </div>

                              <div
                                className="p-4 rounded-md border-l-4 mt-4"
                                style={{
                                  backgroundColor: 'var(--theme-section-bg)',
                                  borderColor: 'var(--primary)',
                                  color: 'var(--theme-text-secondary)'
                                }}
                              >
                                <p className="text-sm">
                                  <Trans i18nKey="wiki.articles.tigerogSupply.note" />
                                </p>
                                <p className="text-sm mt-2">
                                  <Trans i18nKey="wiki.articles.tigerogSupply.launchData" />
                                </p>
                              </div>

                              <h3
                                className="text-xl font-semibold mt-6"
                                style={{ fontFamily: 'var(--font-display)', color: 'var(--theme-text-primary)' }}
                              >
                                {t('wiki.articles.supplyCommon.verification')}
                              </h3>
                              <p className="leading-7" style={{ color: 'var(--theme-text-secondary)' }}>
                                {t('wiki.articles.supplyCommon.verificationDesc')}
                              </p>
                              <ul className="list-disc list-inside space-y-2 ml-4 text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
                                <li>
                                  <a
                                    href="https://bscscan.com/token/0xAC68931B666E086E9de380CFDb0Fb5704a35dc2D"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="underline hover:text-[var(--primary)]"
                                  >
                                    {t('wiki.articles.tigerogSupply.legacyContract')}
                                  </a>
                                </li>
                                <li>
                                  <a
                                    href="https://bscscan.com/token/0xCF7Fc0De71238c9EC45EC2Fd24FDc8521345dbB5"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="underline hover:text-[var(--primary)]"
                                  >
                                    {t('wiki.articles.tigerogSupply.ogContract')}
                                  </a>
                                </li>
                              </ul>
                            </section>

                            {/* LionOG Supply Section */}
                            <section id="lionog-supply" className="space-y-4 scroll-mt-24">
                              <h2
                                className="text-2xl font-bold tracking-tight"
                                style={{ fontFamily: 'var(--font-display)', color: 'var(--theme-text-primary)' }}
                              >
                                {t('wiki.articles.lionogSupply.title')}
                              </h2>
                              <p className="leading-7" style={{ color: 'var(--theme-text-secondary)' }}>
                                {t('wiki.articles.lionogSupply.intro')}
                              </p>

                              <div
                                className="overflow-x-auto rounded-lg border"
                                style={{ borderColor: 'var(--theme-card-border)' }}
                              >
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr style={{ backgroundColor: 'var(--theme-section-bg)' }}>
                                      <th className="text-left p-3 font-semibold" style={{ color: 'var(--theme-text-primary)' }}>{t('wiki.articles.supplyCommon.table.category')}</th>
                                      <th className="text-right p-3 font-semibold" style={{ color: 'var(--theme-text-primary)' }}>{t('wiki.articles.supplyCommon.table.amount')}</th>
                                      <th className="text-right p-3 font-semibold" style={{ color: 'var(--theme-text-primary)' }}>{t('wiki.articles.supplyCommon.table.percentOfTotal')}</th>
                                    </tr>
                                  </thead>
                                  <tbody style={{ color: 'var(--theme-text-secondary)' }}>
                                    <tr style={{ borderTop: '1px solid var(--theme-card-border)' }}>
                                      <td className="p-3">{t('wiki.articles.supplyCommon.table.originalSupply')}</td>
                                      <td className="text-right p-3 font-mono">{t('wiki.articles.lionogSupply.amounts.original')}</td>
                                      <td className="text-right p-3">100%</td>
                                    </tr>
                                    <tr style={{ borderTop: '1px solid var(--theme-card-border)', backgroundColor: 'var(--theme-section-bg)' }}>
                                      <td className="p-3 text-red-500">{t('wiki.articles.supplyCommon.table.deadAddress')}</td>
                                      <td className="text-right p-3 font-mono">{t('wiki.articles.lionogSupply.amounts.dead')}</td>
                                      <td className="text-right p-3">{t('wiki.articles.lionogSupply.amounts.deadPercent')}</td>
                                    </tr>
                                    <tr style={{ borderTop: '1px solid var(--theme-card-border)' }}>
                                      <td className="p-3 text-red-500">{t('wiki.articles.supplyCommon.table.contractBalance')}</td>
                                      <td className="text-right p-3 font-mono">{t('wiki.articles.lionogSupply.amounts.contract')}</td>
                                      <td className="text-right p-3">{t('wiki.articles.lionogSupply.amounts.contractPercent')}</td>
                                    </tr>
                                    <tr style={{ borderTop: '1px solid var(--theme-card-border)', backgroundColor: 'var(--theme-section-bg)' }}>
                                      <td className="p-3 text-red-500">{t('wiki.articles.lionogSupply.lpLocked')}</td>
                                      <td className="text-right p-3 font-mono">{t('wiki.articles.lionogSupply.amounts.lp')}</td>
                                      <td className="text-right p-3">{t('wiki.articles.lionogSupply.amounts.lpPercent')}</td>
                                    </tr>
                                    <tr style={{ borderTop: '2px solid var(--theme-card-border)', fontWeight: 'bold' }}>
                                      <td className="p-3" style={{ color: 'var(--primary)' }}>{t('wiki.articles.supplyCommon.table.circulatingSupply')}</td>
                                      <td className="text-right p-3 font-mono" style={{ color: 'var(--primary)' }}>{t('wiki.articles.lionogSupply.amounts.circulating')}</td>
                                      <td className="text-right p-3" style={{ color: 'var(--primary)' }}>{t('wiki.articles.lionogSupply.amounts.circulatingPercent')}</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>

                              <h3
                                className="text-xl font-semibold mt-6"
                                style={{ fontFamily: 'var(--font-display)', color: 'var(--theme-text-primary)' }}
                              >
                                {t('wiki.articles.supplyCommon.howWeCalculated')}
                              </h3>

                              <div className="space-y-4" style={{ color: 'var(--theme-text-secondary)' }}>
                                <div
                                  className="p-4 rounded-lg border"
                                  style={{ backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-card-border)' }}
                                >
                                  <h4 className="font-semibold mb-2" style={{ color: 'var(--theme-text-primary)' }}>{t('wiki.articles.supplyCommon.deadAddressTitle')}</h4>
                                  <p className="text-sm">
                                    <Trans i18nKey="wiki.articles.lionogSupply.deadAddressDesc" components={{ code: <code className="px-1 py-0.5 rounded" style={{ backgroundColor: 'var(--theme-section-bg)' }} /> }} />
                                  </p>
                                </div>

                                <div
                                  className="p-4 rounded-lg border"
                                  style={{ backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-card-border)' }}
                                >
                                  <h4 className="font-semibold mb-2" style={{ color: 'var(--theme-text-primary)' }}>{t('wiki.articles.supplyCommon.contractBalanceTitle')}</h4>
                                  <p className="text-sm">{t('wiki.articles.lionogSupply.contractBalanceDesc')}</p>
                                </div>

                                <div
                                  className="p-4 rounded-lg border"
                                  style={{ backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-card-border)' }}
                                >
                                  <h4 className="font-semibold mb-2" style={{ color: 'var(--theme-text-primary)' }}>{t('wiki.articles.supplyCommon.lpLockedTitle')}</h4>
                                  <p className="text-sm mb-2">{t('wiki.articles.lionogSupply.lpLockedDesc')}</p>
                                  <ul className="text-sm list-disc list-inside space-y-1 ml-2">
                                    <li>{t('wiki.articles.lionogSupply.lpBurnedPercent')}</li>
                                    <li>{t('wiki.articles.lionogSupply.lpLockedPercent')}</li>
                                  </ul>
                                </div>
                              </div>

                              <div
                                className="p-4 rounded-md border-l-4 mt-4"
                                style={{
                                  backgroundColor: 'var(--theme-section-bg)',
                                  borderColor: 'var(--primary)',
                                  color: 'var(--theme-text-secondary)'
                                }}
                              >
                                <p className="text-sm">
                                  <Trans i18nKey="wiki.articles.lionogSupply.note" />
                                </p>
                                <p className="text-sm mt-2">
                                  <Trans i18nKey="wiki.articles.lionogSupply.launchData" />
                                </p>
                              </div>

                              <h3
                                className="text-xl font-semibold mt-6"
                                style={{ fontFamily: 'var(--font-display)', color: 'var(--theme-text-primary)' }}
                              >
                                {t('wiki.articles.supplyCommon.verification')}
                              </h3>
                              <p className="leading-7" style={{ color: 'var(--theme-text-secondary)' }}>
                                {t('wiki.articles.supplyCommon.verificationDesc')}
                              </p>
                              <ul className="list-disc list-inside space-y-2 ml-4 text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
                                <li>
                                  <a
                                    href="https://bscscan.com/token/0xdA1689C5557564d06E2A546F8FD47350b9D44a73"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="underline hover:text-[var(--primary)]"
                                  >
                                    {t('wiki.articles.lionogSupply.legacyContract')}
                                  </a>
                                </li>
                                <li>
                                  <a
                                    href="https://bscscan.com/token/0x6731F2d7ADF86cfba30d15c4D10113Ce98f3492A"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="underline hover:text-[var(--primary)]"
                                  >
                                    {t('wiki.articles.lionogSupply.ogContract')}
                                  </a>
                                </li>
                              </ul>
                            </section>

                            {/* FrogOG Supply Section */}
                            <section id="frogog-supply" className="space-y-4 scroll-mt-24">
                              <h2
                                className="text-2xl font-bold tracking-tight"
                                style={{ fontFamily: 'var(--font-display)', color: 'var(--theme-text-primary)' }}
                              >
                                {t('wiki.articles.frogogSupply.title')}
                              </h2>
                              <p className="leading-7" style={{ color: 'var(--theme-text-secondary)' }}>
                                {t('wiki.articles.frogogSupply.intro')}
                              </p>

                              <div
                                className="overflow-x-auto rounded-lg border"
                                style={{ borderColor: 'var(--theme-card-border)' }}
                              >
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr style={{ backgroundColor: 'var(--theme-section-bg)' }}>
                                      <th className="text-left p-3 font-semibold" style={{ color: 'var(--theme-text-primary)' }}>{t('wiki.articles.supplyCommon.table.category')}</th>
                                      <th className="text-right p-3 font-semibold" style={{ color: 'var(--theme-text-primary)' }}>{t('wiki.articles.supplyCommon.table.amount')}</th>
                                      <th className="text-right p-3 font-semibold" style={{ color: 'var(--theme-text-primary)' }}>{t('wiki.articles.supplyCommon.table.percentOfTotal')}</th>
                                    </tr>
                                  </thead>
                                  <tbody style={{ color: 'var(--theme-text-secondary)' }}>
                                    <tr style={{ borderTop: '1px solid var(--theme-card-border)' }}>
                                      <td className="p-3">{t('wiki.articles.supplyCommon.table.originalSupply')}</td>
                                      <td className="text-right p-3 font-mono">{t('wiki.articles.frogogSupply.amounts.original')}</td>
                                      <td className="text-right p-3">100%</td>
                                    </tr>
                                    <tr style={{ borderTop: '1px solid var(--theme-card-border)', backgroundColor: 'var(--theme-section-bg)' }}>
                                      <td className="p-3 text-red-500">{t('wiki.articles.supplyCommon.table.deadAddress')}</td>
                                      <td className="text-right p-3 font-mono">{t('wiki.articles.frogogSupply.amounts.dead')}</td>
                                      <td className="text-right p-3">{t('wiki.articles.frogogSupply.amounts.deadPercent')}</td>
                                    </tr>
                                    <tr style={{ borderTop: '1px solid var(--theme-card-border)' }}>
                                      <td className="p-3 text-red-500">{t('wiki.articles.supplyCommon.table.contractBalance')}</td>
                                      <td className="text-right p-3 font-mono">{t('wiki.articles.frogogSupply.amounts.contract')}</td>
                                      <td className="text-right p-3">{t('wiki.articles.frogogSupply.amounts.contractPercent')}</td>
                                    </tr>
                                    <tr style={{ borderTop: '1px solid var(--theme-card-border)', backgroundColor: 'var(--theme-section-bg)' }}>
                                      <td className="p-3 text-red-500">{t('wiki.articles.frogogSupply.lpLocked')}</td>
                                      <td className="text-right p-3 font-mono">{t('wiki.articles.frogogSupply.amounts.lp')}</td>
                                      <td className="text-right p-3">{t('wiki.articles.frogogSupply.amounts.lpPercent')}</td>
                                    </tr>
                                    <tr style={{ borderTop: '2px solid var(--theme-card-border)', fontWeight: 'bold' }}>
                                      <td className="p-3" style={{ color: 'var(--primary)' }}>{t('wiki.articles.supplyCommon.table.circulatingSupply')}</td>
                                      <td className="text-right p-3 font-mono" style={{ color: 'var(--primary)' }}>{t('wiki.articles.frogogSupply.amounts.circulating')}</td>
                                      <td className="text-right p-3" style={{ color: 'var(--primary)' }}>{t('wiki.articles.frogogSupply.amounts.circulatingPercent')}</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>

                              <h3
                                className="text-xl font-semibold mt-6"
                                style={{ fontFamily: 'var(--font-display)', color: 'var(--theme-text-primary)' }}
                              >
                                {t('wiki.articles.supplyCommon.howWeCalculated')}
                              </h3>

                              <div className="space-y-4" style={{ color: 'var(--theme-text-secondary)' }}>
                                <div
                                  className="p-4 rounded-lg border"
                                  style={{ backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-card-border)' }}
                                >
                                  <h4 className="font-semibold mb-2" style={{ color: 'var(--theme-text-primary)' }}>{t('wiki.articles.supplyCommon.deadAddressTitle')}</h4>
                                  <p className="text-sm">
                                    <Trans i18nKey="wiki.articles.frogogSupply.deadAddressDesc" components={{ code: <code className="px-1 py-0.5 rounded" style={{ backgroundColor: 'var(--theme-section-bg)' }} /> }} />
                                  </p>
                                </div>

                                <div
                                  className="p-4 rounded-lg border"
                                  style={{ backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-card-border)' }}
                                >
                                  <h4 className="font-semibold mb-2" style={{ color: 'var(--theme-text-primary)' }}>{t('wiki.articles.supplyCommon.contractBalanceTitle')}</h4>
                                  <p className="text-sm">{t('wiki.articles.frogogSupply.contractBalanceDesc')}</p>
                                </div>

                                <div
                                  className="p-4 rounded-lg border"
                                  style={{ backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-card-border)' }}
                                >
                                  <h4 className="font-semibold mb-2" style={{ color: 'var(--theme-text-primary)' }}>{t('wiki.articles.supplyCommon.lpLockedTitle')}</h4>
                                  <p className="text-sm mb-2">{t('wiki.articles.frogogSupply.lpLockedDesc')}</p>
                                  <ul className="text-sm list-disc list-inside space-y-1 ml-2">
                                    <li>{t('wiki.articles.frogogSupply.lpBurnedPercent')}</li>
                                    <li>{t('wiki.articles.frogogSupply.lpLockedPercent')}</li>
                                  </ul>
                                </div>
                              </div>

                              <div
                                className="p-4 rounded-md border-l-4 mt-4"
                                style={{
                                  backgroundColor: 'var(--theme-section-bg)',
                                  borderColor: 'var(--primary)',
                                  color: 'var(--theme-text-secondary)'
                                }}
                              >
                                <p className="text-sm">
                                  <Trans i18nKey="wiki.articles.frogogSupply.note" />
                                </p>
                                <p className="text-sm mt-2">
                                  <Trans i18nKey="wiki.articles.frogogSupply.launchData" />
                                </p>
                              </div>

                              <h3
                                className="text-xl font-semibold mt-6"
                                style={{ fontFamily: 'var(--font-display)', color: 'var(--theme-text-primary)' }}
                              >
                                {t('wiki.articles.supplyCommon.verification')}
                              </h3>
                              <p className="leading-7" style={{ color: 'var(--theme-text-secondary)' }}>
                                {t('wiki.articles.supplyCommon.verificationDesc')}
                              </p>
                              <ul className="list-disc list-inside space-y-2 ml-4 text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
                                <li>
                                  <a
                                    href="https://bscscan.com/token/0x64da67A12a46f1DDF337393e2dA12eD0A507Ad3D"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="underline hover:text-[var(--primary)]"
                                  >
                                    {t('wiki.articles.frogogSupply.legacyContract')}
                                  </a>
                                </li>
                                <li>
                                  <a
                                    href="https://bscscan.com/token/0x0E3b564bdD09348840811C7e1106BbD0e98b5b4f"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="underline hover:text-[var(--primary)]"
                                  >
                                    {t('wiki.articles.frogogSupply.ogContract')}
                                  </a>
                                </li>
                              </ul>
                            </section>

              <section id="security" className="space-y-4 scroll-mt-24">
                <h2 
                  className="text-2xl font-bold tracking-tight"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--theme-text-primary)' }}
                >
                  {t('wiki.articles.security.title')}
                </h2>
                <p className="leading-7" style={{ color: 'var(--theme-text-secondary)' }}>
                  {t('wiki.articles.security.content')}
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4" style={{ color: 'var(--theme-text-secondary)' }}>
                  <li><Trans i18nKey="wiki.articles.security.point1" /></li>
                  <li><Trans i18nKey="wiki.articles.security.point2" /></li>
                  <li><Trans i18nKey="wiki.articles.security.point3" /></li>
                  <li><Trans i18nKey="wiki.articles.security.point4" /></li>
                </ul>
              </section>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function RocketIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.1 4-1 4-1" />
      <path d="M12 15v5s3.03-.55 4-2c1.1-1.62 1-4 1-4" />
    </svg>
  );
}
