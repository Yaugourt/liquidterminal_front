"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useTopTraders } from "@/services/market/toptraders/hooks/useTopTraders";
import { PerpMarketData } from "@/services/market/perp/types";
import { compactUsd } from "@/lib/formatters/numberFormatting";

function truncateAddress(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

/** Rail door to the Tracker: top-3 PnL of the last 24h. */
export function TopTradersCard() {
  const { traders, isLoading } = useTopTraders({ sort: "pnl_pos", limit: 3 });

  return (
    <div className="bg-surface border border-border-subtle rounded-lg">
      <div className="px-4 py-3 border-b border-border-subtle flex items-baseline justify-between">
        <h3 className="text-[13px] font-medium text-text-primary">Top traders · 24h</h3>
        <Link href="/market/tracker" className="text-[11px] text-brand hover:text-brand-hover">
          Tracker →
        </Link>
      </div>
      <div className="px-4 py-3 space-y-3">
        {isLoading && (traders?.length ?? 0) === 0 && (
          <p className="text-[11.5px] text-text-tertiary">Loading traders…</p>
        )}
        {(traders ?? []).map((t, i) => (
          <div key={t.user} className="flex items-center gap-2.5">
            <span className="mono text-[10.5px] text-text-tertiary w-4 shrink-0">{i + 1}</span>
            <div className="min-w-0 flex-1">
              <div className="mono text-[12px] text-text-primary truncate">{truncateAddress(t.user)}</div>
              <div className="text-[10.5px] text-text-tertiary">
                {compactUsd(t.totalVolume)} vol · {(t.winRate * 100).toFixed(0)}% win
              </div>
            </div>
            <span className="mono text-[12.5px] text-success shrink-0">
              +{compactUsd(t.totalPnl)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const MAJORS = new Set(["BTC", "ETH", "HYPE"]);

/**
 * Funding watch: the majors' hourly funding plus the biggest outlier of the
 * top-volume set — computed from the same perp list the venue card uses.
 */
export function FundingWatchCard({ markets }: { markets: PerpMarketData[] }) {
  const rows = useMemo(() => {
    if (markets.length === 0) return [];
    const majors = markets.filter((m) => MAJORS.has(m.name));
    const outlier = [...markets]
      .filter((m) => !MAJORS.has(m.name) && typeof m.funding === "number")
      .sort((a, b) => Math.abs(b.funding) - Math.abs(a.funding))[0];
    const list = outlier ? [outlier, ...majors] : majors;
    return list.map((m) => ({
      name: m.name,
      funding: m.funding,
      isOutlier: outlier ? m.name === outlier.name : false,
    }));
  }, [markets]);

  if (rows.length === 0) return null;

  return (
    <div className="bg-surface border border-border-subtle rounded-lg">
      <div className="px-4 py-3 border-b border-border-subtle flex items-baseline justify-between">
        <h3 className="text-[13px] font-medium text-text-primary">Funding · hourly</h3>
        <span className="text-[10px] text-text-tertiary">core perps · top volume</span>
      </div>
      <div className="px-4 py-3 space-y-2.5">
        {rows.map((r) => (
          <div key={r.name} className="flex items-center justify-between gap-2 text-[12px]">
            <span className="flex items-center gap-2 min-w-0">
              <span className="text-text-primary truncate">{r.name}</span>
              {r.isOutlier && (
                <span className="text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-gold/10 border border-gold/25 text-gold shrink-0">
                  elevated
                </span>
              )}
            </span>
            {/* `funding` is already a percentage (same convention as the perp table). */}
            <span className={`mono ${r.funding >= 0 ? "text-success" : "text-danger"}`}>
              {r.funding >= 0 ? "+" : ""}
              {r.funding.toFixed(6)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
