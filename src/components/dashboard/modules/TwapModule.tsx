"use client";

import { memo, useMemo } from "react";
import { Activity } from "lucide-react";
import { OverviewModule, ModuleRow, ModuleSubhead } from "../OverviewModule";
import { useTwapOrders } from "@/services/market/order";
import { compactUsd } from "@/lib/formatters/numberFormatting";

/** TwapModule — résumé des ordres TWAP actifs sur le Dashboard. */
export const TwapModule = memo(function TwapModule() {
  const { orders, isLoading, total, totalVolume, metadata } = useTwapOrders({
    limit: 100,
    status: "active",
  });

  const top = useMemo(
    () => [...orders].sort((a, b) => b.totalValueUSD - a.totalValueUSD).slice(0, 5),
    [orders],
  );

  return (
    <OverviewModule
      title="Active TWAPs"
      icon={Activity}
      href="/market/perp"
      isLoading={isLoading}
      stats={[
        { label: "Active Orders", value: `${metadata?.activeOrders ?? total}` },
        { label: "Total Volume", value: compactUsd(totalVolume) },
      ]}
    >
      <ModuleSubhead>Largest active</ModuleSubhead>
      {top.map((o) => {
        const isBuy = o.action.twap.b;
        const pct = Math.min(100, Math.max(0, Math.round(o.progressionPercent)));
        return (
          <ModuleRow
            key={o.hash}
            left={
              <>
                <span
                  className={`mono text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0 ${
                    isBuy ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                  }`}
                >
                  {isBuy ? "BUY" : "SELL"}
                </span>
                <span className="font-medium text-text-primary truncate">{o.tokenSymbol}</span>
              </>
            }
            right={
              <>
                <span className="mono text-[12px] text-text-secondary">
                  {compactUsd(o.totalValueUSD)}
                </span>
                <div className="flex items-center gap-1.5 w-20">
                  <div className="flex-1 h-1 rounded-full bg-surface-3 overflow-hidden">
                    <div
                      className="h-full bg-brand"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="mono text-[11px] text-text-tertiary w-8 text-right">
                    {pct}%
                  </span>
                </div>
              </>
            }
          />
        );
      })}
    </OverviewModule>
  );
});
