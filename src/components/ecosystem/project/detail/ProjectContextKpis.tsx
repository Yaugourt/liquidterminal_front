"use client";

import { useMemo } from "react";
import { KpiRibbon, KpiCell } from "@/components/common";
import { compactUsd, formatMetricValue } from "@/lib/formatters/numberFormatting";
import { NormalizedMetrics, ProjectPosition } from "@/services/ecosystem/project/types";

function formatPriceValue(value: number): string {
  return formatMetricValue(value, {
    prefix: "$",
    format: "US",
    minimumFractionDigits: 2,
    maximumFractionDigits: value < 1 ? 5 : 2,
  });
}

interface ProjectContextKpisProps {
  position: ProjectPosition | null;
  metrics: NormalizedMetrics | undefined;
  /** Token symbol (e.g. "HPL") — the price lives here as a cell, never as an orphan card. */
  tokenSymbol: string | null;
}

/**
 * The single fundamentals ribbon of the detail page (verdict design):
 * HL-scoped when the project has a position, with the 7d trend as its own
 * cell and the token price integrated as the last cell. Linked projects
 * without an HL deployment fall back to global figures, clearly labeled.
 */
export function ProjectContextKpis({ position, metrics, tokenSymbol }: ProjectContextKpisProps) {
  const cells = useMemo<KpiCell[]>(() => {
    const out: KpiCell[] = [];

    const priceCell = (): KpiCell | null =>
      metrics?.price
        ? {
            key: "price",
            label: `${tokenSymbol ?? "Token"} price`,
            value: formatPriceValue(metrics.price.value),
            sub: "DefiLlama feed",
          }
        : null;

    if (position) {
      out.push({
        key: "hltvl",
        label: "TVL on Hyperliquid",
        value: compactUsd(position.hlTvl),
        sub:
          position.shareOfChainPct != null
            ? `${position.shareOfChainPct.toFixed(1)}% of HL DeFi`
            : undefined,
      });
      if (position.change7d != null) {
        out.push({
          key: "tvl7d",
          label: "TVL 7d",
          value: `${position.change7d >= 0 ? "+" : ""}${position.change7d.toFixed(1)}%`,
          tone: position.change7d >= 0 ? "success" : "danger",
          sub: "week over week",
        });
      }
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
          sub: "to protocol",
        });
      }
      const price = priceCell();
      if (price) out.push(price);
      return out.slice(0, 6);
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
    const price = priceCell();
    if (price) out.push(price);
    return out;
  }, [position, metrics, tokenSymbol]);

  if (cells.length === 0) return null;
  return <KpiRibbon cells={cells} />;
}
