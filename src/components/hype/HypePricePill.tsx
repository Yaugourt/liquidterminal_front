"use client";

import { memo } from "react";
import { useHypeDayChange, useHypePrice } from "@/services/market/hype";
import { formatPrice } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import { HypeMark } from "@/components/common";
import { fmtSignedPct } from "./format";

/**
 * HypePricePill — live HYPE price ticker for the page header `actions` slot.
 * Everything comes from the HYPE socket, like the sidebar badge: the last
 * trade (else the asset context's mark) and the 24h change against the
 * context's previous-day price, so it shows before the first trade. The /hype
 * layout mounts it on every chapter: no supply poll for chapters that show
 * no supply.
 */
export const HypePricePill = memo(function HypePricePill() {
  const { lastSide } = useHypePrice();
  const { price, change24hPct: change } = useHypeDayChange();
  const { format } = useNumberFormat();

  const tickColor =
    lastSide === "B" ? "text-success" : lastSide === "A" ? "text-danger" : "text-text-primary";
  const changeColor =
    change == null ? "text-text-tertiary" : change >= 0 ? "text-success" : "text-danger";

  return (
    <div className="flex items-center gap-2 rounded-lg border border-border-subtle bg-surface px-3 py-1.5">
      {/* Static dot (no endless ping: it keeps the page painting frames). */}
      <span className="relative flex h-1.5 w-1.5">
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
