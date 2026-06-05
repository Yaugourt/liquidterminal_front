"use client";

import { useMemo } from "react";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import { effectiveStatus } from "@/lib/hip4/market-formatter";
import { KpiRibbon, type KpiCell } from "@/components/common";
import type {
  Hip4QuestionWithOutcomesRow,
  Hip4SettlementRow,
} from "@/services/indexer/hip4";

interface Hip4GlobalStatsStripProps {
  questions: Hip4QuestionWithOutcomesRow[];
  settlements: Hip4SettlementRow[];
  isLoading: boolean;
  /** Live-market volumes failed to load → Total Volume is understated. */
  volumesPartial?: boolean;
}

/**
 * KPI ribbon — V4 §7.b. Continuous strip of stat cells, no per-cell card,
 * no sparkline (HIP-4 has no per-KPI history series exposed by the indexer).
 */
export function Hip4GlobalStatsStrip({ questions, settlements, isLoading, volumesPartial }: Hip4GlobalStatsStripProps) {
  const kpis = useMemo<KpiCell[]>(() => {
    const placeholder = isLoading ? "…" : "—";
    const liveCount = questions.filter((q) => effectiveStatus(q) === "live").length;
    const pendingCount = questions.filter((q) => effectiveStatus(q) === "expired_unresolved").length;
    const settledCount = questions.filter((q) => effectiveStatus(q) === "settled").length;
    const totalVolume = questions.reduce((s, q) => s + (q.total_volume ?? 0), 0);

    return [
      {
        label: "Live Markets",
        value: isLoading && questions.length === 0 ? placeholder : String(liveCount),
      },
      {
        label: "Pending Resolution",
        value: isLoading && questions.length === 0 ? placeholder : String(pendingCount),
      },
      {
        label: "Total Volume",
        value: isLoading && questions.length === 0 ? placeholder : compactUsd(totalVolume),
        sub: volumesPartial ? "live vol. unavailable" : undefined,
      },
      {
        label: "Settled",
        value: isLoading && settlements.length === 0 ? placeholder : String(settledCount || settlements.length),
      },
    ];
  }, [questions, settlements, isLoading, volumesPartial]);

  return <KpiRibbon cells={kpis} columns="grid-cols-2 sm:grid-cols-4" />;
}
