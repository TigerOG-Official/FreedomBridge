import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { applyExternalPalette, externalPalettes } from '../themes/registry';

type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';
export type ThemeStyle = string;

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  style: ThemeStyle;
  setStyle: (style: ThemeStyle) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'tiger-bridge-theme';
const STYLE_STORAGE_KEY = 'tiger-bridge-style';

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(theme: Theme): ResolvedTheme {
  return theme === 'system' ? getSystemTheme() : theme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
    return 'dark'; // Default to dark
  });
  const paletteIds = useMemo(() => externalPalettes.map((p) => p.id), []);
  const defaultStyle = paletteIds.includes('deepspace') ? 'deepspace' : (paletteIds.includes('classic') ? 'classic' : paletteIds[0] ?? 'classic');

  const [style, setStyleState] = useState<ThemeStyle>(() => {
    const stored = localStorage.getItem(STYLE_STORAGE_KEY);
    if (stored && paletteIds.includes(stored)) {
      return stored;
    }
    return defaultStyle;
  });

  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => resolveTheme(theme));

  useEffect(() => {
    const resolved = resolveTheme(theme);
    setResolvedTheme(resolved);

    // Apply theme to document
    document.documentElement.setAttribute('data-theme', resolved);

    // Also add class for easier styling
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(resolved);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-style', style);
    if (paletteIds.includes(style)) {
      applyExternalPalette(style);
    } else {
      applyExternalPalette(null);
    }
  }, [style, paletteIds]);

  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setResolvedTheme(e.matches ? 'dark' : 'light');
      document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);
  };

  const setStyle = (newStyle: ThemeStyle) => {
    setStyleState(newStyle);
    localStorage.setItem(STYLE_STORAGE_KEY, newStyle);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, style, setStyle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
