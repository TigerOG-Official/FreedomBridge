import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { motion } from "motion/react";
import {
  Globe2,
  LockOpen,
  ShieldCheck,
  Zap,
  Rocket,
  ArrowRight,
  Book,
  ExternalLink,
  ShoppingCart
} from "lucide-react";
import { useTranslation, Trans } from "react-i18next";
import chainsConfig from "../config/chains.json";

export default function LandingPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const networkCount = Object.keys(chainsConfig).length;

  return (
    <div className="landing-page-wrapper">
      {/* Dynamic Background Elements */}
      <div className="landing-bg-orb orb-1" />
      <div className="landing-bg-orb orb-2" />
      <div className="landing-bg-orb orb-3" />
      <div className="landing-grid-overlay" />

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center pt-32 pb-24 px-4 text-center max-w-7xl mx-auto w-full min-h-[80vh]">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 inline-flex items-center px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 backdrop-blur-md shadow-[0_0_15px_rgba(99,102,241,0.3)]"
        >
          <span className="flex h-2 w-2 rounded-full bg-indigo-400 mr-2 animate-pulse shadow-[0_0_10px_#818cf8]"></span>
          <span className="text-sm font-semibold text-indigo-500 dark:text-indigo-200 tracking-wide uppercase">
            {t('landing.hero.badge')}
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="landing-hero-text text-6xl md:text-7xl lg:text-8xl mb-8 leading-tight"
        >
          <Trans i18nKey="landing.hero.title">
            Uncage Your <br />
            <span className="landing-hero-highlight">Assets</span>
          </Trans>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-2xl mb-12 leading-relaxed font-light"
        >
          {t('landing.hero.subtitle')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-6 w-full justify-center items-center"
        >
          <button
            className="btn-primary-glow flex items-center gap-2"
            onClick={() => navigate('/convert')}
          >
            {t('landing.hero.launchApp')}
            <Rocket className="w-5 h-5" />
          </button>
          <button
            className="btn-secondary-glass flex items-center gap-2"
            onClick={() => navigate('/wiki')}
          >
            {t('landing.hero.documentation')}
            <Book className="w-4 h-4" />
          </button>
        </motion.div>
      </section>

      {/* Stats Bar */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="stats-bar relative z-10 py-10 mb-24"
      >
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center md:justify-between gap-8 text-center md:text-left">
           <div className="flex flex-col items-center md:items-start">
             <span className="text-3xl font-bold stats-val mb-1">Axelar</span>
             <span className="text-sm uppercase tracking-widest stats-label">{t('landing.stats.messaging')}</span>
           </div>
           <div className="flex flex-col items-center md:items-start">
             <span className="text-3xl font-bold stats-val mb-1">{networkCount}+</span>
             <span className="text-sm uppercase tracking-widest stats-label">{t('landing.stats.networks')}</span>
           </div>
           <div className="flex flex-col items-center md:items-start">
             <span className="text-3xl font-bold stats-val mb-1">0%</span>
             <span className="text-sm uppercase tracking-widest stats-label">{t('landing.stats.fees')}</span>
           </div>
           <div className="flex flex-col items-center md:items-start">
             <span className="text-3xl font-bold stats-val mb-1">~3 min</span>
             <span className="text-sm uppercase tracking-widest stats-label">{t('landing.stats.finality')}</span>
           </div>
        </div>
      </motion.div>

      {/* Features Section */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-4 pb-32 w-full">
        <div className="mb-16 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 feature-title">{t('landing.features.title')}</h2>
          <p className="text-lg feature-text max-w-2xl mx-auto">
            {t('landing.features.description', { count: networkCount })}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Large Feature Card - The Graph */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="col-span-1 md:col-span-2 row-span-2 bento-card p-8 flex flex-col justify-between relative group"
          >
            <div className="relative z-20">
              <div className="feature-icon-box text-indigo-600 dark:text-indigo-400 border-indigo-500/30 bg-indigo-500/10">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-3xl font-bold mb-3 feature-title group-hover:text-indigo-500 dark:group-hover:text-indigo-300 transition-colors">{t('landing.features.stopDecay.title')}</h3>
              <p className="text-lg leading-relaxed max-w-md feature-text">
                {t('landing.features.stopDecay.description')}
              </p>
            </div>
            
            {/* Graph: Real Tax Decay Visualization */}
            <div className="mt-8 relative h-64 w-full rounded-xl overflow-hidden border graph-bg">
              <svg className="absolute bottom-0 left-0 w-full h-full" viewBox="0 0 400 150" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="graphGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                
                {/* Area under the curve - Wrapped (Flat) */}
                <path 
                  d="M0 150 L0 40 L 400 40 V 150 Z" 
                  fill="url(#graphGradient)" 
                  className="graph-area"
                  opacity="0.5"
                />
                
                {/* The Line itself - Wrapped (Flat at 100%) */}
                <path 
                  d="M0 40 L 400 40" 
                  fill="none" 
                  strokeWidth="4" 
                  className="graph-path"
                  filter="url(#glow)"
                />
                
                {/* Legacy Token Decay (10% tax compounding) */}
                {/* Starts at 40 (100%), decays to ~120 (low balance) */}
                <path 
                  d="M0 40 C 100 40, 150 90, 400 130" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeOpacity="0.4"
                  strokeWidth="3" 
                  strokeDasharray="6,6"
                />
              </svg>
              
              {/* Floating Data Points */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="absolute top-[15%] right-[5%] bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-md shadow-lg border border-indigo-400"
              >
                {t('landing.features.stopDecay.graphLabel1')}
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="absolute bottom-[15%] right-[5%] bg-red-500/80 text-white text-xs font-bold px-3 py-1.5 rounded-md shadow-lg border border-red-400/50"
              >
                {t('landing.features.stopDecay.graphLabel2')}
              </motion.div>
            </div>
          </motion.div>

          {/* Small Feature Card 1 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="col-span-1 row-span-1 bento-card p-6 hover:bg-indigo-500/5"
          >
            <div className="feature-icon-box text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
              <LockOpen className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2 feature-title">{t('landing.features.conversion.title')}</h3>
            <p className="text-sm leading-relaxed feature-text">
              {t('landing.features.conversion.description')}
            </p>
          </motion.div>

          {/* Small Feature Card 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="col-span-1 row-span-1 bento-card p-6 hover:bg-purple-500/5"
          >
            <div className="feature-icon-box text-purple-600 dark:text-purple-400 border-purple-500/30 bg-purple-500/10">
              <Globe2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2 feature-title">{t('landing.features.multichain.title')}</h3>
            <p className="text-sm leading-relaxed feature-text">
              {t('landing.features.multichain.description')}
            </p>
          </motion.div>

          {/* Wide Feature Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="col-span-1 md:col-span-3 bento-card p-8 flex flex-col md:flex-row items-center justify-between gap-8 bg-gradient-to-r from-indigo-500/5 to-transparent"
          >
             <div className="flex-1">
                <div className="flex items-center gap-4 mb-3">
                  <div className="feature-icon-box mb-0 text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/10">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold feature-title">{t('landing.features.security.title')}</h3>
                </div>
                <p className="text-lg feature-text">
                  {t('landing.features.security.description')}
                </p>
             </div>
             <Button onClick={() => navigate('/convert')} className="shrink-0 btn-primary-glow h-12 px-8 text-base">
               {t('landing.features.security.button')}
             </Button>
          </motion.div>
        </div>
      </section>

      {/* Buy Base Tokens Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 pb-32 w-full">
        <div className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block mb-4"
          >
            <span className="py-1 px-3 rounded-full bg-[var(--theme-percent-25-bg)] border border-[var(--theme-card-border)] text-[var(--accent-primary)] text-xs font-bold tracking-widest uppercase">
              Get Started
            </span>
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 feature-title">{t('landing.buyTokens.title', 'Acquire Assets')}</h2>
          <p className="text-lg feature-text max-w-2xl mx-auto font-light">
            {t('landing.buyTokens.description', 'Don\'t have any tokens yet? Buy the base tokens on PancakeSwap, then convert them to the new multichain versions.')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* BNBTiger */}
          <motion.a
            href="https://pancakeswap.finance/swap?outputCurrency=0xAC68931B666E086E9de380CFDb0Fb5704a35dc2D&chain=bsc"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0 }}
            className="group bento-card p-1 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--accent-primary)] via-transparent to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-500" style={{ '--tw-gradient-from': 'var(--accent-primary)' } as React.CSSProperties} />
            
            <div className="relative h-full rounded-[1.3rem] p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg ring-1 ring-white/20 transition-transform duration-300 group-hover:scale-110" style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-primary-strong))', boxShadow: '0 10px 20px -5px color-mix(in srgb, var(--accent-primary) 50%, transparent)' }}>
                <ShoppingCart className="w-7 h-7 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold feature-title mb-2 group-hover:text-[var(--accent-primary)] transition-colors">BNBTiger</h3>
              <div className="h-px w-12 bg-[var(--theme-card-border)] my-4" />
              
              <p className="feature-text mb-8 text-sm leading-relaxed">
                {t('landing.buyTokens.buyOn', 'Buy on PancakeSwap')} <br/>
                <span className="text-[var(--accent-primary)] font-bold">then</span> {t('landing.buyTokens.convertTo', 'Convert to')} TigerOG
              </p>

              <div className="mt-auto flex items-center gap-2 btn-secondary-glass px-6 py-2 h-auto rounded-full text-sm group/btn">
                <span>Buy Now</span>
                <ExternalLink className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </motion.a>

          {/* BNBLion */}
          <motion.a
            href="https://pancakeswap.finance/swap?outputCurrency=0xdA1689C5557564d06E2A546F8FD47350b9D44a73&chain=bsc"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="group bento-card p-1 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--accent-secondary)] via-transparent to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-500" style={{ '--tw-gradient-from': 'var(--accent-secondary)' } as React.CSSProperties} />
            
            <div className="relative h-full rounded-[1.3rem] p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg ring-1 ring-white/20 transition-transform duration-300 group-hover:scale-110" style={{ background: 'linear-gradient(135deg, var(--accent-secondary), var(--theme-button-gradient-mid))', boxShadow: '0 10px 20px -5px color-mix(in srgb, var(--accent-secondary) 50%, transparent)' }}>
                <ShoppingCart className="w-7 h-7 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold feature-title mb-2 group-hover:text-[var(--accent-secondary)] transition-colors">BNBLion</h3>
              <div className="h-px w-12 bg-[var(--theme-card-border)] my-4" />
              
              <p className="feature-text mb-8 text-sm leading-relaxed">
                {t('landing.buyTokens.buyOn', 'Buy on PancakeSwap')} <br/>
                <span className="text-[var(--accent-secondary)] font-bold">then</span> {t('landing.buyTokens.convertTo', 'Convert to')} LionOG
              </p>

              <div className="mt-auto flex items-center gap-2 btn-secondary-glass px-6 py-2 h-auto rounded-full text-sm group/btn">
                <span>Buy Now</span>
                <ExternalLink className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </motion.a>

          {/* BNBFrog */}
          <motion.a
            href="https://pancakeswap.finance/swap?outputCurrency=0x64da67A12a46f1DDF337393e2dA12eD0A507Ad3D&chain=bsc"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="group bento-card p-1 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--accent-signal)] via-transparent to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-500" style={{ '--tw-gradient-from': 'var(--accent-signal)' } as React.CSSProperties} />
            
            <div className="relative h-full rounded-[1.3rem] p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg ring-1 ring-white/20 transition-transform duration-300 group-hover:scale-110" style={{ background: 'linear-gradient(135deg, var(--accent-signal), var(--theme-success-text))', boxShadow: '0 10px 20px -5px color-mix(in srgb, var(--accent-signal) 50%, transparent)' }}>
                <ShoppingCart className="w-7 h-7 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold feature-title mb-2 group-hover:text-[var(--accent-signal)] transition-colors">BNBFrog</h3>
              <div className="h-px w-12 bg-[var(--theme-card-border)] my-4" />
              
              <p className="feature-text mb-8 text-sm leading-relaxed">
                {t('landing.buyTokens.buyOn', 'Buy on PancakeSwap')} <br/>
                <span className="text-[var(--accent-signal)] font-bold">then</span> {t('landing.buyTokens.convertTo', 'Convert to')} FrogOG
              </p>

              <div className="mt-auto flex items-center gap-2 btn-secondary-glass px-6 py-2 h-auto rounded-full text-sm group/btn">
                <span>Buy Now</span>
                <ExternalLink className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </motion.a>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-4 pb-24">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-[3rem] bg-gradient-to-b from-indigo-500/10 to-slate-500/10 border border-indigo-500/20 p-12 md:p-24 text-center relative overflow-hidden backdrop-blur-xl"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent" />

            <h2 className="text-4xl md:text-6xl font-bold mb-6 relative z-10 feature-title">{t('landing.cta.title')}</h2>
            <p className="text-xl feature-text max-w-2xl mx-auto mb-10 relative z-10">
              {t('landing.cta.description')}
            </p>
            <Button 
              size="lg" 
              className="btn-primary-glow relative z-10 h-16 px-12 text-xl"
              onClick={() => navigate('/convert')}
            >
              {t('landing.cta.button')}
            </Button>
          </motion.div>
        </div>
      </section>

      <footer className="text-center py-3 footer-version relative z-10">
        v{import.meta.env.VITE_APP_VERSION}
      </footer>
    </div>
  );
}
