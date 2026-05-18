"use client";

import { memo } from "react";
import { Infinity as InfinityIcon } from "lucide-react";
import { OverviewModule, ModuleRow, ModuleSubhead } from "../OverviewModule";
import { TokenIcon } from "@/components/common";
import { usePerpGlobalStats } from "@/services/market/perp/hooks/usePerpGlobalStats";
import { useTrendingPerpMarkets } from "@/services/market/perp/hooks/usePerpMarket";
import { compactUsd } from "@/lib/formatters/numberFormatting";

/** PerpModule — résumé de /market/perp sur le Dashboard. */
export const PerpModule = memo(function PerpModule() {
  const { stats, isLoading } = usePerpGlobalStats();
  const { data: top } = useTrendingPerpMarkets(3, "volume", "desc");

  return (
    <OverviewModule
      title="Perpetuals"
      icon={InfinityIcon}
      href="/market/perp"
      isLoading={isLoading}
      stats={[
        { label: "24h Volume", value: compactUsd(stats?.totalVolume24h) },
        { label: "Open Interest", value: compactUsd(stats?.totalOpenInterest) },
        { label: "HLP TVL", value: compactUsd(stats?.hlpTvl) },
      ]}
    >
      <ModuleSubhead>Top by volume</ModuleSubhead>
      {(top ?? []).slice(0, 3).map((t) => {
        const positive = t.change24h >= 0;
        const fundingPositive = t.funding >= 0;
        return (
          <ModuleRow
            key={t.name}
            href={`/market/perp/${encodeURIComponent(t.name)}`}
            left={
              <>
                <TokenIcon src={t.logo} name={t.name} size="sm" />
                <span className="font-medium text-text-primary truncate">{t.name}</span>
              </>
            }
            right={
              <>
                <span
                  className={`mono text-[12px] ${
                    fundingPositive ? "text-success" : "text-danger"
                  }`}
                >
                  {fundingPositive ? "+" : ""}
                  {(t.funding * 100).toFixed(4)}%
                </span>
                <span
                  className={`mono text-[12px] font-semibold w-14 text-right ${
                    positive ? "text-success" : "text-danger"
                  }`}
                >
                  {positive ? "+" : ""}
                  {t.change24h.toFixed(2)}%
                </span>
              </>
            }
          />
        );
      })}
    </OverviewModule>
  );
});
