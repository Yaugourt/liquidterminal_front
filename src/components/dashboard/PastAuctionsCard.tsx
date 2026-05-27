"use client";

import { memo, useMemo } from "react";
import { Gavel } from "lucide-react";
import {
  OverviewModule,
  ModuleTable,
  ModuleTableRow,
  ModuleAsset,
} from "@/components/common";
import { useLatestAuctions } from "@/services/market/auction";
import { compactUsd } from "@/lib/formatters/numberFormatting";

/**
 * PastAuctionsCard — top 5 USDC spot listing auctions. ModuleAsset shows the
 * ticker bought (the asset minted by this auction) as the primary identifier
 * — same convention as the spot auctions page.
 */

const ROWS = 5;

function timeAgo(ms: number): string {
  const diff = Math.max(0, Date.now() - ms);
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export const PastAuctionsCard = memo(function PastAuctionsCard() {
  const { auctions, isLoading } = useLatestAuctions(20, "USDC");
  const top = useMemo(() => auctions.slice(0, ROWS), [auctions]);

  return (
    <OverviewModule
      title="Past Auctions"
      icon={<Gavel size={13} className="text-brand" />}
      tag="USDC"
      viewAllLabel="View all"
      href="/market/spot/auction"
    >
      <ModuleTable
        columns={[
          { header: "Ticker" },
          { header: "Amount" },
          { header: "Age" },
        ]}
      >
        {isLoading && top.length === 0 && (
          <tr>
            <td colSpan={3} className="px-4 py-2.5 text-[12px] text-text-tertiary">
              …
            </td>
          </tr>
        )}
        {top.map((a) => (
          <ModuleTableRow
            key={`${a.tokenId}-${a.index}`}
            cells={[
              <ModuleAsset
                key="tok"
                assetName={`${a.name}_spot`}
                name={a.name}
              />,
              <span key="amt" className="mono text-gold font-semibold">
                {compactUsd(Math.abs(parseFloat(a.deployGasAbs ?? a.deployGas)))}
              </span>,
              <span key="age" className="mono text-text-tertiary">
                {timeAgo(a.time * 1000)}
              </span>,
            ]}
          />
        ))}
      </ModuleTable>
    </OverviewModule>
  );
});
