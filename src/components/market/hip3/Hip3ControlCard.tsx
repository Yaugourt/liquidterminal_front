"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { AddressDisplay } from "@/components/ui/address-display";
import { PerpDex } from "@/services/market/perpDex/types";

/**
 * Who can do what to this market.
 *
 * The condensed form of the old venue card, promoted above the fold. On a
 * native perp the operator is Hyperliquid; on HIP-3 it is an address that can
 * halt this market and set its oracle, which is a fact worth reading before
 * taking a position rather than after scrolling past the trade history.
 *
 * Sourced from Hyperliquid's `perpDexs`, so it survives a HypeDexer outage.
 * `active_since` and `total_staked_hype` from the HypeDexer DEX endpoint stay
 * out: the first is the indexer's own ingestion timestamp, the second is 0
 * everywhere.
 */
export function Hip3ControlCard({
  venue,
  oracleUpdater,
  collateral,
  liveCount,
  totalCount,
}: {
  venue: PerpDex | null;
  oracleUpdater: string | null;
  collateral: string;
  liveCount: number;
  totalCount: number;
}) {
  if (!venue) return null;

  const permissionCount = (key: string) =>
    venue.subDeployers.find((sub) => sub.permission === key)?.addresses.length ?? 0;

  const haltCount = permissionCount("haltTrading");
  const capCount = permissionCount("setOpenInterestCaps");

  return (
    <Card className="flex flex-col">
      <div className="flex items-baseline gap-2 px-4 py-2.5 border-b border-border-subtle">
        <h3 className="text-[13px] font-medium text-text-primary truncate">
          Who controls this market
        </h3>
        <Link
          href={`/market/perpdex/${venue.name}`}
          className="ml-auto shrink-0 text-[11px] text-text-tertiary hover:text-text-primary transition-colors"
        >
          {venue.fullName || venue.name} →
        </Link>
      </div>

      <div className="px-4 py-3 space-y-2 text-[11.5px]">
        <Row
          label="Can halt trading"
          value={haltCount > 0 ? `${haltCount} addr` : "not delegated"}
        />
        <div className="flex items-center justify-between gap-3">
          <span className="text-text-tertiary shrink-0">Sets the oracle</span>
          {oracleUpdater ? (
            <AddressDisplay address={oracleUpdater} />
          ) : (
            <span className="text-text-tertiary">not published</span>
          )}
        </div>
        <Row label="Sets OI caps" value={capCount > 0 ? `${capCount} addr` : "not delegated"} />
        <Row label="Collateral" value={collateral} />
      </div>

      <div className="px-4 py-2 border-t border-border-subtle text-[11px] text-text-tertiary">
        Operated by a third party, not Hyperliquid · {liveCount} live of {totalCount} markets
      </div>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-text-tertiary shrink-0">{label}</span>
      <span className="mono text-text-secondary truncate">{value}</span>
    </div>
  );
}
