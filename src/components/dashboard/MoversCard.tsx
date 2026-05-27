"use client";

import { memo, useMemo } from "react";
import { TrendingUp } from "lucide-react";
import {
  OverviewModule,
  ModuleTable,
  ModuleTableRow,
  ModuleAsset,
} from "@/components/common";
import { useTrendingSpotTokens } from "@/services/market/spot/hooks/useSpotMarket";
import { useTrendingPerpMarkets } from "@/services/market/perp/hooks/usePerpMarket";
import type { SpotToken } from "@/services/market/spot/types";
import type { PerpMarketData } from "@/services/market/perp/types";
import { compactUsd, formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat, type NumberFormatType } from "@/store/number-format.store";

/**
 * MoversCard — top tokens d'un marché (spot OU perp) sur le Dashboard.
 *
 * Aligné sur le pattern dashboard V4 (`OverviewModule` + `ModuleTable` +
 * `ModuleAsset`) — même primitif que `VaultsModule` / `ValidatorsModule` /
 * `BuildersModule`. Quand le token a un `logo` URL on le passe en `Image`
 * dans le wrapper `ModuleAsset`, sinon fallback 2 initiales.
 */

type Market = "spot" | "perp";

const TOP_N = 5;

function fmtPrice(price: number, format: NumberFormatType): string {
  if (price >= 1000) {
    return formatNumber(price, format, {
      maximumFractionDigits: 0,
      currency: "$",
      showCurrency: true,
    });
  }
  if (price >= 1) {
    return formatNumber(price, format, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      currency: "$",
      showCurrency: true,
    });
  }
  return formatNumber(price, format, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
    currency: "$",
    showCurrency: true,
  });
}

function SignedPct({ value, decimals = 2 }: { value: number; decimals?: number }) {
  const positive = value >= 0;
  return (
    <span className={`mono ${positive ? "text-success" : "text-danger"}`}>
      {positive ? "+" : ""}
      {value.toFixed(decimals)}%
    </span>
  );
}

export const MoversCard = memo(function MoversCard({ market }: { market: Market }) {
  const { format } = useNumberFormat();

  const spot = useTrendingSpotTokens(TOP_N, "volume", "desc");
  const perp = useTrendingPerpMarkets(TOP_N, "volume", "desc");

  const { data, isLoading } = market === "spot" ? spot : perp;
  const rows = useMemo(() => (data ?? []).slice(0, TOP_N), [data]);

  const isSpot = market === "spot";

  return (
    <OverviewModule
      title={isSpot ? "Trending Spot" : "Trending Perpetuals"}
      icon={<TrendingUp size={13} className="text-brand" />}
      tag={`${rows.length} markets`}
      viewAllLabel={isSpot ? "All spot" : "All perp"}
      href={`/market/${market}`}
    >
      <ModuleTable
        columns={[
          { header: isSpot ? "Token" : "Asset" },
          { header: "Price" },
          { header: "24h" },
          { header: "Volume" },
        ]}
      >
        {isLoading && rows.length === 0 && (
          <tr>
            <td colSpan={4} className="px-4 py-2.5 text-[12px] text-text-tertiary">
              …
            </td>
          </tr>
        )}
        {rows.map((row, idx) => {
          const r = row as SpotToken | PerpMarketData;
          // Composite key: the upstream perp feed occasionally returns two
          // entries sharing the same `name` (HYPE perp + a namespaced
          // variant); `name + idx` keeps React keys unique either way.
          return (
            <ModuleTableRow
              key={`${market}-${r.name}-${idx}`}
              href={`/market/${market}/${encodeURIComponent(r.name)}`}
              cells={[
                <ModuleAsset
                  key="token"
                  assetName={r.name}
                  kind={isSpot ? "spot" : "auto"}
                  name={r.name}
                />,
                <span key="price" className="mono text-text-primary">
                  {fmtPrice(r.price, format)}
                </span>,
                <SignedPct key="change" value={r.change24h} />,
                <span key="volume" className="mono text-text-secondary">
                  {compactUsd(r.volume)}
                </span>,
              ]}
            />
          );
        })}
      </ModuleTable>
    </OverviewModule>
  );
});
