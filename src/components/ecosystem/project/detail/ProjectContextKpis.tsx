"use client";

import { useMemo } from "react";
import { KpiRibbon, KpiCell } from "@/components/common";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import { NormalizedMetrics, ProjectPosition } from "@/services/ecosystem/project/types";

/** "+4.2%" / "-1.2%" with the DS success/danger tone, or null when unknown. */
function trendSpan(pct: number | null): React.ReactNode {
  if (pct == null) return null;
  const sign = pct >= 0 ? "+" : "";
  return (
    <span className={pct >= 0 ? "text-success" : "text-danger"}>
      {sign}
      {pct.toFixed(1)}% 7d
    </span>
  );
}

interface ProjectContextKpisProps {
  position: ProjectPosition | null;
  metrics: NormalizedMetrics | undefined;
}

/**
 * Main fundamentals ribbon, Hyperliquid-scoped when the project has a position
 * (TVL on HL + share + rank subs); falls back to the global DefiLlama figures
 * (clearly labeled "all chains") for linked projects without an HL deployment.
 */
export function ProjectContextKpis({ position, metrics }: ProjectContextKpisProps) {
  const cells = useMemo<KpiCell[]>(() => {
    const out: KpiCell[] = [];

    if (position) {
      out.push({
        key: "hltvl",
        label: "TVL on Hyperliquid",
        value: compactUsd(position.hlTvl),
        sub: (
          <>
            {position.shareOfChainPct != null && `${position.shareOfChainPct.toFixed(1)}% of HL DeFi`}
            {position.shareOfChainPct != null && position.change7d != null && " · "}
            {trendSpan(position.change7d)}
          </>
        ),
      });
      if (position.hlBorrowed != null) {
        out.push({
          key: "borrowed",
          label: "Borrowed",
          value: compactUsd(position.hlBorrowed),
          sub: "on Hyperliquid L1",
        });
      }
      const fees = position.fees24h ?? metrics?.fees24h?.value;
      if (fees != null) {
        out.push({
          key: "fees",
          label: "Fees 24h",
          value: compactUsd(fees),
          tone: "gold",
          sub:
            position.feesRank24h != null && position.feesRankCount != null
              ? `#${position.feesRank24h} of ${position.feesRankCount} on HL`
              : undefined,
        });
      }
      if (position.volume24h != null) {
        out.push({
          key: "vol",
          label: "Volume 24h",
          value: compactUsd(position.volume24h),
          sub:
            position.volumeRank24h != null && position.volumeRankCount != null
              ? `#${position.volumeRank24h} of ${position.volumeRankCount} DEXs`
              : undefined,
        });
      } else if (metrics?.revenue24h) {
        out.push({
          key: "rev",
          label: "Revenue 24h",
          value: compactUsd(metrics.revenue24h.value),
        });
      }
      return out;
    }

    // Linked but not deployed on Hyperliquid per DefiLlama: global view, labeled.
    if (metrics?.tvl) {
      out.push({ key: "gtvl", label: "TVL", value: compactUsd(metrics.tvl.value), sub: "all chains" });
    }
    if (metrics?.volume24h) {
      out.push({ key: "gvol", label: "Volume 24h", value: compactUsd(metrics.volume24h.value), sub: "all chains" });
    }
    if (metrics?.fees24h) {
      out.push({ key: "gfees", label: "Fees 24h", value: compactUsd(metrics.fees24h.value), tone: "gold", sub: "all chains" });
    }
    if (metrics?.revenue24h) {
      out.push({ key: "grev", label: "Revenue 24h", value: compactUsd(metrics.revenue24h.value), sub: "all chains" });
    }
    return out;
  }, [position, metrics]);

  if (cells.length === 0) return null;
  return <KpiRibbon cells={cells} />;
}
