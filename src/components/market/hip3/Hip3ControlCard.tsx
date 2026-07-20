"use client";

import Link from "next/link";
import { truncateAddress } from "@/lib/formatters/numberFormatting";
import { PerpDex } from "@/services/market/perpDex/types";
import { Hip3Chip, Hip3FactCard } from "./Hip3FactCard";

/** The powers whose consequences land on this market, in the order they matter. */
const POWERS = [
  { key: "haltTrading", label: "Halt" },
  { key: "setOracle", label: "Oracle" },
  { key: "setOpenInterestCaps", label: "OI caps" },
  { key: "setFundingMultipliers", label: "Funding" },
] as const;

/**
 * Who can do what to this market.
 *
 * On a native perp the operator is Hyperliquid; on HIP-3 it is an address that
 * can halt this market and set its oracle. Sourced from Hyperliquid's
 * `perpDexs`, so it survives a HypeDexer outage.
 *
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

  const held = POWERS.filter(
    (power) => (venue.subDeployers.find((sub) => sub.permission === power.key)?.addresses.length ?? 0) > 0
  );

  return (
    <Hip3FactCard
      title="Who controls this market"
      headAside={
        <Link
          href={`/market/perpdex/${venue.name}`}
          className="text-[11px] text-text-tertiary hover:text-text-primary transition-colors"
        >
          {venue.fullName || venue.name} →
        </Link>
      }
      value={held.length}
      qualifier={`of ${POWERS.length} powers delegated`}
      visual={
        <div className="flex flex-wrap items-center gap-1.5">
          {POWERS.map((power) => {
            const active = held.some((h) => h.key === power.key);
            return (
              <Hip3Chip key={power.key} tone={active ? "neutral" : "muted"}>
                {power.label}
              </Hip3Chip>
            );
          })}
        </div>
      }
      leftLabel={
        <>
          oracle{" "}
          <span className="mono text-text-secondary">
            {oracleUpdater ? truncateAddress(oracleUpdater) : "not published"}
          </span>
        </>
      }
      rightLabel={
        <>
          collateral <span className="mono text-text-secondary">{collateral}</span>
        </>
      }
      context={
        <>
          Operated by a third party, not Hyperliquid · {liveCount} live of {totalCount}
        </>
      }
    />
  );
}
