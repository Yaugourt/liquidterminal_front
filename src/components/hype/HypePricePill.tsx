"use client";

import { memo } from "react";
import { useHypePrice, useHypeSupply } from "@/services/market/hype";
import { formatPrice } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import { HypeMark } from "@/components/common";
import { fmtSignedPct } from "./format";

/**
 * HypePricePill — live HYPE price ticker for the page header `actions` slot.
 * Price comes from the trades socket; the 24h change is computed against the
 * info API's previous-day mark so it stays correct before the first tick.
 */
export const HypePricePill = memo(function HypePricePill() {
  const { price: livePrice, lastSide } = useHypePrice();
  const { supply } = useHypeSupply();
  const { format } = useNumberFormat();

  const price = livePrice && livePrice > 0 ? livePrice : supply?.markPx ?? null;
  const change =
    price != null && supply && supply.prevDayPx > 0
      ? ((price - supply.prevDayPx) / supply.prevDayPx) * 100
      : null;

  const tickColor =
    lastSide === "B" ? "text-success" : lastSide === "A" ? "text-danger" : "text-text-primary";
  const changeColor =
    change == null ? "text-text-tertiary" : change >= 0 ? "text-success" : "text-danger";

  return (
    <div className="flex items-center gap-2 rounded-lg border border-border-subtle bg-surface px-3 py-1.5">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
      </span>
      <HypeMark size="xs" className="text-[10px] uppercase tracking-[0.08em] text-text-tertiary" />
      <span className={`mono text-[15px] font-semibold tabular-nums transition-colors ${tickColor}`}>
        {price != null ? formatPrice(price, format) : "—"}
      </span>
      <span className={`mono text-[11px] font-semibold ${changeColor}`}>
        {fmtSignedPct(change)}
      </span>
    </div>
  );
});
