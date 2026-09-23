"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, Fingerprint } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  DominanceBar,
  ModuleAsset,
  ModuleSubhead,
  ModuleTable,
  ModuleTableRow,
  Skeleton,
  SourceBadge,
  type DominanceSegment,
} from "@/components/common";
import {
  compactCount,
  compactUsd,
  formatPrice,
  signedCompactUsd,
} from "@/lib/formatters/numberFormatting";
import { formatDuration, timeAgo } from "@/lib/formatters/dateFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import { cn } from "@/lib/utils";
import type {
  AddressDigestModel,
  BalanceBucket,
  OpenPositionRisk,
} from "./useAddressDigest";

interface WalletProfileCardProps {
  model: AddressDigestModel;
  /** Jumps to the Holdings tab on its perp view. */
  onShowPositions?: () => void;
}

/* ------------------------------------------------------------------ */
/* Local building blocks                                               */
/* ------------------------------------------------------------------ */

const BUCKET_FILL: Record<BalanceBucket["key"], string> = {
  spot: "bg-brand",
  perps: "bg-brand/50",
  vault: "bg-gold",
  staked: "bg-gold/50",
  evm: "bg-success",
  defi: "bg-success/55",
  nft: "bg-success/30",
};

/** Cyan opacity ramp for the market share bar — top market brightest. */
const MARKET_FILL = ["bg-brand", "bg-brand/75", "bg-brand/55", "bg-brand/40", "bg-brand/28", "bg-brand/18"];
const OTHERS_FILL = "bg-text-tertiary/25";

const pct = (v: number, digits = 1) => `${(v * 100).toFixed(digits)}%`;
const signedPct = (v: number) => `${v >= 0 ? "+" : "−"}${(Math.abs(v) * 100).toFixed(1)}%`;
const shortAddr = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

function ColumnHead({ children }: { children: ReactNode }) {
  return (
    <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-tertiary">
      {children}
    </div>
  );
}

function StatRow({
  label,
  value,
  sub,
  valueClassName,
  swatch,
  muted,
}: {
  label: ReactNode;
  value: ReactNode;
  sub?: ReactNode;
  valueClassName?: string;
  swatch?: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-[11.5px] leading-5">
      <span className={cn("flex items-center gap-1.5 min-w-0 truncate", muted ? "text-text-tertiary/70" : "text-text-secondary")}>
        {swatch && <span className={cn("w-2 h-2 rounded-sm shrink-0", swatch)} />}
        {label}
      </span>
      <span className={cn("mono shrink-0 text-right", muted ? "text-text-tertiary/70" : valueClassName ?? "text-text-primary")}>
        {value}
        {sub != null && <span className="ml-1.5 text-text-tertiary font-normal">{sub}</span>}
      </span>
    </div>
  );
}

function ThinBar({ segments }: { segments: DominanceSegment[] }) {
  return <DominanceBar segments={segments} height={8} legend={false} labelThresholdPct={101} />;
}

function EmptyNote({ children }: { children: ReactNode }) {
  return <p className="text-[11.5px] leading-5 text-text-tertiary">{children}</p>;
}

/** Cell of the profile grid. Right/bottom hairlines on every cell; the
 *  grid's negative margin clips the outer ones (see ProfileGrid). */
function ProfileCell({ children }: { children: ReactNode }) {
  return (
    <div className="border-r border-b border-border-subtle p-3.5 space-y-2.5 min-w-0">
      {children}
    </div>
  );
}

function ProfileGrid({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden">
      <div className="grid grid-cols-1 -mr-px -mb-px md:grid-cols-2 xl:grid-cols-4">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Columns                                                             */
/* ------------------------------------------------------------------ */

function BalancesColumn({ model }: { model: AddressDigestModel }) {
  const { netWorth, isLoading, evm, exposure, flows, variant } = model;
  const segments: DominanceSegment[] = netWorth.buckets
    .filter((b) => b.share > 0)
    .map((b) => ({
      key: b.key,
      label: b.label,
      pct: b.share * 100,
      fillClassName: BUCKET_FILL[b.key],
    }));

  const evmValue = (b: BalanceBucket): ReactNode => {
    if (evm.loading && b.value === 0) return <Skeleton className="inline-block h-3 w-12 rounded align-middle" />;
    if (evm.error && b.value === 0) return <span title={evm.error.message}>—</span>;
    return compactUsd(b.value);
  };

  // Three empty HyperEVM rows say less than one: collapse them until the
  // feeds have answered with something (the HyperEVM tab keeps the detail).
  const evmBuckets = netWorth.buckets.filter((b) => b.evm);
  const evmSettled = !evm.loading && !evm.error;
  const collapseEvm = evmBuckets.length > 0 && evmSettled && evmBuckets.every((b) => b.value === 0);
  const rows = collapseEvm ? netWorth.buckets.filter((b) => !b.evm) : netWorth.buckets;

  return (
    <ProfileCell>
      <ColumnHead>Balances</ColumnHead>
      {isLoading ? (
        <Skeleton className="h-2 rounded-full" />
      ) : segments.length > 0 ? (
        <ThinBar segments={segments} />
      ) : (
        <EmptyNote>No balance found.</EmptyNote>
      )}
      <div className="space-y-0.5">
        {rows.map((b) => (
          <StatRow
            key={b.key}
            label={b.label}
            swatch={BUCKET_FILL[b.key]}
            value={isLoading ? "…" : b.evm ? evmValue(b) : compactUsd(b.value)}
            sub={!isLoading && b.share > 0 ? pct(b.share, 0) : undefined}
            muted={!isLoading && b.value === 0 && !(b.evm && evm.loading)}
          />
        ))}
        {collapseEvm && <StatRow label="HyperEVM" swatch={BUCKET_FILL.evm} value="$0" muted />}
        {variant === "tracker" && exposure.withdrawable != null && (
          <StatRow label="Withdrawable" value={compactUsd(exposure.withdrawable)} />
        )}
        {flows && flows.netCapitalIn !== 0 && (
          <StatRow
            label={
              <span
                className="cursor-help"
                title={`Deposits ${compactUsd(flows.deposits)} − withdrawals ${compactUsd(flows.withdrawals)} + transfers in ${compactUsd(flows.transfersIn)} − out ${compactUsd(flows.transfersOut)}${
                  flows.toEvm > 0 || flows.fromEvm > 0 ? ` − net to HyperEVM ${compactUsd(flows.toEvm - flows.fromEvm)}` : ""
                }`}
              >
                Net funded
              </span>
            }
            value={signedCompactUsd(flows.netCapitalIn)}
            sub={flows.deposits > 0 ? `${compactUsd(flows.deposits)} dep.` : undefined}
          />
        )}
        {flows?.linked[0] && Math.abs(flows.linked[0].netOut) >= 1_000 && (
          <StatRow
            label={
              <Link
                href={`/market/tracker/wallet/${flows.linked[0].address}`}
                className="text-brand hover:text-brand-hover"
                title={`${flows.linked[0].count} transfers · last ${timeAgo(flows.linked[0].lastTime)} ago`}
              >
                {flows.linked[0].netOut >= 0 ? "Sends to" : "Funded by"} {shortAddr(flows.linked[0].address)}
              </Link>
            }
            value={compactUsd(Math.abs(flows.linked[0].netOut))}
            sub="net"
          />
        )}
      </div>
    </ProfileCell>
  );
}

function MarketsColumn({ model }: { model: AddressDigestModel }) {
  const { markets, trading, tradingLoading, volumes, variant } = model;

  if (!trading) {
    return (
      <ProfileCell>
        <ColumnHead>Markets</ColumnHead>
        {tradingLoading ? <Skeleton className="h-16 rounded" /> : <EmptyNote>No Hyperliquid trading history.</EmptyNote>}
      </ProfileCell>
    );
  }

  const segments: DominanceSegment[] = markets
    ? [
        ...markets.top.map((m, i) => ({
          key: m.coin,
          label: m.coin,
          pct: m.share * 100,
          fillClassName: MARKET_FILL[i] ?? MARKET_FILL[MARKET_FILL.length - 1],
        })),
        ...(markets.othersShare > 0
          ? [{ key: "others", label: "Others", pct: markets.othersShare * 100, fillClassName: OTHERS_FILL }]
          : []),
      ]
    : [];

  const day = volumes.find((v) => v.key === "day");
  const week = volumes.find((v) => v.key === "week");
  const month = volumes.find((v) => v.key === "month");
  const allTime = volumes.find((v) => v.key === "allTime");
  const perpShare = allTime && allTime.total > 0 ? allTime.perp / allTime.total : null;

  return (
    <ProfileCell>
      <ColumnHead>Markets</ColumnHead>
      {segments.length > 0 && <ThinBar segments={segments} />}
      {markets && (
        // Each group is non-breaking so a narrow cell wraps between groups,
        // never between a label and its number.
        <div className="text-[11.5px] leading-5 text-text-secondary">
          <span className="whitespace-nowrap">
            <span className="mono text-text-primary">{compactCount(markets.count)}</span>{" "}
            {markets.count === 1 ? "market" : "markets"} ·{" "}
            <span className={markets.focus === "Concentrated" ? "text-gold" : "text-text-primary"}>{markets.focus}</span>
          </span>
          {/* The focus label is derived from this share; with ≤3 markets it is always 100%. */}
          {markets.count > 3 && (
            <>
              {" "}
              <span className="whitespace-nowrap">
                · top 3 <span className="mono text-text-primary">{pct(markets.top3Share, 0)}</span>
              </span>
            </>
          )}
          {markets.count > 1 && (
            <>
              {" "}
              <span className="whitespace-nowrap">
                · top <span className="mono text-text-primary">{markets.top[0].coin}</span>{" "}
                <span className="mono text-text-tertiary">{pct(markets.top[0].share)}</span>
              </span>
            </>
          )}
        </div>
      )}
      <div className="space-y-0.5">
        {variant === "tracker" && day && week && month ? (
          <>
            <StatRow label="Volume 24h" value={compactUsd(day.total)} sub={`7d ${compactUsd(week.total)}`} />
            <StatRow
              label="Volume 30d"
              value={compactUsd(month.total)}
              sub={perpShare != null ? `${Math.round(perpShare * 100)}% perp` : undefined}
            />
          </>
        ) : null}
        <StatRow label="Lifetime volume" value={compactUsd(trading.volume)} />
        <StatRow label="Fills" value={compactCount(trading.fills)} sub={`${compactCount(trading.trades)} trades`} />
        <StatRow label="Fees" value={compactUsd(trading.fees)} />
        {trading.longPct != null && (
          <StatRow label="Long bias" value={pct(trading.longPct, 0)} sub="of round-trips" />
        )}
      </div>
    </ProfileCell>
  );
}

function EdgeColumn({ model }: { model: AddressDigestModel }) {
  const { trading, tradingLoading, cadence, pnl } = model;

  if (!trading) {
    return (
      <ProfileCell>
        <ColumnHead>Edge</ColumnHead>
        {tradingLoading ? <Skeleton className="h-16 rounded" /> : <EmptyNote>No closed round-trips to score.</EmptyNote>}
      </ProfileCell>
    );
  }

  const hasRatios = trading.avgWin != null && trading.avgLoss != null;
  // Expected value of one round-trip: what the win rate and the average
  // win / loss add up to. The one number the ribbon's ratios do not say.
  const expectancy = hasRatios
    ? trading.winRate * (trading.avgWin as number) - (1 - trading.winRate) * (trading.avgLoss as number)
    : null;
  // How much of the exchange PnL the indexer's round-trips account for.
  const coverage =
    trading.realizedPnl != null && pnl.allTime != null && pnl.allTime !== 0
      ? trading.realizedPnl / pnl.allTime
      : null;

  return (
    <ProfileCell>
      <ColumnHead>Edge</ColumnHead>
      {expectancy != null ? (
        <div className="text-[11.5px] leading-5 text-text-secondary">
          Expectancy{" "}
          <span className={cn("mono font-semibold", expectancy >= 0 ? "text-success" : "text-danger")}>
            {signedCompactUsd(expectancy)}
          </span>{" "}
          per round-trip
        </div>
      ) : (
        <EmptyNote>Ratios unavailable for this wallet.</EmptyNote>
      )}
      <div className="space-y-0.5">
        {hasRatios && (
          <StatRow
            label="Avg win / loss"
            value={
              <>
                <span className="text-success">{compactUsd(trading.avgWin)}</span>
                <span className="text-text-tertiary"> / </span>
                <span className="text-danger">{compactUsd(trading.avgLoss)}</span>
              </>
            }
          />
        )}
        {trading.bestTrade != null && trading.worstTrade != null && (
          <StatRow
            label="Best / worst"
            value={
              <>
                <span className="text-success">{signedCompactUsd(trading.bestTrade)}</span>
                <span className="text-text-tertiary"> / </span>
                <span className="text-danger">{signedCompactUsd(trading.worstTrade)}</span>
              </>
            }
          />
        )}
        {trading.equityDrawdownUsd != null && (
          <StatRow
            label="Max DD"
            value={compactUsd(trading.equityDrawdownUsd)}
            valueClassName="text-danger"
            sub={trading.equityDrawdownPct != null ? `${pct(trading.equityDrawdownPct, 0)} of equity` : undefined}
          />
        )}
        {cadence && (
          <>
            <StatRow
              label="Median hold"
              value={formatDuration(cadence.medianHoldS)}
              sub={`${cadence.style.toLowerCase()} · last ${cadence.sample}`}
            />
            <StatRow
              label="Pace"
              value={`${cadence.tradesPerDay >= 10 ? Math.round(cadence.tradesPerDay) : cadence.tradesPerDay.toFixed(1)}/day`}
              sub={`${pct(cadence.recentWinRate, 0)} recent WR`}
            />
          </>
        )}
        {trading.fundingNet != null && (
          <StatRow
            label="Funding"
            value={signedCompactUsd(trading.fundingNet)}
            valueClassName={trading.fundingNet >= 0 ? "text-success" : "text-danger"}
            sub={`${compactCount(trading.fundingEvents)} events`}
          />
        )}
        {trading.fundingReceived != null && trading.fundingPaid != null && (
          <StatRow
            label="Received / paid"
            value={`${compactUsd(trading.fundingReceived)} / ${compactUsd(trading.fundingPaid)}`}
          />
        )}
        {trading.realizedPnl != null && (
          <StatRow
            label="Realized"
            value={signedCompactUsd(trading.realizedPnl)}
            valueClassName={trading.realizedPnl >= 0 ? "text-success" : "text-danger"}
            sub={coverage != null && coverage > 0 && coverage < 0.95 ? `${pct(coverage, 0)} of HL PnL` : `${compactCount(trading.trades)} round-trips`}
          />
        )}
      </div>
    </ProfileCell>
  );
}

const distanceClass = (p: OpenPositionRisk) => {
  if (p.distance == null) return "text-text-tertiary";
  const d = Math.abs(p.distance);
  return d <= 0.05 ? "text-danger" : d <= 0.15 ? "text-gold" : "text-text-primary";
};

function RiskColumn({ model, onShowPositions }: { model: AddressDigestModel; onShowPositions?: () => void }) {
  const { format } = useNumberFormat();
  const { risk, smartMoney, carry, flows } = model;
  const { positions, marginUtilisation, liquidations } = risk;
  // Sorted by distance to liquidation upstream — the first row is the one to watch.
  const shown = positions.slice(0, 3);
  const ledgerLiqs = flows?.liquidationEvents ?? 0;
  const liqCount = Math.max(liquidations.count, ledgerLiqs);

  return (
    <ProfileCell>
      <ColumnHead>Risk</ColumnHead>
      {shown.length > 0 ? (
        <div className="space-y-0.5">
          {shown.map((p) => (
            <StatRow
              key={p.coin}
              label={
                <>
                  <span className="text-text-primary">{p.coin}</span>{" "}
                  <span className={p.side === "long" ? "text-success" : "text-danger"}>{p.side}</span>
                  {p.leverage > 0 && <span className="mono text-text-tertiary">{p.leverage}×</span>}
                </>
              }
              value={p.distance != null ? signedPct(p.distance) : "—"}
              valueClassName={distanceClass(p)}
              sub={p.liquidationPx != null ? `liq ${formatPrice(p.liquidationPx, format)}` : compactUsd(p.notional)}
            />
          ))}
          {onShowPositions ? (
            <button
              type="button"
              onClick={onShowPositions}
              className="text-[10.5px] text-brand hover:text-brand-hover"
            >
              {positions.length > shown.length
                ? `+${positions.length - shown.length} more — all ${positions.length} positions →`
                : "Open positions in Holdings →"}
            </button>
          ) : (
            positions.length > shown.length && (
              <div className="text-[10.5px] text-text-tertiary">+{positions.length - shown.length} more in Holdings</div>
            )
          )}
          <div className="text-[10.5px] text-text-tertiary">Move to liquidation, nearest first.</div>
        </div>
      ) : (
        <EmptyNote>No open perp position.</EmptyNote>
      )}
      <div className="space-y-0.5">
        {marginUtilisation != null && (
          <StatRow
            label="Margin used"
            value={pct(marginUtilisation, 0)}
            valueClassName={marginUtilisation >= 0.8 ? "text-danger" : marginUtilisation >= 0.5 ? "text-gold" : "text-text-primary"}
          />
        )}
        {carry && (
          <StatRow
            label="Funding / day"
            value={signedCompactUsd(carry.dailyUsd)}
            valueClassName={carry.dailyUsd >= 0 ? "text-success" : "text-danger"}
            sub={`${carry.rows[0].coin} ${carry.rows[0].hlApr.toFixed(1)}% APR`}
          />
        )}
        {smartMoney &&
          // Contrarian rows first — they are the ones the insights call out.
          [...smartMoney.rows].sort((a, b) => Number(a.aligned) - Number(b.aligned)).slice(0, 2).map((r) => {
            const cohortSide = r.cohortLongShare >= 0.5 ? "long" : "short";
            const share = cohortSide === "long" ? r.cohortLongShare : 1 - r.cohortLongShare;
            return (
              <StatRow
                key={`sm-${r.coin}`}
                label={`Smart $ · ${r.coin}`}
                value={r.aligned ? "aligned" : "contrarian"}
                valueClassName={r.aligned ? "text-success" : "text-gold"}
                sub={`${Math.round(share * 100)}% ${cohortSide}`}
              />
            );
          })}
        <StatRow
          label="Liquidations"
          value={liqCount === 0 ? "0 recorded" : `${liquidations.hasMore ? `${liqCount}+` : liqCount}`}
          valueClassName={liqCount > 0 ? "text-danger" : "text-text-primary"}
          sub={
            liquidations.count > 0 && liquidations.last
              ? `${compactUsd(liquidations.totalNotional)} · last ${timeAgo(liquidations.last.time_ms)} ago`
              : ledgerLiqs > 0 && flows
                ? `${compactUsd(flows.liquidatedNotional)} notional`
                : undefined
          }
        />
      </div>
    </ProfileCell>
  );
}

/* ------------------------------------------------------------------ */
/* Card                                                                */
/* ------------------------------------------------------------------ */

/**
 * The wallet profile — balances, market concentration, edge ratios and
 * liquidation risk in one 4-up grid, followed, for multi-market wallets, by a
 * single by-market table that joins volume, realized PnL, funding and fees
 * per coin. Sits above the tabs: the detail behind the ribbon and insights.
 * Every number arrives pre-aggregated from `useAddressDigest`.
 */
export function WalletProfileCard({ model, onShowPositions }: WalletProfileCardProps) {
  const { address, variant, archetype, cadence, byCoin, trading, markets, indexerStatus } = model;
  const isTracker = variant === "tracker";
  const hasFundingColumn = byCoin.some((r) => r.funding != null);
  // A single-market wallet already has its volume / PnL / fees / funding in
  // the Markets and Edge columns — the table would repeat them.
  const showByMarket = trading && byCoin.length > 1 && (markets?.count ?? 0) > 1;
  const [byMarketOpen, setByMarketOpen] = useState(true);

  return (
    <Card className="flex flex-col overflow-hidden h-full">
      <div className="flex flex-wrap items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle min-h-[44px]">
        <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
          <Fingerprint size={13} className="text-brand" />
        </span>
        <h3 className="text-[13px] font-semibold text-text-primary">Wallet profile</h3>
        {archetype && (
          <span
            title={archetype.reason}
            className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle cursor-help"
          >
            {archetype.label}
          </span>
        )}
        {cadence && (
          <span
            title={`Median hold ${formatDuration(cadence.medianHoldS)} over the last ${cadence.sample} closed round-trips`}
            className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle cursor-help"
          >
            {cadence.style}
          </span>
        )}
        <div className="ml-auto flex items-center gap-3">
          <SourceBadge source="hypedexer" status={indexerStatus} />
          <Link
            href={isTracker ? `/explorer/address/${address}` : `/market/tracker/wallet/${address}`}
            className="flex items-center gap-1 text-[11px] font-medium text-brand hover:text-brand-hover"
          >
            {isTracker ? "On-chain view" : "Full trading view"} <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      <ProfileGrid>
        <BalancesColumn model={model} />
        <MarketsColumn model={model} />
        <EdgeColumn model={model} />
        <RiskColumn model={model} onShowPositions={onShowPositions} />
      </ProfileGrid>

      {showByMarket && (
        <div className="border-t border-border-subtle">
          <button
            type="button"
            onClick={() => setByMarketOpen((o) => !o)}
            aria-expanded={byMarketOpen}
            className="w-full flex items-center text-left hover:bg-surface-2/60 transition-colors"
          >
            <ModuleSubhead>By market · top {byCoin.length}</ModuleSubhead>
            <ChevronDown
              size={13}
              className={cn("ml-auto mr-3.5 text-text-tertiary transition-transform", byMarketOpen ? "rotate-180" : "")}
            />
          </button>
          {byMarketOpen && (
          <ModuleTable
            density="compact"
            columns={[
              { header: "Coin", align: "left" },
              { header: "Volume", align: "right" },
              { header: "Share", align: "right" },
              { header: "Realized PnL", align: "right" },
              ...(hasFundingColumn ? [{ header: "Net funding", align: "right" as const }] : []),
              { header: "Fees", align: "right" },
              { header: "Fills", align: "right" },
            ]}
          >
            {byCoin.map((r) => (
              <ModuleTableRow
                key={r.coin}
                cells={[
                  <ModuleAsset
                    key="c"
                    assetName={r.label}
                    kind={r.market === "spot" ? "spot" : "auto"}
                    name={
                      r.market === "spot" ? (
                        <>
                          {r.label} <span className="text-[10px] font-normal text-text-tertiary">spot</span>
                        </>
                      ) : (
                        r.label
                      )
                    }
                  />,
                  <span key="v" className="mono text-text-secondary">{compactUsd(r.volume)}</span>,
                  <span key="s" className="mono text-text-tertiary">{r.share != null ? pct(r.share) : "—"}</span>,
                  <span
                    key="p"
                    className={cn("mono font-medium", r.pnl == null ? "text-text-tertiary" : r.pnl >= 0 ? "text-success" : "text-danger")}
                    title={r.pnl == null ? "Nothing closed on this market yet (or spot, which the indexer does not score)" : undefined}
                  >
                    {r.pnl == null ? "—" : signedCompactUsd(r.pnl)}
                  </span>,
                  ...(hasFundingColumn
                    ? [
                        <span
                          key="f"
                          className={cn("mono", r.funding == null ? "text-text-tertiary" : r.funding >= 0 ? "text-success" : "text-danger")}
                        >
                          {r.funding == null ? "—" : signedCompactUsd(r.funding)}
                        </span>,
                      ]
                    : []),
                  <span key="fe" className="mono text-text-tertiary">{compactUsd(r.fees)}</span>,
                  <span key="n" className="mono text-text-tertiary">{compactCount(r.fills)}</span>,
                ]}
              />
            ))}
          </ModuleTable>
          )}
        </div>
      )}
    </Card>
  );
}
