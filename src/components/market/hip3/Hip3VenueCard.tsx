"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { AddressDisplay } from "@/components/ui/address-display";
import { PerpDex } from "@/services/market/perpDex/types";

/** Permissions worth surfacing first — the ones with per-market consequences. */
const HEADLINE_PERMISSIONS = [
  { key: "haltTrading", label: "Halt trading" },
  { key: "setOracle", label: "Set oracle" },
  { key: "setOpenInterestCaps", label: "Set OI caps" },
  { key: "setFundingMultipliers", label: "Set funding multipliers" },
  { key: "registerAsset", label: "Register asset" },
];

/**
 * Who operates this market, and who can do what to it.
 *
 * On a native perp the operator is Hyperliquid; on HIP-3 it is an address that
 * can halt this market and set its oracle. Both facts are sourced from
 * Hyperliquid's `perpDexs`, so this card survives a HypeDexer outage.
 *
 * `active_since` and `total_staked_hype` from the HypeDexer DEX endpoint are
 * deliberately absent: the first returns the indexer's own ingestion timestamp
 * (identical across every venue) and the second is 0 everywhere.
 */
export function Hip3VenueCard({
  venue,
  oracleUpdater,
  liveCount,
  totalCount,
}: {
  venue: PerpDex | null;
  oracleUpdater: string | null;
  liveCount: number;
  totalCount: number;
}) {
  if (!venue) return null;

  const permissions = HEADLINE_PERMISSIONS.map((permission) => {
    const match = venue.subDeployers.find((sub) => sub.permission === permission.key);
    return { ...permission, count: match?.addresses.length ?? 0 };
  }).filter((permission) => permission.count > 0);

  const extraCount = venue.subDeployers.length - permissions.length;

  return (
    <Card className="flex flex-col">
      <div className="flex items-baseline gap-2 px-4 py-3 border-b border-border-subtle">
        <h3 className="text-[13px] font-medium text-text-primary truncate">
          Venue · {venue.fullName || venue.name}
        </h3>
        <Link
          href={`/market/perpdex/${venue.name}`}
          className="ml-auto shrink-0 text-[11px] text-text-tertiary hover:text-text-primary transition-colors"
        >
          {liveCount} live / {totalCount}
        </Link>
      </div>

      <div className="px-4 py-3 space-y-2 text-[11.5px] border-b border-border-subtle">
        <VenueRow label="Deployer" address={venue.deployer} />
        <VenueRow label="Fee recipient" address={venue.feeRecipient} />
        <VenueRow label="Oracle updater" address={oracleUpdater} />
        <div className="flex items-center justify-between gap-3">
          <span className="text-text-tertiary">Fee scale</span>
          <span className="mono text-text-secondary">{venue.deployerFeeScale.toFixed(2)}</span>
        </div>
      </div>

      {permissions.length > 0 && (
        <div className="px-4 py-3">
          <div className="text-[10px] uppercase tracking-[0.08em] text-text-tertiary mb-2">
            Who can do what
          </div>
          <div className="space-y-1.5 text-[11.5px]">
            {permissions.map((permission) => (
              <div key={permission.key} className="flex items-center justify-between gap-3">
                <span className="text-text-secondary">{permission.label}</span>
                <span className="mono text-text-tertiary">
                  {permission.count} addr
                </span>
              </div>
            ))}
            {extraCount > 0 && (
              <div className="text-[11px] text-text-tertiary pt-1">
                +{extraCount} more permissions
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

function VenueRow({ label, address }: { label: string; address: string | null }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-text-tertiary shrink-0">{label}</span>
      {address ? (
        <AddressDisplay address={address} />
      ) : (
        <span className="text-text-tertiary">not published</span>
      )}
    </div>
  );
}
