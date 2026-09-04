"use client";

import { useState } from "react";
import Link from "next/link";
import { ShareTile } from "@/components/common";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import { useBiggestTrades } from "@/services/market/biggest-trades";

function truncateAddress(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

type Mode = "wins" | "losses";

// Compact hold duration: 3.4h · 2.1d.
function fmtHold(s: number): string {
  if (!Number.isFinite(s) || s <= 0) return "";
  if (s < 3600) return `${Math.round(s / 60)}m`;
  if (s < 86400) return `${(s / 3600).toFixed(1)}h`;
  return `${(s / 86400).toFixed(1)}d`;
}

/**
 * Biggest closed round-trip trades on Hyperliquid, ranked by realized PnL —
 * the market's largest wins or losses, wallet and coin attached. Only-here:
 * no HL dashboard surfaces the biggest closed trades market-wide.
 */
export function BiggestTradesCard() {
  const [mode, setMode] = useState<Mode>("wins");
  const { trades, isLoading } = useBiggestTrades(mode === "wins" ? "DESC" : "ASC", 5);

  const pill = (m: Mode, label: string) => (
    <button
      onClick={() => setMode(m)}
      className={`text-[10.5px] px-2 py-0.5 rounded transition-colors ${
        mode === m
          ? "bg-brand/15 text-brand"
          : "text-text-tertiary hover:text-text-secondary"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="bg-surface border border-border-subtle rounded-lg">
      <div className="px-4 py-3 border-b border-border-subtle flex items-baseline justify-between gap-2">
        <h3 className="text-[13px] font-medium text-text-primary">Biggest trades</h3>
        <div className="flex items-center gap-1">
          {pill("wins", "Wins")}
          {pill("losses", "Losses")}
          <ShareTile src="/api/tile/biggest-trade" filename="biggest-trades" />
        </div>
      </div>
      <div className="px-4 py-3 space-y-3">
        {isLoading && trades.length === 0 && (
          <p className="text-[11.5px] text-text-tertiary">Loading trades…</p>
        )}
        {trades.map((t, i) => {
          const hold = fmtHold(t.duration_s);
          const isLong = t.direction?.toLowerCase() === "long";
          return (
            <Link
              key={`${t.trade_id}-${i}`}
              href={`/market/tracker/wallet/${t.user}`}
              className="flex items-center gap-2.5 group"
            >
              <span className="mono text-[10.5px] text-text-tertiary w-4 shrink-0">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <div className="text-[12px] text-text-primary truncate group-hover:text-brand">
                  {t.coin}{" "}
                  <span className={isLong ? "text-success" : "text-danger"}>
                    {isLong ? "L" : "S"}
                  </span>
                </div>
                <div className="mono text-[10.5px] text-text-tertiary truncate">
                  {truncateAddress(t.user)}
                  {hold && ` · ${hold}`}
                </div>
              </div>
              <span
                className={`mono text-[12.5px] shrink-0 ${
                  t.pnl_realized >= 0 ? "text-success" : "text-danger"
                }`}
              >
                {t.pnl_realized >= 0 ? "+" : "-"}
                {compactUsd(Math.abs(t.pnl_realized))}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
