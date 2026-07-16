"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { Check, Copy } from "lucide-react";
import { OverviewModule, StackedShareBar, HypeMark } from "@/components/common";
import {
  compactUsd,
  compactHype,
  compactCount,
  formatMetricValue,
} from "@/lib/formatters/numberFormatting";
import { useTokenAuctionById } from "@/services/market/auction/hooks/useAuctions";
import { isBridged } from "@/services/market/spot/bridged";
import type { SpotToken } from "@/services/market/spot/types";
import type { TokenDetails } from "@/services/market/token/types";

const DAY_MS = 86_400_000;

const fmtSupply = (v: number) =>
  formatMetricValue(v, {
    format: "US",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

/** HL deploy times are UTC ISO strings without timezone and with ns precision. */
const parseDeployTime = (s: string): number | null => {
  const normalized = s.replace(/(\.\d{3})\d*/, "$1");
  const ms = Date.parse(normalized.endsWith("Z") ? normalized : `${normalized}Z`);
  return Number.isFinite(ms) ? ms : null;
};

const fmtDate = (ms: number) =>
  new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

function fmtAgo(ms: number, now: number): string {
  const d = Math.floor((now - ms) / DAY_MS);
  if (d >= 365) return `${(d / 365).toFixed(1)}y ago`;
  if (d >= 30) return `${Math.floor(d / 30)}mo ago`;
  if (d >= 1) return `${d}d ago`;
  return "today";
}

function Row({ label, value }: { label: ReactNode; value: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-2">
      <span className="text-text-tertiary">{label}</span>
      <span className="mono text-text-secondary text-right min-w-0">{value}</span>
    </div>
  );
}

function AddressValue({
  address,
  copied,
  onCopy,
}: {
  address: string;
  copied: boolean;
  onCopy: (a: string) => void;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Link
        href={`/explorer/address/${address}`}
        className="mono text-brand hover:text-text-primary transition-colors"
      >
        {`${address.slice(0, 6)}…${address.slice(-4)}`}
      </Link>
      <button
        onClick={() => onCopy(address)}
        className="group p-0.5 rounded transition-colors"
        aria-label="Copy address"
      >
        {copied ? (
          <Check className="h-3 w-3 text-success" />
        ) : (
          <Copy className="h-3 w-3 text-text-tertiary opacity-60 group-hover:opacity-100 transition-opacity" />
        )}
      </button>
    </span>
  );
}

interface TokenDetailsBandProps {
  token: SpotToken;
  details: TokenDetails | null;
  detailsLoading: boolean;
  holdersCount: number;
  holdersLoading: boolean;
}

/**
 * "Anatomy" band for /market/spot/[token] — the HL `tokenDetails` fields that
 * used to hide behind a collapsible panel, surfaced as three V4 modules:
 * supply structure (with float share bar), the HIP-1 deploy record, and the
 * genesis/HIP-2 distribution facts.
 *
 * Market cap stays "—" for Unit-bridged tokens: even HL's circulatingSupply
 * mirrors the full underlying supply there (21M for UBTC), so no honest
 * on-HL cap can be derived client-side.
 */
export function TokenDetailsBand({
  token,
  details,
  detailsLoading,
  holdersCount,
  holdersLoading,
}: TokenDetailsBandProps) {
  const { auctionInfo, isLoading: auctionLoading } = useTokenAuctionById(token.tokenId || null);
  const [copied, setCopied] = useState<string | null>(null);
  const [now] = useState(() => Date.now());

  const handleCopy = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(address);
      setTimeout(() => setCopied(null), 1200);
    } catch {}
  };

  const supply = useMemo(() => {
    if (!details) return null;
    const max = parseFloat(details.maxSupply);
    const total = parseFloat(details.totalSupply);
    const circulating = parseFloat(details.circulatingSupply);
    if (![max, total, circulating].every(Number.isFinite)) return null;
    const denom = max > 0 ? max : total;
    return {
      max,
      total,
      circulating,
      nonCirculating: Math.max(0, total - circulating),
      unminted: Math.max(0, max - total),
      floatPct: denom > 0 ? (circulating / denom) * 100 : 0,
    };
  }, [details]);

  const deployTimeMs = details?.deployTime ? parseDeployTime(details.deployTime) : null;
  const bridged = isBridged(token.name);
  const ph = detailsLoading ? "…" : "—";

  const genesisWallets = details?.genesis?.userBalances?.length ?? 0;
  const genesisCarried = details?.genesis?.existingTokenBalances?.length ?? 0;
  const nonCircAddresses = details?.nonCirculatingUserBalances?.length ?? 0;
  const seededUsdc = details ? parseFloat(details.seededUsdc) : 0;
  const futureEmissions = details ? parseFloat(details.futureEmissions) : 0;

  const barSegments = supply
    ? [
        {
          key: "circulating",
          value: supply.circulating,
          colorClass: "bg-brand",
          label: `circulating ${fmtSupply(supply.circulating)}`,
        },
        {
          key: "non-circulating",
          value: supply.nonCirculating,
          colorClass: "bg-gold",
          label: `non-circulating ${fmtSupply(supply.nonCirculating)}`,
        },
        {
          key: "unminted",
          value: supply.unminted,
          colorClass: "bg-border-strong",
          label: `unminted / burned ${fmtSupply(supply.unminted)}`,
        },
      ].filter((s) => s.value > 0)
    : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
      {/* Supply structure */}
      <OverviewModule title="Supply" tag="HL tokenDetails" tagVariant="plain">
        <div className="px-4 py-3.5 flex flex-col flex-1">
          {barSegments.length > 0 && (
            <div className="space-y-1.5 mb-1.5">
              <StackedShareBar height={6} segments={barSegments} />
              <div className="text-[10.5px] text-text-tertiary">
                <span className="text-brand">circulating</span> ·{" "}
                <span className="text-gold">non-circulating</span> · unminted/burned
              </div>
            </div>
          )}
          <div className="flex-1 flex flex-col justify-end divide-y divide-border-subtle text-[11.5px]">
            <Row label="Max supply" value={supply ? fmtSupply(supply.max) : ph} />
            <Row label="Total supply" value={supply ? fmtSupply(supply.total) : ph} />
            <Row
              label="Circulating"
              value={
                supply ? (
                  <>
                    {fmtSupply(supply.circulating)}{" "}
                    <span className="text-text-tertiary">
                      · {supply.floatPct.toFixed(1)}%
                    </span>
                  </>
                ) : (
                  ph
                )
              }
            />
            <Row
              label="Market cap"
              value={
                bridged ? (
                  <>
                    — <span className="text-text-tertiary">· bridged supply</span>
                  </>
                ) : token.marketCap > 0 ? (
                  compactUsd(token.marketCap)
                ) : (
                  "—"
                )
              }
            />
          </div>
        </div>
      </OverviewModule>

      {/* HIP-1 deploy record */}
      <OverviewModule title="Deploy" tag="HIP-1 record" tagVariant="plain">
        <div className="px-4 py-3.5 flex flex-col flex-1">
          <div className="flex-1 flex flex-col justify-end divide-y divide-border-subtle text-[11.5px]">
            <Row
              label="Deployer"
              value={
                details?.deployer ? (
                  <AddressValue
                    address={details.deployer}
                    copied={copied === details.deployer}
                    onCopy={handleCopy}
                  />
                ) : detailsLoading ? (
                  "…"
                ) : (
                  "genesis"
                )
              }
            />
            <Row
              label="Deploy date"
              value={
                deployTimeMs ? (
                  <>
                    {fmtDate(deployTimeMs)}{" "}
                    <span className="text-text-tertiary">
                      · {fmtAgo(deployTimeMs, now)}
                    </span>
                  </>
                ) : (
                  ph
                )
              }
            />
            <Row
              label="Winning bid"
              value={
                auctionLoading ? (
                  "…"
                ) : auctionInfo && parseFloat(auctionInfo.deployGas) > 0 ? (
                  <span className="font-medium text-gold">
                    {auctionInfo.currency === "HYPE" ? (
                      <span className="inline-flex items-center gap-1">
                        {compactHype(parseFloat(auctionInfo.deployGas))}
                        <HypeMark size="xs" />
                      </span>
                    ) : (
                      compactUsd(parseFloat(auctionInfo.deployGas))
                    )}
                  </span>
                ) : (
                  <>
                    — <span className="text-text-tertiary">· free deploy</span>
                  </>
                )
              }
            />
            <Row
              label="Token ID"
              value={
                <AddressValue
                  address={token.tokenId}
                  copied={copied === token.tokenId}
                  onCopy={handleCopy}
                />
              }
            />
          </div>
        </div>
      </OverviewModule>

      {/* Genesis & HIP-2 distribution */}
      <OverviewModule title="Distribution" tag="genesis · HIP-2" tagVariant="plain">
        <div className="px-4 py-3.5 flex flex-col flex-1">
          <div className="flex-1 flex flex-col justify-end divide-y divide-border-subtle text-[11.5px]">
            <Row
              label="Holders"
              value={
                holdersLoading ? "…" : holdersCount > 0 ? compactCount(holdersCount) : "—"
              }
            />
            <Row
              label="Genesis allocations"
              value={
                details ? (
                  <>
                    {compactCount(genesisWallets)}
                    {genesisCarried > 0 && (
                      <span className="text-text-tertiary">
                        {" "}
                        · +{genesisCarried} token-linked
                      </span>
                    )}
                  </>
                ) : (
                  ph
                )
              }
            />
            <Row
              label="Non-circulating addresses"
              value={details ? compactCount(nonCircAddresses) : ph}
            />
            <Row
              label="Seeded USDC · HIP-2"
              value={details ? (seededUsdc > 0 ? compactUsd(seededUsdc) : "$0") : ph}
            />
            <Row
              label="Future emissions"
              value={details ? (futureEmissions > 0 ? fmtSupply(futureEmissions) : "0") : ph}
            />
          </div>
        </div>
      </OverviewModule>
    </div>
  );
}
