"use client";

import { useMemo, useState } from "react";
import { BarChart3, DollarSign } from "lucide-react";
import {
  ChartLoading,
  ChartEmpty,
  ChartWatermark,
  FlowGrid,
  FlowBar,
  chartPalette,
} from "@/components/common";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import type { BuilderTopRow } from "@/services/indexer/builders/types";
import { formatBuilderDisplayNameOrAddress } from "./formatBuilderDisplayName";

interface BuildersFlowChartProps {
  rows: BuilderTopRow[];
  isLoading: boolean;
  timeframe: string;
}

export function BuildersFlowChart({ rows, isLoading, timeframe }: BuildersFlowChartProps) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const top = useMemo(
    () => [...rows].sort((a, b) => (b.totalVolume ?? 0) - (a.totalVolume ?? 0)).slice(0, 10),
    [rows]
  );

  const maxVol = Math.max(...top.map((r) => r.totalVolume ?? 0), 1);

  const totals = useMemo(() => {
    const vol = top.reduce((s, r) => s + (r.totalVolume ?? 0), 0);
    const fees = top.reduce((s, r) => s + (r.totalBuilderFees ?? 0), 0);
    return { vol, fees };
  }, [top]);

  return (
    <div className="bg-surface border border-border-subtle rounded-lg overflow-hidden">
      {/* CARD HEADER (V4 ref: px-3.5 py-3 border-b, title-row + small tabs) */}
      <div className="flex items-center justify-between px-3.5 py-3 border-b border-border-subtle gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="h-[5px] w-[5px] rounded-full bg-brand shrink-0" />
          <span className="text-[11px] uppercase tracking-wide font-medium text-text-tertiary truncate">
            Volume vs Builder Fees · Top 10 · {timeframe}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-medium uppercase tracking-wider shrink-0">
          <span className="flex items-center gap-1.5 text-brand">
            <BarChart3 className="h-3 w-3" />
            Volume
          </span>
          <span className="flex items-center gap-1.5 text-gold">
            <DollarSign className="h-3 w-3" />
            Fees
          </span>
        </div>
      </div>

      {/* CARD BODY */}
      <div className="relative p-3.5 min-h-[320px]">
        <ChartWatermark />
        {isLoading && top.length === 0 ? (
          <ChartLoading />
        ) : top.length === 0 ? (
          <ChartEmpty message="No builder data" />
        ) : (
          <div className="relative z-10 flex flex-col">
            {/* Total + sub */}
            <div className="flex items-baseline justify-between mb-3 px-1">
              <div className="mono text-[18px] font-semibold text-text-primary leading-none">
                {compactUsd(totals.vol)}
              </div>
              <div className="mono text-[10px] uppercase tracking-wider text-text-tertiary">
                {compactUsd(totals.fees)} fees · top 10
              </div>
            </div>

            <FlowGrid
              rows={top}
              rowKey={(r) => r.builder}
              onHoverChange={setHoverIdx}
              columns={[
                {
                  header: "#",
                  width: 20,
                  align: "right",
                  render: (_, i) => (
                    <span className="mono text-[10px] text-text-tertiary">{i + 1}</span>
                  ),
                },
                {
                  header: "Builder",
                  width: 80,
                  render: (row) => {
                    const name = formatBuilderDisplayNameOrAddress(
                      row.builderName,
                      row.builder,
                    );
                    const isAnonymous = name.startsWith("0x");
                    return (
                      <span
                        className={`text-[11px] truncate ${
                          isAnonymous ? "mono text-text-secondary" : "font-medium text-text-primary"
                        }`}
                      >
                        {name}
                      </span>
                    );
                  },
                },
                {
                  header: "Volume",
                  width: "1fr",
                  render: (row, i) => (
                    <FlowBar
                      ratio={(row.totalVolume ?? 0) / maxVol}
                      delay={i * 0.03}
                      variant="solid"
                      color={chartPalette.accent}
                      minVisiblePct={6}
                      label={compactUsd(row.totalVolume ?? 0)}
                    />
                  ),
                },
                {
                  header: "Fees",
                  width: 70,
                  align: "right",
                  render: (row) => (
                    <span className="mono text-[11px] text-text-secondary">
                      {compactUsd(row.totalBuilderFees ?? 0)}
                    </span>
                  ),
                },
                {
                  header: "Efficiency",
                  width: 60,
                  align: "right",
                  render: (row) => {
                    const vol = row.totalVolume ?? 0;
                    const fees = row.totalBuilderFees ?? 0;
                    const bps = vol > 0 ? (fees / vol) * 10000 : 0;
                    const bpsClass =
                      bps >= 10
                        ? "text-gold"
                        : bps >= 3
                        ? "text-text-secondary"
                        : "text-text-tertiary";
                    return (
                      <span className={`mono text-[10px] ${bpsClass}`}>
                        {vol > 0 ? `${bps.toFixed(2)} bps` : "—"}
                      </span>
                    );
                  },
                },
              ]}
            />
          </div>
        )}
      </div>

      {/* CARD FOOTER — V4 pedagogical */}
      {top.length > 0 && (
        <div className="px-3.5 py-2.5 border-t border-border-subtle flex items-center justify-between text-[10px] text-text-tertiary">
          {hoverIdx !== null && top[hoverIdx] ? (
            <>
              <span>
                <span className="mono text-text-secondary">#{hoverIdx + 1}</span>{" "}
                <span className="text-text-primary">
                  {formatBuilderDisplayNameOrAddress(top[hoverIdx].builderName, top[hoverIdx].builder)}
                </span>
              </span>
              <span>
                <span className="text-brand">Vol <span className="mono">{compactUsd(top[hoverIdx].totalVolume ?? 0)}</span></span>
                <span className="mx-2 text-text-tertiary/50">·</span>
                <span className="text-gold">Fees <span className="mono">{compactUsd(top[hoverIdx].totalBuilderFees ?? 0)}</span></span>
              </span>
            </>
          ) : (
            <>
              <span>{top.length} builders shown · sorted by volume</span>
              <span className="mono">bps = basis points (fees / volume)</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
