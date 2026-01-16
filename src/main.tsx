import React, { useMemo } from "react";
import ReactDOM from "react-dom/client";
import { http, WagmiProvider, createConfig } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme, lightTheme, connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  rabbyWallet,
  metaMaskWallet,
  injectedWallet,
  walletConnectWallet,
  ledgerWallet,
  binanceWallet,
  coinbaseWallet,
  rainbowWallet,
  trustWallet,
  argentWallet,
} from "@rainbow-me/rainbowkit/wallets";
import "@rainbow-me/rainbowkit/styles.css";
import "./index.css";
import { useEnvironment, EnvironmentProvider } from "./context/EnvironmentContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { getExternalPaletteAccent } from "./themes/registry";
import { LocalizationProvider, useLocalization } from "./context/LocalizationContext";
import { HashRouter } from "react-router-dom";
import App from "./App";
import i18n from "./i18n"; // Import i18n configuration
import { I18nextProvider } from "react-i18next"; // Import I18nextProvider
import type { Locale } from "@rainbow-me/rainbowkit/dist/locales";

const projectId = import.meta.env.VITE_RAINBOWKIT_PROJECT_ID ?? "";

const queryClient = new QueryClient();

const RAINBOWKIT_LOCALE_MAP: Record<string, Locale> = {
  ar: "ar",
  de: "de",
  "de-DE": "de-DE",
  en: "en",
  "en-US": "en-US",
  es: "es",
  "es-419": "es-419",
  fr: "fr",
  "fr-FR": "fr-FR",
  hi: "hi",
  "hi-IN": "hi-IN",
  id: "id",
  "id-ID": "id-ID",
  ja: "ja",
  "ja-JP": "ja-JP",
  ko: "ko",
  "ko-KR": "ko-KR",
  ms: "ms",
  "ms-MY": "ms-MY",
  pt: "pt",
  "pt-BR": "pt-BR",
  ru: "ru",
  "ru-RU": "ru-RU",
  th: "th",
  "th-TH": "th-TH",
  tr: "tr",
  "tr-TR": "tr-TR",
  ua: "ua",
  "uk-UA": "uk-UA",
  vi: "vi",
  "vi-VN": "vi-VN",
  zh: "zh",
  "zh-CN": "zh-CN",
  "zh-HK": "zh-HK",
  "zh-TW": "zh-TW",
  "zh-Hans": "zh-Hans",
  "zh-Hant": "zh-Hant",
};

const Providers = () => {
  const { environment, availableChains, rpcConfig } = useEnvironment();
  const { resolvedTheme, style } = useTheme();
  const { language } = useLocalization();

  const chains = useMemo(() => {
    const priority = [56, 1, 8453, 59144, 137, 43114, 1440000]; // BNB Chain, Ethereum, Base, Linea, Polygon, Avalanche, XRPL EVM
    const all = Object.values(availableChains);
    const byId = new Map(all.map((c) => [c.id, c]));

    const top = priority
      .map((id) => byId.get(id))
      .filter(Boolean) as typeof all;

    const rest = all
      .filter((c) => !priority.includes(c.id))
      .sort((a, b) => a.name.localeCompare(b.name));

    return [...top, ...rest];
  }, [availableChains]);

  const transports = useMemo(
    () =>
      Object.fromEntries(
        chains.map((chain) => {
          const rpcUrl = rpcConfig[chain.id] || chain.rpcUrls.default.http?.[0];
          return [chain.id, http(rpcUrl ?? chain.rpcUrls.public.http?.[0] ?? "")];
        }),
      ),
    [chains, rpcConfig],
  );

  const wagmiConfig = useMemo(() => {
    if (chains.length === 0) {
      return null;
    }

    const connectors = connectorsForWallets(
      [
        {
          groupName: "Recommended",
          wallets: [rabbyWallet, metaMaskWallet, injectedWallet, walletConnectWallet, ledgerWallet],
        },
              {
                groupName: "More",
                wallets: [binanceWallet, coinbaseWallet, rainbowWallet, trustWallet, argentWallet],
              },
            ],
            {
              appName: "Freedom Bridge",
              projectId,
            }
          );
    return createConfig({
      connectors,
      chains: chains as [typeof chains[number], ...typeof chains],
      transports,
      ssr: false,
      multiInjectedProviderDiscovery: true,
    });
  }, [chains, transports]);

  if (!chains.length || !wagmiConfig) {
    return <div style={{ color: "white", padding: "2rem" }}>No chains configured for the selected environment.</div>;
  }

  const rainbowKitTheme = useMemo(() => {
    const externalAccent = getExternalPaletteAccent(style);
    const accentColor =
      style === 'warp'
        ? '#7A5CFF'
        : externalAccent
        ? externalAccent
        : resolvedTheme === 'dark'
        ? '#80A2FF'
        : '#7063F3';

    const common = {
      accentColor,
      accentColorForeground: 'white',
      borderRadius: 'medium' as const,
    };

    return resolvedTheme === 'dark' ? darkTheme(common) : lightTheme(common);
  }, [resolvedTheme, style]);

  const rainbowKitLocale = useMemo<Locale>(() => {
    return RAINBOWKIT_LOCALE_MAP[language] ?? "en";
  }, [language]);

  const providerKey = `${environment}:${Object.entries(rpcConfig)
    .map(([id, url]) => `${id}-${url}`)
    .join("|")}`;

  return (
    <WagmiProvider key={providerKey} config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={rainbowKitTheme} locale={rainbowKitLocale}>
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <LocalizationProvider>
      <ThemeProvider>
        <EnvironmentProvider>
          <HashRouter>
            <I18nextProvider i18n={i18n}> {/* Wrap App with I18nextProvider */}
              <Providers />
            </I18nextProvider>
          </HashRouter>
        </EnvironmentProvider>
      </ThemeProvider>
    </LocalizationProvider>
  </React.StrictMode>
);
