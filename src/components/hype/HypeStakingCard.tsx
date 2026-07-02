"use client";

import { memo } from "react";
import { Shield } from "lucide-react";
import { OverviewModule, KpiRibbon } from "@/components/common";
import type { KpiCell } from "@/components/common";
import { useHoldersStats, useValidators } from "@/services/explorer/validator";
import { useHypeOverview } from "@/services/market/hype";
import { compactHype, compactCount } from "@/lib/formatters/numberFormatting";
import { fmtUsd, fmtPct } from "./format";

/**
 * HypeStakingCard — HYPE secured in proof-of-stake. Staked HYPE is locked and
 * illiquid, so it reinforces the scarcity picture: total staked, its USD value,
 * the share of circulating supply it represents, the staker count and the
 * active validator set. Links through to the full validator explorer.
 */
export const HypeStakingCard = memo(function HypeStakingCard() {
  const { stats: holders } = useHoldersStats();
  const { stats: validators } = useValidators();
  const { overview } = useHypeOverview();

  const totalStaked = holders?.totalStaked ?? validators.totalHypeStaked ?? null;
  const price = overview?.price ?? null;
  const stakedUsd = totalStaked != null && price != null ? totalStaked * price : null;
  // Compared to total supply, not circulating: locked/foundation tokens can be
  // staked, so staked HYPE routinely exceeds the API's circulating figure.
  const pctStaked =
    totalStaked != null && overview && overview.totalSupply > 0
      ? (totalStaked / overview.totalSupply) * 100
      : null;

  const cells: KpiCell[] = [
    {
      key: "staked",
      label: "HYPE staked",
      value: totalStaked != null ? `${compactHype(totalStaked)} HYPE` : "—",
      sub: "locked in PoS",
    },
    {
      key: "value",
      label: "Staked value",
      value: fmtUsd(stakedUsd),
      tone: "gold",
    },
    {
      key: "pct",
      label: "% staked",
      value: fmtPct(pctStaked),
      sub: "of total supply",
    },
    {
      key: "stakers",
      label: "Stakers",
      value: holders?.totalHolders != null ? compactCount(holders.totalHolders) : "—",
    },
    {
      key: "validators",
      label: "Validators",
      value: validators.active > 0 ? `${validators.active}` : "—",
      sub: validators.total > 0 ? `of ${validators.total}` : undefined,
    },
  ];

  return (
    <OverviewModule
      title="Staking & Security"
      icon={<Shield size={13} className="text-brand" />}
      tag={totalStaked != null ? `${compactHype(totalStaked)} HYPE staked` : undefined}
      viewAllLabel="All validators"
      href="/explorer/validator"
    >
      <div className="p-3.5">
        <KpiRibbon cells={cells} columns="grid-cols-2 sm:grid-cols-3 xl:grid-cols-5" />
      </div>
    </OverviewModule>
  );
});
