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
    // Degrade to a dash (not zeros) when the questions source came back empty:
    // "0 live / $0" next to populated lists below would contradict the page.
    const hasQuestions = questions.length > 0;
    const liveCount = questions.filter((q) => effectiveStatus(q) === "live").length;
    const pendingCount = questions.filter((q) => effectiveStatus(q) === "expired_unresolved").length;
    const settledCount = questions.filter((q) => effectiveStatus(q) === "settled").length;
    const totalVolume = questions.reduce((s, q) => s + (q.total_volume ?? 0), 0);

    return [
      {
        label: "Live Markets",
        value: hasQuestions ? String(liveCount) : placeholder,
      },
      {
        label: "Pending Resolution",
        value: hasQuestions ? String(pendingCount) : placeholder,
      },
      {
        label: "Total Volume",
        value: hasQuestions ? compactUsd(totalVolume) : placeholder,
        sub: volumesPartial ? "live vol. unavailable" : undefined,
      },
      {
        // Questions-derived count first (same universe as the other cells);
        // the settlements feed fills in when the questions source lacks
        // settled rows (frequent when the indexer degrades).
        label: "Settled",
        value:
          !hasQuestions && settlements.length === 0
            ? placeholder
            : String(settledCount || settlements.length),
      },
    ];
  }, [questions, settlements, isLoading, volumesPartial]);

  return <KpiRibbon cells={kpis} columns="grid-cols-2 sm:grid-cols-4" />;
}
