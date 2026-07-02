"use client";

import { useMemo, useState } from "react";
import { useValidators } from "@/services/explorer/validator";
import { useNumberFormat } from "@/store/number-format.store";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { KpiRibbon, type KpiCell } from "@/components/common";
import { PillTabs } from "@/components/ui/pill-tabs";

// Mirrors the backend FOUNDATION_VALIDATOR_NAME_PREFIXES rule (single-sourced
// server-side). This is a client-only visualisation derivation over the served
// validator list (name + stake); the Foundation-sensitive vote data is stamped
// server-side, not here.
const isFoundation = (name: string): boolean => name.startsWith("Hyper Foundation");

type Mode = "all" | "community";

/**
 * Stake-concentration KPI strip with an ex-Foundation toggle (GATE 3 twin view).
 * Top-N cumulative shares + HHI are computed front-side from the served stakes.
 */
export function ValidatorConcentrationStrip() {
  const { validators } = useValidators();
  const { format } = useNumberFormat();
  const [mode, setMode] = useState<Mode>("all");

  const m = useMemo(() => {
    const grand = validators.reduce((s, v) => s + v.stake, 0);
    const foundationStake = validators.filter((v) => isFoundation(v.name)).reduce((s, v) => s + v.stake, 0);

    const list = mode === "all" ? validators : validators.filter((v) => !isFoundation(v.name));
    const total = list.reduce((s, v) => s + v.stake, 0);
    const sorted = [...list].sort((a, b) => b.stake - a.stake);
    const cum = (n: number) => (total > 0 ? (sorted.slice(0, n).reduce((s, v) => s + v.stake, 0) / total) * 100 : 0);
    const hhi = total > 0 ? sorted.reduce((s, v) => s + Math.pow((v.stake / total) * 100, 2), 0) : 0;

    return {
      total,
      count: list.length,
      top5: cum(5),
      top10: cum(10),
      hhi: Math.round(hhi),
      foundationPct: grand > 0 ? (foundationStake / grand) * 100 : 0,
    };
  }, [validators, mode]);

  const cells: KpiCell[] =
    mode === "all"
      ? [
          { label: "Foundation Share", value: `${m.foundationPct.toFixed(1)}%`, tone: "gold", sub: "of total stake" },
          { label: "Top-5", value: `${m.top5.toFixed(1)}%`, sub: "cumulative" },
          { label: "Top-10", value: `${m.top10.toFixed(1)}%`, sub: "cumulative" },
          { label: "HHI", value: `${m.hhi}`, sub: "<1500 = unconcentrated" },
        ]
      : [
          { label: "Community Stake", value: formatNumber(m.total, format, { maximumFractionDigits: 0 }), sub: `${m.count} validators` },
          { label: "Top-5", value: `${m.top5.toFixed(1)}%`, sub: "of community" },
          { label: "Top-10", value: `${m.top10.toFixed(1)}%`, sub: "of community" },
          { label: "HHI", value: `${m.hhi}`, sub: "ex-Foundation" },
        ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] uppercase tracking-[0.08em] text-text-tertiary font-medium">
          Stake concentration
        </span>
        <PillTabs
          variant="pill"
          tabs={[
            { value: "all", label: "Network" },
            { value: "community", label: "Ex-Foundation" },
          ]}
          activeTab={mode}
          onTabChange={(v) => setMode(v as Mode)}
        />
      </div>
      <KpiRibbon cells={cells} variant="plain" />
    </div>
  );
}
