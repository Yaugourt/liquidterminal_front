"use client";

import { memo } from "react";
import { Activity } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useTwapOrders } from "@/services/market/order";
import { compactUsd } from "@/lib/formatters/numberFormatting";

export const TwapPanel = memo(function TwapPanel() {
  const { orders, total, totalVolume, metadata } = useTwapOrders({
    limit: 100,
    status: "active",
  });

  const count = metadata?.activeOrders ?? total;

  const topOrders = [...orders]
    .sort((a, b) => b.totalValueUSD - a.totalValueUSD)
    .slice(0, 5);

  return (
    <Card className="overflow-hidden flex flex-col">
      <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
            <Activity size={13} className="text-brand" />
          </span>
          <h3 className="text-[13px] font-semibold text-text-primary">Active TWAPs</h3>
        </div>
        <span className="text-[11px] text-text-tertiary mono">
          {count} · {compactUsd(totalVolume)}
        </span>
      </div>

      <div>
        {topOrders.map((order) => {
          const isBuy = order.action.twap.b;
          const pct = Math.min(
            100,
            Math.max(0, Math.round(order.progressionPercent))
          );

          return (
            <div
              key={order.hash}
              className="flex items-center gap-2.5 px-3.5 py-2 border-t border-border-subtle first:border-t-0"
            >
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                  isBuy ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                }`}
              >
                {isBuy ? "BUY" : "SELL"}
              </span>
              <span className="font-semibold w-[44px] text-text-primary">
                {order.tokenSymbol}
              </span>
              <span className="flex-1 h-1 rounded bg-surface-3 overflow-hidden">
                <i className="block h-full bg-brand" style={{ width: `${pct}%` }} />
              </span>
              <span className="mono text-[11px] text-text-tertiary w-9 text-right">
                {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
});
