"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

/**
 * V4 theme toggle — header icon-btn.
 *
 * Flips `data-theme` on <html> and persists to localStorage. Light-mode
 * token set lands in a later pass; until then this only switches the
 * attribute (dark stays the effective theme). Kept in the header so the
 * chrome matches the V4 reference.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const saved = (localStorage.getItem("theme") as "dark" | "light" | null) ?? "dark";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      title="Toggle theme"
      aria-label="Toggle theme"
      className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-border-subtle bg-surface-2 text-text-secondary hover:text-text-primary hover:bg-surface-3 transition-colors"
    >
      {theme === "dark" ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
    </button>
  );
}
