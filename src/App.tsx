import { useEffect, useMemo, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import BridgeForm from "./components/BridgeForm";
import ConverterForm from "./components/ConverterForm";
import SettingsModal from "./components/SettingsModal";
import AddNetworksModal from "./components/AddNetworksModal";

import LandingPage from "./components/LandingPage";
import WikiPage from "./components/WikiPage";
import ContractsPage from "./components/ContractsPage";
import FAQPage from "./components/FAQPage";
import DisclaimerPage from "./components/DisclaimerPage";
import DisclaimerModal, { useDisclaimerAccepted } from "./components/DisclaimerModal";
import { useTheme, ThemeStyle } from "./context/ThemeContext";
import { externalPaletteOptions } from "./themes/registry";
import { MoonIcon } from "./components/ui/moon";
import { SunIcon } from "./components/ui/sun";
import { MenuIcon } from "./components/ui/menu";
import { LanguagesIcon } from "./components/ui/languages";
import { SettingsIcon } from "./components/ui/settings-icon";
import { CircleHelpIcon } from "./components/ui/circle-help-icon";
import { HomeIcon } from "./components/ui/home-icon";
import { XIcon } from "./components/ui/x-icon";
import { PaletteIcon } from "./components/ui/palette-icon";
import { Button } from "./components/ui/button";
import { Book as BookIcon, Network, Check, Code, Github } from "lucide-react";
import { Card, CardHeader, CardContent } from "./components/ui/card";
import { Input } from "./components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "./components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./components/ui/dropdown-menu";
import "./styles/global.css";
import { useTranslation } from "react-i18next";
import { useLocalization } from "./context/LocalizationContext";

enum Page {
  Bridge = "bridge",
  Convert = "convert",
}

const normalizePathname = (pathname: string): string => {
  const trimmed = pathname.replace(/\/*$/, "");
  if (trimmed === "") {
    return "/";
  }
  return trimmed;
};

const MenuButton = ({ icon, label, value, onClick, className }: { icon: React.ReactNode, label: string, value?: string, onClick?: () => void, className?: string }) => (
  <Button
    type="button"
    variant="ghost"
    className={`w-full justify-start px-4 py-6 text-base font-medium hover:bg-accent/50 ${className || ''}`}
    onClick={onClick}
  >
    <div className="flex items-center w-full">
      <div className="mr-3 text-muted-foreground">
        {icon}
      </div>
      <span className="flex-1 text-left text-foreground">{label}</span>
      {value && (
        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md ml-2">
          {value}
        </span>
      )}
    </div>
  </Button>
);

function App() {
  const { t } = useTranslation();
  const { language, setLanguage, availableLanguages } = useLocalization();
  const [showSettings, setShowSettings] = useState(false);
  const [showAddNetworks, setShowAddNetworks] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [languageQuery, setLanguageQuery] = useState("");
  const [showInfoBanner, setShowInfoBanner] = useState<boolean>(true);
  const { accepted: disclaimerAccepted, acceptDisclaimer } = useDisclaimerAccepted();
  const location = useLocation();
  const navigate = useNavigate();
  const { setTheme, resolvedTheme, style, setStyle } = useTheme();

  const normalizedPath = useMemo(() => normalizePathname(location.pathname), [location.pathname]);
  const activePage =
    normalizedPath === `/${Page.Bridge}` ? Page.Bridge :
      Page.Convert;
  const activeLanguage = useMemo(
    () => availableLanguages.find((option) => option.code === language) ?? availableLanguages[0],
    [availableLanguages, language],
  );
  const filteredLanguages = useMemo(() => {
    const query = languageQuery.trim().toLowerCase();
    if (!query) {
      return availableLanguages;
    }
    return availableLanguages.filter((option) =>
      [option.name, option.nativeName, option.code].some((value) => value.toLowerCase().includes(query)),
    );
  }, [availableLanguages, languageQuery]);

  const handleNavigate = (page: Page) => {
    if (page === activePage) {
      return;
    }

    navigate(`/${page}`);
  };

  const toggleTheme = () => {
    // Cycle through: light -> dark -> light
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const paletteOptions = useMemo(() => {
    return externalPaletteOptions.length
      ? externalPaletteOptions
      : [{ id: 'classic', label: 'Classic', accentColor: undefined }];
  }, []);

  const getPaletteLabel = (value: ThemeStyle) =>
    paletteOptions.find((option) => option.id === value)?.label || value;

  const handleDismissBanner = () => {
    setShowInfoBanner(false);
  };

  const handleLanguageSelect = (code: typeof language) => {
    if (code === language) {
      return;
    }
    setLanguage(code);
    setLanguageQuery("");
  };

  // Blueprint parallax effect
  useEffect(() => {
    if (style !== 'blueprint') return;

    const handleMouseMove = (e: MouseEvent) => {
      const container = document.querySelector('.bridge-container');
      if (!container) return;

      const gridElement = window.getComputedStyle(container, '::before');
      if (!gridElement) return;

      // Calculate parallax offset based on mouse position
      // Center of screen = 0, edges = ±1
      const xPercent = (e.clientX / window.innerWidth - 0.5) * 2;
      const yPercent = (e.clientY / window.innerHeight - 0.5) * 2;

      // Apply subtle parallax movement (max 50px in each direction)
      const xOffset = xPercent * 50;
      const yOffset = yPercent * 50;

      // Update CSS custom property for the parallax effect
      document.documentElement.style.setProperty('--blueprint-parallax-x', `${xOffset}px`);
      document.documentElement.style.setProperty('--blueprint-parallax-y', `${yOffset}px`);
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.documentElement.style.removeProperty('--blueprint-parallax-x');
      document.documentElement.style.removeProperty('--blueprint-parallax-y');
    };
  }, [style]);

  const appInterfaceContent = (formContent: React.ReactNode) => (
    <div className="container mx-auto px-4 py-4 md:py-5">
      {!disclaimerAccepted && <DisclaimerModal onAccept={acceptDisclaimer} />}
      {showInfoBanner && (
        <div className="flex justify-center mb-3">
          <div className="w-full md:w-full lg:w-11/12 xl:w-10/12 2xl:w-9/12">
            <div
              className="info-banner flex items-center justify-between"
              role="alert"
              style={{ cursor: 'pointer', marginBottom: 0 }}
              onClick={() => navigate('/wiki')}
            >
                <div className="flex flex-col gap-1">
                  <span>
                    <strong>{t('landing.banner.title', 'New here?')}</strong> {t('landing.banner.message', 'Learn about Freedom Bridge and how to bridge TigerOG tokens across chains.')}
                  </span>
                  <span className="text-xs opacity-80">
                    {t('landing.banner.note', 'Note: Token conversion is permanent and cannot be reversed.')}
                  </span>
                </div>
              <div className="banner-dismiss-btn ml-3">
                <XIcon
                  size={22}
                  onMouseEnter={(e) => e.stopPropagation()}
                  onMouseLeave={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDismissBanner();
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="flex justify-center">
        <div className="w-full md:w-full lg:w-11/12 xl:w-10/12 2xl:w-9/12">
          <Card className="main-card">
            <CardHeader>
              <div className="main-nav-pills">
                <div
                  className="nav-background-slider"
                  style={{ transform: `translateX(${activePage === Page.Convert ? '0%' : '100%'})` }}
                />
                <Button
                  type="button"
                  className={`tab-button ${activePage === Page.Convert ? "active" : ""}`}
                  onClick={() => handleNavigate(Page.Convert)}
                >
                  {t('tabs.convert')}
                </Button>
                <Button
                  type="button"
                  className={`tab-button ${activePage === Page.Bridge ? "active" : ""}`}
                  onClick={() => handleNavigate(Page.Bridge)}
                >
                  {t('tabs.bridge')}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="main-card-body">
              {formContent}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="bridge-container">
        <nav className="navbar-custom">
          <div className="w-full px-4 navbar-container-custom">
            <div className="navbar-inner">
              {/* Hamburger menu button - always visible on left */}
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  setShowMobileMenu(true);
                }}
                className="hamburger-btn"
                aria-label="Menu"
              >
                <MenuIcon size={24} />
              </Button>

              <div className="navbar-brand-custom" onClick={() => navigate('/')} style={{ cursor: "pointer" }}>
                <span className="brand-text">
                  <span className="brand-tiger">{t('app.titleFreedom')}</span>
                  <span className="brand-separator"> </span>
                  <span className="brand-rails">{t('app.titleBridge')}</span>
                </span>
              </div>

              <div className="flex items-center ml-auto navbar-right-section">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="link"
                      size="sm"
                      className="theme-toggle-btn palette-toggle-btn desktop-only"
                      title={t('nav.switchPalette')}
                    >
                      <PaletteIcon size={24} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="p-2">
                    {paletteOptions.map((option) => (
                      <DropdownMenuItem
                        key={option.id}
                        onClick={() => setStyle(option.id)}
                        className="palette-menu-item"
                        data-active={style === option.id}
                      >
                        <div className="palette-swatch-wrapper">
                          <span
                            className="palette-swatch"
                            style={{ backgroundColor: option.accentColor || 'var(--primary)' }}
                          />
                          <span className="palette-label">{option.label}</span>
                        </div>
                        <Check size={18} className="palette-check" />
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                {/* Theme toggle - visible on desktop only */}
                <Button
                  variant="link"
                  size="sm"
                  onClick={toggleTheme}
                  className="theme-toggle-btn desktop-only"
                  title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
                >
                  {resolvedTheme === 'dark' ? <SunIcon size={24} /> : <MoonIcon size={24} />}
                </Button>

                <DropdownMenu
                  onOpenChange={(isOpen) => {
                    if (!isOpen) {
                      setLanguageQuery("");
                    }
                  }}
                >
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="link"
                      size="sm"
                      className="language-toggle desktop-only"
                      title={t('nav.language')}
                    >
                      <LanguagesIcon size={22} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="language-menu">
                    <div className="language-search">
                      <Input
                        type="text"
                        placeholder={t('nav.languageSearchPlaceholder')}
                        value={languageQuery}
                        onChange={(event) => setLanguageQuery(event.target.value)}
                        className="language-search-input"
                      />
                    </div>
                    {filteredLanguages.length === 0 ? (
                      <div className="language-empty">{t('nav.languageNoResults')}</div>
                    ) : (
                      filteredLanguages.map((option) => (
                        <DropdownMenuItem
                          key={option.code}
                          className={option.code === language ? "bg-accent" : ""}
                          onClick={() => handleLanguageSelect(option.code)}
                        >
                          <div className="language-menu-item">
                            <span className="language-native">{option.nativeName}</span>
                            <span className="language-english">{option.name}</span>
                          </div>
                        </DropdownMenuItem>
                      ))
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                <ConnectButton chainStatus="icon" showBalance={false} />
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile menu sheet */}
        <Sheet
          open={showMobileMenu}
          onOpenChange={(open) => {
            setShowMobileMenu(open);
            if (!open) {
              setLanguageQuery("");
            }
          }}
        >
          <SheetContent side="left" className="mobile-menu-offcanvas p-0 flex flex-col h-full border-r-0">
            <SheetHeader className="mobile-menu-header p-6 border-b border-border/40">
              <div className="flex items-center justify-between w-full">
                <SheetTitle className="text-lg font-bold">{t('nav.menu')}</SheetTitle>
                <SheetDescription className="sr-only">{t('nav.menu')}</SheetDescription>
              </div>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto py-2 min-h-0">
              <div className="px-2 space-y-1">
                <MenuButton
                  icon={<HomeIcon size={20} />}
                  label={t('nav.home')}
                  onClick={() => {
                    setShowMobileMenu(false);
                    navigate("/");
                  }}
                />
                <MenuButton
                  icon={<BookIcon size={20} />}
                  label={t('nav.wiki')}
                  onClick={() => {
                    setShowMobileMenu(false);
                    navigate("/wiki");
                  }}
                />
                <MenuButton
                  icon={<Code size={20} />}
                  label={t('nav.contracts', 'Contracts')}
                  onClick={() => {
                    setShowMobileMenu(false);
                    navigate("/contracts");
                  }}
                />
                <MenuButton
                  icon={<CircleHelpIcon size={20} />}
                  label={t('nav.faq')}
                  onClick={() => {
                    setShowMobileMenu(false);
                    navigate("/faq");
                  }}
                />
                <MenuButton
                  icon={<Network size={20} />}
                  label={t('nav.addNetworks', 'Add Networks')}
                  onClick={() => {
                    setShowMobileMenu(false);
                    setShowAddNetworks(true);
                  }}
                />
              </div>

              <div className="my-4 mx-6 h-px bg-border/40" />

              <div className="px-6 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t('nav.preferences')}
              </div>

              <div className="px-2 space-y-1">
                <MenuButton
                  icon={resolvedTheme === 'dark' ? <SunIcon size={20} /> : <MoonIcon size={20} />}
                  label={t('nav.switchTheme')}
                  value={resolvedTheme === 'dark' ? t('nav.theme.dark') : t('nav.theme.light')}
                  onClick={toggleTheme}
                />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full justify-start px-4 py-6 text-base font-medium hover:bg-accent/50"
                    >
                      <div className="flex items-center w-full">
                        <div className="mr-3 text-muted-foreground">
                          <PaletteIcon size={20} />
                        </div>
                        <span className="flex-1 text-left text-foreground">{t('nav.switchPalette')}</span>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md ml-2">
                          {getPaletteLabel(style)}
                        </span>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-[280px] ml-4 max-h-[300px] overflow-y-auto overscroll-contain p-2"
                    onWheel={(e) => e.stopPropagation()}
                    onCloseAutoFocus={(e) => e.preventDefault()}
                  >
                      {paletteOptions.map((option) => (
                        <DropdownMenuItem
                          key={option.id}
                          onClick={() => {
                            setStyle(option.id);
                            setShowMobileMenu(false);
                          }}
                          className="palette-menu-item"
                          data-active={style === option.id}
                        >
                          <div className="palette-swatch-wrapper">
                            <span
                              className="palette-swatch"
                              style={{ backgroundColor: option.accentColor || 'var(--primary)' }}
                            />
                            <span className="palette-label">{option.label}</span>
                          </div>
                          <Check size={18} className="palette-check" />
                        </DropdownMenuItem>
                      ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu
                  onOpenChange={(isOpen) => {
                    if (!isOpen) {
                      setLanguageQuery("");
                    }
                  }}
                >
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full justify-start px-4 py-6 text-base font-medium hover:bg-accent/50"
                    >
                      <div className="flex items-center w-full">
                        <div className="mr-3 text-muted-foreground">
                          <LanguagesIcon size={20} />
                        </div>
                        <span className="flex-1 text-left text-foreground">{t('nav.language')}</span>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md ml-2">
                          {activeLanguage.nativeName}
                        </span>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-[280px] ml-4 max-h-[350px] overflow-y-auto overscroll-contain"
                    onWheel={(e) => e.stopPropagation()}
                    onCloseAutoFocus={(e) => e.preventDefault()}
                  >
                    <div className="p-2 sticky top-0 bg-popover z-10">
                      <Input
                        type="text"
                        placeholder={t('nav.languageSearchPlaceholder')}
                        value={languageQuery}
                        onChange={(event) => setLanguageQuery(event.target.value)}
                        className="h-9"
                      />
                    </div>
                      {filteredLanguages.length === 0 ? (
                        <div className="p-3 text-sm text-muted-foreground text-center">{t('nav.languageNoResults')}</div>
                      ) : (
                        filteredLanguages.map((option) => (
                          <DropdownMenuItem
                            key={option.code}
                            className={option.code === language ? "bg-accent" : ""}
                            onClick={() => {
                              setShowMobileMenu(false);
                              handleLanguageSelect(option.code);
                            }}
                          >
                            <div className="flex flex-col gap-0.5">
                              <span className="font-medium">{option.nativeName}</span>
                              <span className="text-xs text-muted-foreground">{option.name}</span>
                            </div>
                          </DropdownMenuItem>
                        ))
                      )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="my-4 mx-6 h-px bg-border/40" />

              <div className="px-2 space-y-1">
                <MenuButton
                  icon={<SettingsIcon size={20} />}
                  label={t('nav.settings')}
                  onClick={() => {
                    setShowMobileMenu(false);
                    setShowSettings(true);
                  }}
                />
              </div>
            </div>

            <div className="p-4 border-t border-border/40 mt-auto">
              <div className="w-full flex justify-center items-center p-2 text-sm text-muted-foreground">
                <span className="opacity-70">Version {import.meta.env.VITE_APP_VERSION}</span>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/wiki" element={<WikiPage />} />
          <Route path="/contracts" element={<ContractsPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/disclaimer" element={<DisclaimerPage />} />
          <Route path={`/${Page.Convert}`} element={appInterfaceContent(<ConverterForm />)} />
          <Route path={`/${Page.Bridge}`} element={appInterfaceContent(<BridgeForm />)} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <SettingsModal show={showSettings} onClose={() => setShowSettings(false)} />
        <AddNetworksModal show={showAddNetworks} onClose={() => setShowAddNetworks(false)} />

        <footer
          className="py-6 border-t flex flex-col items-center gap-3 text-sm mt-auto"
          style={{
            borderColor: 'var(--theme-card-border)',
            color: 'var(--theme-text-secondary)'
          }}
        >
          <div className="flex flex-wrap items-center justify-center gap-4">
            <span
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate('/wiki')}
            >
              {t('footer.wiki')}
            </span>
            <span style={{ opacity: 0.4 }}>|</span>
            <span
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate('/contracts')}
            >
              {t('footer.contracts')}
            </span>
            <span style={{ opacity: 0.4 }}>|</span>
            <span
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate('/faq')}
            >
              {t('footer.faq')}
            </span>
            <span style={{ opacity: 0.4 }}>|</span>
            <span
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate('/disclaimer')}
            >
              {t('footer.disclaimer')}
            </span>
            <span style={{ opacity: 0.4 }}>|</span>
            <a
              href="https://github.com/TigerOG-Official/FreedomBridge"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 transition-opacity hover:opacity-80"
              style={{ color: 'var(--theme-text-secondary)' }}
            >
              <Github className="w-4 h-4" />
              <span>{t('footer.github')}</span>
            </a>
          </div>
          <span className="text-xs opacity-60">v{import.meta.env.VITE_APP_VERSION}</span>
        </footer>
      </div>
    </>
  );
}

export default App;