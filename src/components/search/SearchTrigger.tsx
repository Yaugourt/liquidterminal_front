"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGlobalSearch } from "@/store/use-global-search";

interface SearchTriggerProps {
  /** "header": compact topbar field. "hero": large landing field. */
  variant?: "header" | "hero";
  className?: string;
}

/**
 * Input-looking button that opens the global search palette. Every search
 * entry point on the site goes through this so behaviour stays identical.
 */
export function SearchTrigger({ variant = "header", className }: SearchTriggerProps) {
  const setOpen = useGlobalSearch((s) => s.setOpen);
  const [isMac, setIsMac] = useState(true);

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.userAgent));
  }, []);

  const hero = variant === "hero";

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label="Search Hyperliquid"
      className={cn(
        "group flex w-full items-center gap-3 rounded-lg border bg-surface text-left transition-colors",
        hero
          ? "h-12 px-4 border-border-default hover:border-brand/60"
          : "h-9 px-3 rounded-md bg-surface-2 border-border-subtle hover:border-border-default",
        className
      )}
    >
      <Search className={cn("shrink-0 text-text-tertiary", hero ? "h-4 w-4" : "h-3.5 w-3.5")} />
      <span className={cn("flex-1 truncate text-text-tertiary", hero ? "text-[13px]" : "text-[12px]")}>
        {hero ? "Search tokens, wallets, validators, vaults…" : "Search…"}
      </span>
      <kbd
        className={cn(
          "mono shrink-0 rounded-md border border-border-subtle bg-surface-2 text-text-tertiary",
          hero ? "px-1.5 py-0.5 text-[11px]" : "px-1 py-px text-[10px]"
        )}
      >
        {isMac ? "⌘K" : "Ctrl K"}
      </kbd>
    </button>
  );
}
