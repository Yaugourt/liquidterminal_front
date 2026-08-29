"use client";

import Link from "next/link";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import { useTwapFlow } from "@/services/market/twap-flow";

function truncateAddress(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

/**
 * Biggest TWAP flows over 24h — the largest sliced buy/sell orders on
 * Hyperliquid, by executed notional. Only-here: no HL dashboard surfaces the
 * biggest active/recent TWAP accumulation and distribution market-wide.
 */
export function TwapFlowCard() {
  const { twaps, isLoading } = useTwapFlow(6);

  // Nothing sizeable is executing right now — stay out of the way.
  if (!isLoading && twaps.length === 0) return null;

  return (
    <div className="bg-surface border border-border-subtle rounded-lg">
      <div className="px-4 py-3 border-b border-border-subtle flex items-baseline justify-between">
        <h3 className="text-[13px] font-medium text-text-primary">TWAP flow</h3>
        <span className="text-[10px] text-text-tertiary">biggest · 24h</span>
      </div>
      <div className="px-4 py-3 space-y-3">
        {isLoading && twaps.length === 0 && (
          <p className="text-[11.5px] text-text-tertiary">Loading TWAPs…</p>
        )}
        {twaps.map((t) => {
          const isBuy = t.side === "B";
          const progress = t.sz > 0 ? Math.min(100, (t.executedSz / t.sz) * 100) : 0;
          const live = t.status === "activated";
          return (
            <Link
              key={t.twapId}
              href={`/market/tracker/wallet/${t.user}`}
              className="flex items-center gap-2.5 group"
            >
              <div className="min-w-0 flex-1">
                <div className="text-[12px] text-text-primary truncate group-hover:text-brand">
                  {t.coin}{" "}
                  <span className={isBuy ? "text-success" : "text-danger"}>
                    {isBuy ? "Buy" : "Sell"}
                  </span>
                  {live && (
                    <span className="ml-1 text-[9px] uppercase tracking-wide text-brand">live</span>
                  )}
                </div>
                <div className="mono text-[10.5px] text-text-tertiary truncate">
                  {truncateAddress(t.user)} · {progress.toFixed(0)}% over {t.minutes}m
                </div>
              </div>
              <span className="mono text-[12.5px] text-text-primary shrink-0">
                {compactUsd(t.executedNtl)}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
