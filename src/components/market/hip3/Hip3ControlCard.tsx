"use client";

import Link from "next/link";
import { truncateAddress } from "@/lib/formatters/numberFormatting";
import { PerpDex } from "@/services/market/perpDex/types";
import { Hip3FactRow } from "./Hip3FactCard";

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
 * The powers are named in the clause rather than drawn as chips: a list of
 * permissions is not a measurement, so this row draws no meter and the clause
 * takes that column. The old card printed the count at 26px, four chips, and a
 * footer sentence — one fact stated three times.
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
    (power) =>
      (venue.subDeployers.find((sub) => sub.permission === power.key)?.addresses.length ?? 0) > 0
  );
  const venueName = venue.fullName || venue.name;

  return (
    <Hip3FactRow
      subject="Who controls it"
      value={held.length}
      unit={`of ${POWERS.length}`}
      clause={
        <>
          {held.length > 0 ? (
            <>
              <span className="text-text-secondary">
                {held.map((power) => power.label).join(" · ")}
              </span>{" "}
              delegated to {venueName}, not Hyperliquid
            </>
          ) : (
            <>no powers delegated — this market is operated by {venueName}, not Hyperliquid</>
          )}
          <span className="text-text-tertiary/70">
            {" · "}oracle{" "}
            <span className="mono">
              {oracleUpdater ? truncateAddress(oracleUpdater) : "not published"}
            </span>
            {" · "}collateral <span className="mono">{collateral}</span>
          </span>
        </>
      }
      aside={
        <Link
          href={`/market/perpdex/${venue.name}`}
          className="inline-flex items-center h-[18px] text-[11px] leading-none text-text-tertiary hover:text-text-primary transition-colors whitespace-nowrap"
        >
          {venueName} · {liveCount} of {totalCount} live →
        </Link>
      }
    />
  );
}
