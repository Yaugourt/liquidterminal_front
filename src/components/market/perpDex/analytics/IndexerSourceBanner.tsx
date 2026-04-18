"use client";

import { Database } from "lucide-react";

type IndexerSourceBannerProps = {
  /** Short note shown next to the badge (e.g. observation window). */
  subtitle?: string;
};

/**
 * Explains that the adjacent block uses Liquid Terminal indexer (HypeDexer),
 * not live Hyperliquid node data — avoids implying a single source of truth.
 */
export function IndexerSourceBanner({ subtitle }: IndexerSourceBannerProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-xl border border-border-subtle bg-brand-secondary/40 px-3 py-2.5 text-xs text-text-secondary">
      <div className="flex items-center gap-2 shrink-0">
        <span className="inline-flex items-center gap-1 rounded-md bg-brand-gold/10 px-2 py-0.5 font-semibold uppercase tracking-wide text-brand-gold">
          <Database className="h-3.5 w-3.5" aria-hidden />
          Indexed · HIP-3
        </span>
        <span className="text-text-muted hidden sm:inline">Liquid Terminal indexer</span>
      </div>
      <p className="text-text-muted sm:ml-auto sm:text-right min-w-0">
        {subtitle ??
          "Volumes and OI may differ from the Hyperliquid live panel; use live cards for execution reference."}
      </p>
    </div>
  );
}
