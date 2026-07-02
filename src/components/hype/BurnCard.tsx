"use client";

import { memo } from "react";
import { Flame } from "lucide-react";
import { Card } from "@/components/ui/card";
import { KpiRibbon } from "@/components/common";
import type { KpiCell } from "@/components/common";
import { useHypeOverview } from "@/services/market/hype";
import { compactHype } from "@/lib/formatters/numberFormatting";
import { fmtUsd, fmtPct } from "./format";

/** Curated, source-backed list of the mechanisms that remove HYPE from supply. */
const BURN_MECHANISMS: { title: string; desc: string }[] = [
  {
    title: "Assistance Fund buyback",
    desc: "~99% of net perp + spot fees buy HYPE that lands in a keyless address — permanently out of float. The dominant deflation force.",
  },
  {
    title: "HyperEVM gas",
    desc: "Base gas on HyperEVM is paid in HYPE and burned — every lending, staking and DeFi transaction nets supply down.",
  },
  {
    title: "Spot trading fees",
    desc: "Spot fees not routed to the AF or token deployers are burned at the protocol level.",
  },
  {
    title: "Priority fees",
    desc: "HyperCore priority fees, paid in HYPE from undelegated stake, are burned immediately.",
  },
];

/**
 * BurnCard — HYPE deflation. The on-chain headline is the gap between max and
 * total supply (gas + spot/priority burns); the Assistance Fund's holdings are
 * shown alongside as supply removed from float. Mechanisms are listed below.
 */
export const BurnCard = memo(function BurnCard() {
  const { overview } = useHypeOverview();

  const cells: KpiCell[] = [
    {
      key: "burned",
      label: "Burned",
      value: overview ? `${compactHype(overview.burned)} HYPE` : "—",
      tone: "danger",
      sub: "max − total supply",
    },
    {
      key: "burnedUsd",
      label: "Burned value",
      value: fmtUsd(overview?.burnedUsd),
      sub: overview ? `${fmtPct(((overview.burned / overview.maxSupply) * 100) || 0, 3)} of max` : undefined,
    },
    {
      key: "afFloat",
      label: "AF out of float",
      value: overview ? `${compactHype(overview.composition.assistanceFund)} HYPE` : "—",
      tone: "gold",
      sub: fmtUsd(overview?.af?.hypeValueUsd),
    },
  ];

  return (
    <Card className="overflow-hidden flex flex-col">
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle min-h-[44px]">
        <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
          <Flame size={13} className="text-brand" />
        </span>
        <h3 className="text-[13px] font-semibold text-text-primary">Burn &amp; Deflation</h3>
        <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle">
          permanent
        </span>
      </div>

      <div className="p-3.5 border-b border-border-subtle">
        <KpiRibbon cells={cells} columns="grid-cols-1 sm:grid-cols-3" />
      </div>

      <div className="px-3.5 py-3 flex-1 flex flex-col gap-0.5">
        {BURN_MECHANISMS.map((m) => (
          <div
            key={m.title}
            className="flex items-start gap-2.5 py-2 border-b border-border-subtle/60 last:border-b-0"
          >
            <Flame size={13} className="text-danger shrink-0 mt-0.5" />
            <div className="min-w-0">
              <div className="text-[12px] font-semibold text-text-primary">{m.title}</div>
              <p className="text-[10.5px] leading-snug text-text-tertiary mt-0.5">{m.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-x-3 px-3.5 py-1.5 border-t border-border-subtle text-[10px] text-text-tertiary">
        <span>Burned = on-chain max − total supply</span>
        <span className="opacity-50">·</span>
        <span>AF holdings shown as removed from float</span>
      </div>
    </Card>
  );
});
