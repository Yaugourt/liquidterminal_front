"use client";

import { memo } from "react";
import { Activity } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useTwapOrders } from "@/services/market/order";
import { compactUsd } from "@/lib/formatters/numberFormatting";

/** Formate une durée en minutes vers un libellé compact "Xh Ym". */
function formatDuration(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes <= 0) return "—";
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/** Formate une taille (string décimale) en nombre compact lisible. */
function formatSize(size: string): string {
  const n = Number(size);
  if (!Number.isFinite(n)) return size;
  if (Math.abs(n) >= 1000) return compactUsd(n).replace("$", "");
  return n.toLocaleString("en-US", { maximumFractionDigits: 4 });
}

export const TwapPanel = memo(function TwapPanel() {
  const { orders, total, totalVolume, metadata } = useTwapOrders({
    limit: 100,
    status: "active",
  });

  const count = metadata?.activeOrders ?? total;

  const topOrders = [...orders]
    .sort((a, b) => b.totalValueUSD - a.totalValueUSD)
    .slice(0, 8);

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

      {/* En-tête du mini-tableau */}
      <div className="grid grid-cols-[40px_1fr_72px_64px_60px_84px] gap-2 px-3.5 py-1.5 border-b border-border-subtle bg-surface-2/40">
        <span className="text-[9px] font-semibold uppercase tracking-wider text-text-tertiary">
          Side
        </span>
        <span className="text-[9px] font-semibold uppercase tracking-wider text-text-tertiary">
          Token
        </span>
        <span className="text-[9px] font-semibold uppercase tracking-wider text-text-tertiary text-right">
          Value
        </span>
        <span className="text-[9px] font-semibold uppercase tracking-wider text-text-tertiary text-right">
          Size
        </span>
        <span className="text-[9px] font-semibold uppercase tracking-wider text-text-tertiary text-right">
          Duration
        </span>
        <span className="text-[9px] font-semibold uppercase tracking-wider text-text-tertiary text-right">
          Progress
        </span>
      </div>

      <div>
        {topOrders.length === 0 ? (
          <div className="px-3.5 py-6 text-center text-[11px] text-text-tertiary">
            No active TWAP orders
          </div>
        ) : (
          topOrders.map((order) => {
            const { twap } = order.action;
            const isBuy = twap.b;
            const pct = Math.min(
              100,
              Math.max(0, Math.round(order.progressionPercent))
            );

            return (
              <div
                key={order.hash}
                className="grid grid-cols-[40px_1fr_72px_64px_60px_84px] items-center gap-2 px-3.5 py-2 border-t border-border-subtle first:border-t-0"
              >
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded justify-self-start ${
                    isBuy ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                  }`}
                >
                  {isBuy ? "BUY" : "SELL"}
                </span>
                <span className="font-semibold text-[12px] text-text-primary truncate">
                  {order.tokenSymbol}
                </span>
                <span className="mono text-[11px] text-text-secondary text-right">
                  {compactUsd(order.totalValueUSD)}
                </span>
                <span className="mono text-[11px] text-text-tertiary text-right">
                  {formatSize(twap.s)}
                </span>
                <span className="mono text-[11px] text-text-tertiary text-right">
                  {formatDuration(twap.m)}
                </span>
                <span className="flex items-center gap-1.5 justify-self-end w-full">
                  <span className="flex-1 h-1 rounded bg-surface-3 overflow-hidden">
                    <i
                      className="block h-full bg-brand"
                      style={{ width: `${pct}%` }}
                    />
                  </span>
                  <span className="mono text-[10px] text-text-tertiary w-8 text-right">
                    {pct}%
                  </span>
                </span>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
});
