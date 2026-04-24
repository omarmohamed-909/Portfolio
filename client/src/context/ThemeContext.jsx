import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const ThemeContext = createContext(undefined);

const STORAGE_KEY = "portfolio-theme";

/**
 * Resolves the effective theme (light | dark) from a stored preference.
 * If nothing is stored or the value is "system", we fall back to the OS preference.
 */
const getInitialTheme = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "dark" || stored === "light") return stored;
  } catch {
    // localStorage may not be available (SSR, privacy mode, etc.)
  }
  // Default: respect OS preference, fall back to dark
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  }
  return "dark";
};

/**
 * Apply the theme to the root <html> element so CSS can react via
 * `[data-theme="dark"]` / `[data-theme="light"]` selectors.
 */
const applyTheme = (theme) => {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);

  // Also toggle the .dark class for Tailwind/shadcn compatibility
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
};

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(getInitialTheme);

  // Apply theme on first render & whenever it changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Persist & apply
  const setTheme = useCallback((newTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch {
      // Silently fail if localStorage is unavailable
    }
    applyTheme(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  const isDark = theme === "dark";

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to access theme state & controls.
 *
 * @returns {{ theme: "light"|"dark", setTheme: (t: string) => void, toggleTheme: () => void, isDark: boolean }}
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export default ThemeContext;
