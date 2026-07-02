"use client";

import { memo, type ComponentType } from "react";
import { Coins, Landmark, Repeat, Flame, ChevronRight, RotateCw } from "lucide-react";

interface FlywheelStep {
  Icon: ComponentType<{ size?: number; className?: string }>;
  label: string;
  sub: string;
}

interface FlywheelDiagramProps {
  dailyRevenueUsd: string;
  dailyBuybackHype: string;
  feeSharePct: number;
}

/**
 * FlywheelDiagram — the HYPE value loop rendered as a left-to-right flow:
 * trading fees → Assistance Fund → open-market buyback → out of float, closing
 * on a "scarcity ↑" badge. Pure presentational; live figures are passed in.
 */
export const FlywheelDiagram = memo(function FlywheelDiagram({
  dailyRevenueUsd,
  dailyBuybackHype,
  feeSharePct,
}: FlywheelDiagramProps) {
  const steps: FlywheelStep[] = [
    { Icon: Coins, label: "Trading fees", sub: `${dailyRevenueUsd}/day` },
    { Icon: Landmark, label: "Assistance Fund", sub: `~${feeSharePct}% routed` },
    { Icon: Repeat, label: "HYPE buyback", sub: `≈${dailyBuybackHype}/day` },
    { Icon: Flame, label: "Out of float", sub: "held · burned" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-2">
      {steps.map((s, i) => (
        <div key={s.label} className="flex items-center gap-1.5">
          <div className="flex items-center gap-2 rounded-lg border border-border-subtle bg-surface-2 px-2.5 py-1.5">
            <s.Icon size={14} className="text-brand shrink-0" />
            <div className="leading-tight">
              <div className="text-[11px] font-semibold text-text-primary whitespace-nowrap">
                {s.label}
              </div>
              <div className="mono text-[10px] text-text-tertiary whitespace-nowrap">{s.sub}</div>
            </div>
          </div>
          {i < steps.length - 1 && (
            <ChevronRight size={14} className="text-text-tertiary shrink-0" />
          )}
        </div>
      ))}
      <div className="flex items-center gap-1.5 ml-0.5">
        <ChevronRight size={14} className="text-text-tertiary shrink-0" />
        <div className="flex items-center gap-1.5 rounded-lg border border-brand/25 bg-brand/10 px-2.5 py-1.5">
          <RotateCw size={13} className="text-brand shrink-0" />
          <span className="text-[11px] font-semibold text-brand whitespace-nowrap">
            Scarcity ↑
          </span>
        </div>
      </div>
    </div>
  );
});
