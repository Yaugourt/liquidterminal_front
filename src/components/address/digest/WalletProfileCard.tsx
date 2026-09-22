"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Fingerprint } from "lucide-react";
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
import { timeAgo } from "@/lib/formatters/dateFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import { cn } from "@/lib/utils";
import type {
  AddressDigestModel,
  BalanceBucket,
  OpenPositionRisk,
} from "./useAddressDigest";

interface WalletProfileCardProps {
  model: AddressDigestModel;
}

/* ------------------------------------------------------------------ */
/* Local building blocks                                               */
/* ------------------------------------------------------------------ */

const BUCKET_FILL: Record<BalanceBucket["key"], string> = {
  spot: "bg-brand",
  perps: "bg-brand/50",
  vault: "bg-gold",
  staked: "bg-gold/50",
};

/** Cyan opacity ramp for the market share bar — top market brightest. */
const MARKET_FILL = ["bg-brand", "bg-brand/75", "bg-brand/55", "bg-brand/40", "bg-brand/28", "bg-brand/18"];
const OTHERS_FILL = "bg-text-tertiary/25";

const pct = (v: number, digits = 1) => `${(v * 100).toFixed(digits)}%`;
const signedPct = (v: number) => `${v >= 0 ? "+" : "−"}${(Math.abs(v) * 100).toFixed(1)}%`;

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

/** Cell of the 4-up profile grid. Right/bottom hairlines on every cell; the
 *  grid's negative margin clips the outer ones (see ProfileGrid). */
function ProfileCell({ children }: { children: ReactNode }) {
  return (
    <div className="border-r border-b border-border-subtle p-3.5 space-y-2.5 min-w-0">
      {children}
    </div>
  );
}

function ProfileGrid({ children, columns }: { children: ReactNode; columns: 2 | 4 }) {
  return (
    <div className="overflow-hidden">
      <div
        className={cn(
          "grid grid-cols-1 -mr-px -mb-px",
          columns === 4 ? "md:grid-cols-2 xl:grid-cols-4" : "md:grid-cols-2"
        )}
      >
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Columns                                                             */
/* ------------------------------------------------------------------ */

function BalancesColumn({ model }: { model: AddressDigestModel }) {
  const { netWorth, isLoading } = model;
  const segments: DominanceSegment[] = netWorth.buckets
    .filter((b) => b.share > 0)
    .map((b) => ({
      key: b.key,
      label: b.label,
      pct: b.share * 100,
      fillClassName: BUCKET_FILL[b.key],
    }));

  return (
    <ProfileCell>
      <ColumnHead>Balances</ColumnHead>
      {isLoading ? (
        <Skeleton className="h-2 rounded-full" />
      ) : segments.length > 0 ? (
        <ThinBar segments={segments} />
      ) : (
        <EmptyNote>No HyperCore balance.</EmptyNote>
      )}
      <div className="space-y-0.5">
        {netWorth.buckets.map((b) => (
          <StatRow
            key={b.key}
            label={b.label}
            swatch={BUCKET_FILL[b.key]}
            value={isLoading ? "…" : compactUsd(b.value)}
            sub={!isLoading && b.share > 0 ? pct(b.share, 0) : undefined}
            muted={!isLoading && b.value === 0}
          />
        ))}
      </div>
    </ProfileCell>
  );
}

function MarketsColumn({ model }: { model: AddressDigestModel }) {
  const { markets, trading, tradingLoading } = model;

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

  return (
    <ProfileCell>
      <ColumnHead>Markets</ColumnHead>
      {segments.length > 0 && <ThinBar segments={segments} />}
      {markets && (
        <div className="text-[11.5px] leading-5 text-text-secondary">
          <span className="mono text-text-primary">{compactCount(markets.count)}</span>{" "}
          {markets.count === 1 ? "market" : "markets"} ·{" "}
          <span className={markets.focus === "Concentrated" ? "text-gold" : "text-text-primary"}>{markets.focus}</span>
          {markets.count > 1 && (
            <>
              {" "}· top <span className="mono text-text-primary">{markets.top[0].coin}</span>{" "}
              <span className="mono text-text-tertiary">{pct(markets.top[0].share)}</span>
            </>
          )}
        </div>
      )}
      <div className="space-y-0.5">
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
  const { trading, tradingLoading } = model;

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
            label="Best / worst trade"
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
            label="Max drawdown"
            value={compactUsd(trading.equityDrawdownUsd)}
            valueClassName="text-danger"
            sub={trading.equityDrawdownPct != null ? `${pct(trading.equityDrawdownPct, 0)} of equity` : undefined}
          />
        )}
        {trading.fundingNet != null && (
          <StatRow
            label="Funding"
            value={signedCompactUsd(trading.fundingNet)}
            valueClassName={trading.fundingNet >= 0 ? "text-success" : "text-danger"}
            sub={`${compactCount(trading.fundingEvents)} events`}
          />
        )}
        <StatRow label="Round-trips" value={compactCount(trading.trades)} sub={`${compactCount(trading.fills)} fills`} />
      </div>
    </ProfileCell>
  );
}

const distanceClass = (p: OpenPositionRisk) => {
  if (p.distance == null) return "text-text-tertiary";
  const d = Math.abs(p.distance);
  return d <= 0.05 ? "text-danger" : d <= 0.15 ? "text-gold" : "text-text-primary";
};

function RiskColumn({ model }: { model: AddressDigestModel }) {
  const { format } = useNumberFormat();
  const { risk } = model;
  const { positions, marginUtilisation, liquidations } = risk;
  // Sorted by distance to liquidation upstream — the first row is the one to watch.
  const shown = positions.slice(0, 3);

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
          {positions.length > shown.length && (
            <div className="text-[10.5px] text-text-tertiary">+{positions.length - shown.length} more in Holdings</div>
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
        <StatRow
          label="Liquidations"
          value={liquidations.count === 0 ? "0 recorded" : `${liquidations.hasMore ? `${liquidations.count}+` : liquidations.count}`}
          valueClassName={liquidations.count > 0 ? "text-danger" : "text-text-primary"}
          sub={
            liquidations.count > 0 && liquidations.last
              ? `${compactUsd(liquidations.totalNotional)} · last ${timeAgo(liquidations.last.time_ms)} ago`
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
 * liquidation risk in one 4-up grid, plus a single by-market table that
 * joins volume, realized PnL, funding and fees per coin (it replaces the
 * three per-coin tables the page used to stack). Every number arrives
 * pre-aggregated from `useAddressDigest`.
 */
export function WalletProfileCard({ model }: WalletProfileCardProps) {
  const { address, archetype, byCoin, trading, indexerStatus } = model;
  const hasFundingColumn = byCoin.some((r) => r.funding != null);

  return (
    <Card className="flex flex-col overflow-hidden">
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
        <div className="ml-auto flex items-center gap-3">
          <SourceBadge source="hypedexer" status={indexerStatus} />
          <Link
            href={`/market/tracker/wallet/${address}`}
            className="flex items-center gap-1 text-[11px] font-medium text-brand hover:text-brand-hover"
          >
            Full trading view <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      <ProfileGrid columns={4}>
        <BalancesColumn model={model} />
        <MarketsColumn model={model} />
        <EdgeColumn model={model} />
        <RiskColumn model={model} />
      </ProfileGrid>

      {trading && byCoin.length > 0 && (
        <div className="border-t border-border-subtle">
          <ModuleSubhead>By market · top {byCoin.length}</ModuleSubhead>
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
                  <ModuleAsset key="c" tone="neutral" assetName={r.coin} kind="auto" name={r.coin} />,
                  <span key="v" className="mono text-text-secondary">{compactUsd(r.volume)}</span>,
                  <span key="s" className="mono text-text-tertiary">{r.share != null ? pct(r.share) : "—"}</span>,
                  <span key="p" className={cn("mono font-medium", r.pnl >= 0 ? "text-success" : "text-danger")}>
                    {signedCompactUsd(r.pnl)}
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
        </div>
      )}
    </Card>
  );
}
