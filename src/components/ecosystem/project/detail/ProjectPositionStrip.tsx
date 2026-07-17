"use client";

import { useMemo } from "react";
import { KpiRibbon, KpiCell } from "@/components/common";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import { ProjectPosition } from "@/services/ecosystem/project/types";

interface ProjectPositionStripProps {
  position: ProjectPosition;
  chainTvl: number | null;
}

/**
 * "Position on Hyperliquid" strip — the signature module of the context-first
 * page: category rank, share of category, share of chain DeFi, 7d trend.
 * Cells only render on real data (no placeholders).
 */
export function ProjectPositionStrip({ position, chainTvl }: ProjectPositionStripProps) {
  const cells = useMemo<KpiCell[]>(() => {
    const out: KpiCell[] = [];
    if (position.categoryRank != null && position.categorySize != null && position.category) {
      out.push({
        key: "rank",
        label: "Category rank",
        value: `#${position.categoryRank}`,
        tone: position.categoryRank === 1 ? "gold" : "default",
        sub: `of ${position.categorySize} ${position.category} protocols`,
      });
    }
    if (position.shareOfCategoryPct != null && position.category) {
      out.push({
        key: "catshare",
        label: `Share of ${position.category}`,
        value: `${position.shareOfCategoryPct.toFixed(1)}%`,
        sub: position.categoryTvl != null ? `${compactUsd(position.categoryTvl)} category TVL` : undefined,
      });
    }
    if (position.shareOfChainPct != null) {
      out.push({
        key: "chainshare",
        label: "Share of HL DeFi",
        value: `${position.shareOfChainPct.toFixed(1)}%`,
        sub: chainTvl != null ? `of ${compactUsd(chainTvl)} chain TVL` : undefined,
      });
    }
    if (position.change7d != null) {
      out.push({
        key: "trend",
        label: "Trend 7d",
        value: `${position.change7d >= 0 ? "+" : ""}${position.change7d.toFixed(1)}%`,
        tone: position.change7d >= 0 ? "success" : "danger",
        sub: "TVL on HL",
      });
    }
    return out;
  }, [position, chainTvl]);

  if (cells.length === 0) return null;
  return (
    <KpiRibbon
      header={{ label: "Position on Hyperliquid", helper: "via DefiLlama" }}
      cells={cells}
    />
  );
}
