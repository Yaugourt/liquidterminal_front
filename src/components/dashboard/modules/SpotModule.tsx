"use client";

import { memo } from "react";
import { CandlestickChart } from "lucide-react";
import { OverviewModule, ModuleRow, ModuleSubhead } from "../OverviewModule";
import { TokenIcon } from "@/components/common";
import { useSpotGlobalStats } from "@/services/market/spot/hooks/useSpotGlobalStats";
import { useTrendingSpotTokens } from "@/services/market/spot/hooks/useSpotMarket";
import { compactUsd, formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";

/** SpotModule — résumé de /market/spot sur le Dashboard. */
export const SpotModule = memo(function SpotModule() {
  const { stats, isLoading } = useSpotGlobalStats();
  const { data: top } = useTrendingSpotTokens(3, "volume", "desc");
  const { format } = useNumberFormat();

  return (
    <OverviewModule
      title="Spot Market"
      icon={CandlestickChart}
      href="/market/spot"
      isLoading={isLoading}
      stats={[
        { label: "24h Volume", value: compactUsd(stats?.totalVolume24h) },
        { label: "Market Cap", value: compactUsd(stats?.totalMarketCap) },
        {
          label: "Tokens",
          value:
            stats?.totalPairs != null
              ? formatNumber(stats.totalPairs, format, { maximumFractionDigits: 0 })
              : "—",
        },
      ]}
    >
      <ModuleSubhead>Top by volume</ModuleSubhead>
      {(top ?? []).slice(0, 3).map((t) => {
        const positive = t.change24h >= 0;
        return (
          <ModuleRow
            key={t.name}
            href={`/market/spot/${encodeURIComponent(t.name)}`}
            left={
              <>
                <TokenIcon src={t.logo} name={t.name} size="sm" />
                <span className="font-medium text-text-primary truncate">{t.name}</span>
              </>
            }
            right={
              <>
                <span className="mono text-[12px] text-text-secondary">
                  {compactUsd(t.volume)}
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
