"use client";

import { Activity } from "lucide-react";
import { Card } from "@/components/ui/card";
import { KpiRibbon, StackedShareBar, TooltipIcon, type KpiCell } from "@/components/common";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import type { Hip4TradeFlow } from "@/lib/hip4/trade-flow";

interface Hip4PositioningBarProps {
  flow: Hip4TradeFlow;
  /** Selected outcome label (e.g. "Yes", "San Antonio"). */
  outcomeLabel?: string;
  isLoading?: boolean;
}

function signedUsd(v: number): string {
  const sign = v > 0 ? "+" : v < 0 ? "−" : "";
  return `${sign}${compactUsd(Math.abs(v))}`;
}

/**
 * Trade-flow / positioning panel. HIP-4 has no holdings or open-interest feed
 * (those fields are null), so this is derived purely from the fills feed and is
 * explicitly framed as OBSERVED TRADE FLOW — capital that bought vs sold this
 * outcome — not point-in-time positions. Built on `<StackedShareBar>` +
 * `<KpiRibbon>` (never hand-rolled).
 */
export function Hip4PositioningBar({ flow, outcomeLabel, isLoading }: Hip4PositioningBarProps) {
  const { buy, sell, net, volume, traderCount, top5Share } = flow;

  const cells: KpiCell[] = [
    {
      key: "net",
      label: "Net Flow",
      value: signedUsd(net),
      tone: net > 0 ? "success" : net < 0 ? "danger" : "default",
    },
    { key: "vol", label: "Flow Volume", value: compactUsd(volume) },
    { key: "traders", label: "Traders", value: String(traderCount) },
    {
      key: "top5",
      label: "Top 5 Share",
      value: volume > 0 ? `${(top5Share * 100).toFixed(0)}%` : "—",
    },
  ];

  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="flex items-center gap-2.5 border-b border-border-subtle px-3.5 py-2.5">
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-brand/10">
          <Activity size={13} className="text-brand" />
        </span>
        <h3 className="text-[13px] font-semibold text-text-primary">Trade Flow</h3>
        {outcomeLabel && (
          <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[10px] font-semibold text-text-tertiary">
            {outcomeLabel}
          </span>
        )}
        <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
          Observed fills
          <TooltipIcon>
            Capital that bought vs sold this outcome, summed from the fills feed. HIP-4 exposes no
            holdings or open-interest data, so this reflects trade flow — not point-in-time
            positions.
          </TooltipIcon>
        </span>
      </div>

      <div className="space-y-3 p-3.5">
        {volume > 0 ? (
          <>
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-success">Bought {compactUsd(buy)}</span>
              <span className="font-semibold text-danger">Sold {compactUsd(sell)}</span>
            </div>
            <StackedShareBar
              height={10}
              segments={[
                { key: "buy", value: buy, colorClass: "bg-success", label: `Bought ${compactUsd(buy)}` },
                { key: "sell", value: sell, colorClass: "bg-danger", label: `Sold ${compactUsd(sell)}` },
              ]}
            />
          </>
        ) : (
          <p className="text-[11.5px] text-text-tertiary">
            {isLoading ? "Loading trade flow…" : "No trades observed for this outcome yet."}
          </p>
        )}

        <div className="pt-1">
          <KpiRibbon cells={cells} />
        </div>
      </div>
    </Card>
  );
}
