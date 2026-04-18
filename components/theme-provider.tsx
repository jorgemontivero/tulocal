"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { THEME_KEY } from "@/lib/theme-constants";
import { themeCookiePair, type ThemeValue } from "@/lib/theme-cookie";

type Theme = ThemeValue;

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyThemeToDocument(theme: Theme) {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
}

function setThemeCookieClient(theme: Theme) {
  if (typeof document === "undefined") {
    return;
  }
  document.cookie = themeCookiePair(theme);
}

type ThemeProviderProps = {
  children: ReactNode;
  /** Tema desde la cookie en el servidor; debe coincidir con la clase `dark` en `<html>`. */
  initialTheme: Theme;
};

export function ThemeProvider({ children, initialTheme }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(initialTheme);

  useLayoutEffect(() => {
    try {
      const stored = localStorage.getItem(THEME_KEY);
      if (
        (stored === "dark" || stored === "light") &&
        stored !== initialTheme
      ) {
        queueMicrotask(() => {
          setThemeState(stored);
        });
      }
    } catch {
      /* ignore */
    }
  }, [initialTheme]);

  const setTheme = useCallback((nextTheme: Theme) => {
    setThemeState(nextTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  }, []);

  useEffect(() => {
    applyThemeToDocument(theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
      setThemeCookieClient(theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [setTheme, theme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme debe usarse dentro de ThemeProvider.");
  }

  return context;
}
