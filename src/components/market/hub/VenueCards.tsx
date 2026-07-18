"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ModuleTable, ModuleTableRow, TokenAvatar } from "@/components/common";
import { compactUsd, formatPrice } from "@/lib/formatters/numberFormatting";
import { SpotToken, SpotGlobalStats } from "@/services/market/spot/types";
import { useNumberFormat } from "@/store/number-format.store";
import { PerpMarketData, PerpGlobalStats } from "@/services/market/perp/types";
import { AuctionStrip } from "./AuctionStrip";

function changeSpan(change: number): React.ReactNode {
  return (
    <span className={`mono text-[11.5px] ${change >= 0 ? "text-success" : "text-danger"}`}>
      {change >= 0 ? "+" : ""}
      {change.toFixed(2)}%
    </span>
  );
}

/** Best/worst 24h movers of the top-volume set, as compact chips. */
function ExtremeChips({ items }: { items: { name: string; change24h: number }[] }) {
  const { best, worst } = useMemo(() => {
    if (items.length === 0) return { best: null, worst: null };
    let best = items[0];
    let worst = items[0];
    for (const t of items) {
      if (t.change24h > best.change24h) best = t;
      if (t.change24h < worst.change24h) worst = t;
    }
    return { best, worst };
  }, [items]);

  if (!best || !worst || best.name === worst.name) return null;
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="text-[10px] uppercase tracking-wide text-text-tertiary shrink-0">24h extremes</span>
      <span className="text-[10.5px] px-1.5 py-0.5 rounded bg-success/10 border border-success/25 text-success mono truncate">
        {best.name} +{best.change24h.toFixed(1)}%
      </span>
      <span className="text-[10.5px] px-1.5 py-0.5 rounded bg-danger/10 border border-danger/25 text-danger mono truncate">
        {worst.name} {worst.change24h.toFixed(1)}%
      </span>
    </div>
  );
}

function VenueShell({
  title,
  subtitle,
  openLabel,
  openHref,
  stats,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  openLabel: string;
  openHref: string;
  stats: { label: string; value: string; gold?: boolean }[];
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="bg-surface border border-border-subtle rounded-lg overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-3.5 py-3 border-b border-border-subtle">
        <div className="flex items-baseline gap-2 min-w-0">
          <h3 className="text-[13px] font-semibold text-text-primary">{title}</h3>
          <span className="text-[11px] text-text-tertiary truncate">{subtitle}</span>
        </div>
        <Link href={openHref} className="text-[11.5px] text-brand hover:text-brand-hover shrink-0">
          {openLabel} →
        </Link>
      </div>
      <div className="grid grid-cols-3 divide-x divide-border-subtle border-b border-border-subtle">
        {stats.map((s) => (
          <div key={s.label} className="px-3.5 py-2.5">
            <div className="text-[9.5px] uppercase tracking-[0.08em] text-text-tertiary truncate">{s.label}</div>
            <div className={`mono text-[14px] font-medium mt-1 ${s.gold ? "text-gold" : "text-text-primary"}`}>
              {s.value}
            </div>
          </div>
        ))}
      </div>
      <div className="flex-1">{children}</div>
      {footer}
    </div>
  );
}

const DASH = <span className="mono text-text-tertiary">—</span>;

/**
 * Spot venue card — the sidebar replacement door (verdict): stats, top-3 by
 * volume, 24h extremes, and the HIP-1 ticker auction pinned under the table.
 */
export function SpotVenueCard({
  stats,
  tokens,
}: {
  stats: SpotGlobalStats | undefined;
  tokens: SpotToken[];
}) {
  const { format } = useNumberFormat();
  const top3 = tokens.slice(0, 3);
  return (
    <VenueShell
      title="Spot"
      subtitle={stats ? `${stats.totalPairs} tokens · HIP-1` : "HIP-1"}
      openLabel="Open Spot"
      openHref="/market/spot"
      stats={[
        { label: "Volume 24h", value: stats ? compactUsd(stats.totalVolume24h) : "…" },
        { label: "Spot USDC", value: stats ? compactUsd(stats.totalSpotUSDC) : "…" },
        { label: "HIP-2 liquidity", value: stats ? compactUsd(stats.totalHIP2) : "…" },
      ]}
      footer={
        <>
          {tokens.length > 2 && (
            <div className="px-3.5 py-2 border-t border-border-subtle">
              <ExtremeChips items={tokens} />
            </div>
          )}
          <AuctionStrip kind="spot" />
        </>
      }
    >
      <ModuleTable
        density="compact"
        columns={[
          { header: "Token", align: "left" },
          { header: "Price", width: 90 },
          { header: "24h", width: 76 },
          { header: "Volume", width: 90 },
        ]}
      >
        {top3.map((t) => (
          <ModuleTableRow
            key={t.name}
            href={`/market/spot/${encodeURIComponent(t.name)}`}
            cells={[
              <span key="n" className="flex items-center gap-2 min-w-0">
                <TokenAvatar assetName={t.name} size="sm" />
                <span className="text-[12.5px] font-medium text-text-primary truncate">{t.name}</span>
              </span>,
              <span key="p" className="mono text-[12px] text-text-primary">{formatPrice(t.price, format)}</span>,
              changeSpan(t.change24h),
              <span key="v" className="mono text-[12px] text-text-secondary">{compactUsd(t.volume)}</span>,
            ]}
          />
        ))}
      </ModuleTable>
    </VenueShell>
  );
}

/**
 * Perpetuals venue card — stats, top-3 by volume with OI, extremes, and the
 * HIP-3 perp-deploy auction pinned under the table.
 */
export function PerpVenueCard({
  stats,
  markets,
}: {
  stats: PerpGlobalStats | undefined;
  markets: PerpMarketData[];
}) {
  const top3 = markets.slice(0, 3);
  return (
    <VenueShell
      title="Perpetuals"
      subtitle={stats ? `${stats.totalPairs} markets · core DEX` : "core DEX"}
      openLabel="Open Perpetual"
      openHref="/market/perp"
      stats={[
        { label: "Volume 24h", value: stats ? compactUsd(stats.totalVolume24h) : "…" },
        { label: "Open interest", value: stats ? compactUsd(stats.totalOpenInterest) : "…" },
        { label: "HLP TVL", value: stats ? compactUsd(stats.hlpTvl) : "…" },
      ]}
      footer={
        <>
          {markets.length > 2 && (
            <div className="px-3.5 py-2 border-t border-border-subtle">
              <ExtremeChips items={markets} />
            </div>
          )}
          <AuctionStrip kind="perp" />
        </>
      }
    >
      <ModuleTable
        density="compact"
        columns={[
          { header: "Market", align: "left" },
          { header: "24h", width: 76 },
          { header: "Volume", width: 90 },
          { header: "OI", width: 84 },
        ]}
      >
        {top3.map((m) => (
          <ModuleTableRow
            key={m.name}
            href={`/market/perp/${encodeURIComponent(m.name)}`}
            cells={[
              <span key="n" className="flex items-center gap-2 min-w-0">
                <TokenAvatar assetName={m.name} size="sm" />
                <span className="text-[12.5px] font-medium text-text-primary truncate">{m.name}</span>
              </span>,
              changeSpan(m.change24h),
              <span key="v" className="mono text-[12px] text-text-secondary">{compactUsd(m.volume)}</span>,
              m.openInterest > 0 ? (
                <span key="oi" className="mono text-[12px] text-text-secondary">{compactUsd(m.openInterest)}</span>
              ) : (
                DASH
              ),
            ]}
          />
        ))}
      </ModuleTable>
    </VenueShell>
  );
}
