"use client";

import { Radio } from "lucide-react";

/** Inline label for blocks sourced from Hyperliquid REST / WS (live). */
export function LiveHyperliquidBanner() {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border-subtle bg-brand-secondary/40 px-3 py-2 text-xs text-text-secondary">
      <span className="inline-flex items-center gap-1 rounded-md bg-brand-accent/10 px-2 py-0.5 font-semibold uppercase tracking-wide text-brand-accent">
        <Radio className="h-3.5 w-3.5" aria-hidden />
        Live · Hyperliquid
      </span>
      <span className="text-text-muted">REST + WebSocket — execution reference</span>
    </div>
  );
}
