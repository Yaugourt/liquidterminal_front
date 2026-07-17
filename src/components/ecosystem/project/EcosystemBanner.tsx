"use client";

import { useMemo } from "react";
import { KpiRibbon, KpiCell } from "@/components/common";
import { compactUsd, compactCount } from "@/lib/formatters/numberFormatting";
import { DefiLlamaChainStats } from "@/services/ecosystem/project/types";

interface EcosystemBannerProps {
  stats: DefiLlamaChainStats | undefined;
  /** Header helper, e.g. "the chain this project builds on". */
  helper?: string;
}

/**
 * Hyperliquid chain banner — lives independently of any single project, so it
 * serves the projects list and the 135 unlinked project pages alike. Cells
 * only render on real data; the whole banner hides while nothing is known.
 */
export function EcosystemBanner({ stats, helper }: EcosystemBannerProps) {
  const cells = useMemo<KpiCell[]>(() => {
    if (!stats) return [];
    const out: KpiCell[] = [];
    if (stats.tvl != null) {
      out.push({ key: "tvl", label: "TVL Hyperliquid", value: compactUsd(stats.tvl), sub: "Hyperliquid L1" });
    }
    if (stats.fees24h != null) {
      out.push({ key: "fees", label: "Fees 24h", value: compactUsd(stats.fees24h), tone: "gold", sub: "all protocols on HL" });
    }
    if (stats.volumeDex24h != null) {
      out.push({ key: "vol", label: "DEX volume 24h", value: compactUsd(stats.volumeDex24h), sub: "on HL" });
    }
    if (stats.protocolsTracked > 0) {
      out.push({ key: "protos", label: "Protocols tracked", value: compactCount(stats.protocolsTracked), sub: "via DefiLlama" });
    }
    return out;
  }, [stats]);

  if (cells.length === 0) return null;
  return (
    <KpiRibbon
      header={{ label: "Hyperliquid ecosystem", helper: helper ?? "via DefiLlama" }}
      cells={cells}
    />
  );
}
