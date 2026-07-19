"use client";

import {
  OverviewModule,
  ModuleTable,
  ModuleTableRow,
  ModuleAsset,
} from "@/components/common";
import { compactUsd, formatPrice } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import { hip3AssetHref } from "@/lib/hip3/coin";
import { Hip3AssetCtx } from "@/services/market/hip3";

/**
 * Other live markets on the same venue.
 *
 * Costs no extra request: `useHip3AssetView` already loads every context of the
 * DEX to resolve this asset, so the siblings come from data in hand. Without
 * this module the page is a dead end — a venue like xyz carries 87 live markets
 * and switching between them would mean a round trip through the venue page.
 */
export function Hip3SiblingMarkets({
  siblings,
  dexId,
  venueName,
}: {
  siblings: Hip3AssetCtx[];
  dexId: string;
  venueName: string;
}) {
  const { format } = useNumberFormat();
  if (!siblings.length) return null;

  return (
    <OverviewModule
      title={`Other markets on ${venueName}`}
      tagVariant="plain"
      viewAllLabel="All markets"
      href={`/market/perpdex/${dexId}`}
    >
      <ModuleTable
        columns={[
          { header: "Market", align: "left" },
          { header: "Mark", align: "right", width: 90 },
          { header: "24h", align: "right", width: 72 },
          { header: "24h vol", align: "right", width: 86 },
        ]}
      >
        {siblings.map((sibling) => (
          <ModuleTableRow
            key={sibling.coin}
            href={hip3AssetHref(sibling.coin)}
            cells={[
              <ModuleAsset
                key="asset"
                assetName={sibling.coin}
                name={sibling.ticker}
                tone="neutral"
              />,
              <span key="mark" className="mono text-text-secondary">
                {formatPrice(sibling.markPx, format)}
              </span>,
              <span
                key="chg"
                className={`mono ${
                  sibling.priceChange24h === null
                    ? "text-text-tertiary"
                    : sibling.priceChange24h >= 0
                      ? "text-success"
                      : "text-danger"
                }`}
              >
                {sibling.priceChange24h === null
                  ? "N/A"
                  : `${sibling.priceChange24h >= 0 ? "+" : ""}${sibling.priceChange24h.toFixed(2)}%`}
              </span>,
              <span key="vol" className="mono text-text-secondary">
                {compactUsd(sibling.dayNtlVlm)}
              </span>,
            ]}
          />
        ))}
      </ModuleTable>
    </OverviewModule>
  );
}
