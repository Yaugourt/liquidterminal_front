"use client";

import Link from "next/link";
import { useMemo } from "react";
import { compactUsd, compactCount } from "@/lib/formatters/numberFormatting";
import { Hip3Overview } from "@/services/indexer/hip3";
import { useHip4ActiveMarkets } from "@/services/indexer/hip4/hooks/useHip4ActiveMarkets";
import { headlineOutcomes, hip4QuestionHref, hip4QuestionKey, isBinaryQuestion } from "@/lib/hip4/market-formatter";
import { useBuildersTop, useBuildersStatsAllTimeframes } from "@/services/indexer/builders";
import { BuilderAvatar, resolveBuilderLabel } from "@/components/market/builders";
import { AuctionStrip } from "./AuctionStrip";
import { CardHead, SourceBadge, sourceStatus, combinedSourceStatus, RowFillList, chartPalette, type SourceBadgeStatus } from "@/components/common";

function LaneShell({
  title,
  tag,
  href,
  hrefLabel,
  children,
  footer,
  actions,
}: {
  title: string;
  tag?: string;
  href: string;
  hrefLabel: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Right-pinned head slot before the link — home of the `SourceBadge`. */
  actions?: React.ReactNode;
}) {
  return (
    <div className="bg-surface border border-border-subtle rounded-lg overflow-hidden flex flex-col">
      <CardHead title={title} subtitle={tag} actions={actions} href={href} viewAllLabel={hrefLabel} />
      <div className="flex-1 flex flex-col">{children}</div>
      {footer}
    </div>
  );
}

/**
 * PerpDexs (HIP-3) lane: the venue totals plus the deploy-auction recall
 * (the same auction as the Perpetuals strip — HIP-3 is where deploys land).
 */
export function PerpDexsLane({
  overview,
  sourceStatus: status = "ok",
}: {
  overview: Hip3Overview | null;
  /** `/indexer/hip3/overview` route health, owned by the page that fetches it. */
  sourceStatus?: SourceBadgeStatus;
}) {
  return (
    <LaneShell
      title="Perp DEXs"
      tag="HIP-3"
      href="/market/perpdex"
      hrefLabel="All"
      actions={<SourceBadge source="hypedexer" status={status} />}
      footer={<AuctionStrip kind="perp" compact />}
    >
      <div className="px-3.5 py-3 space-y-2 text-[12px]">
        <div className="flex justify-between"><span className="text-text-tertiary">Builder DEXs</span><span className="mono text-text-primary">{overview ? compactCount(overview.total_dexs) : "…"}</span></div>
        <div className="flex justify-between"><span className="text-text-tertiary">Assets listed</span><span className="mono text-text-primary">{overview ? compactCount(overview.total_assets) : "…"}</span></div>
        <div className="flex justify-between"><span className="text-text-tertiary">Volume 24h</span><span className="mono text-text-primary">{overview ? compactUsd(overview.total_volume_24h) : "…"}</span></div>
        <div className="flex justify-between"><span className="text-text-tertiary">Fees 24h</span><span className="mono text-gold">{overview ? compactUsd(overview.total_fees_24h) : "…"}</span></div>
        <div className="flex justify-between"><span className="text-text-tertiary">Open interest</span><span className="mono text-text-primary">{overview ? compactUsd(overview.total_open_interest) : "…"}</span></div>
      </div>
    </LaneShell>
  );
}

/** Multi-outcome colors: the list page's, for the same outcome (`Hip4OutcomeBar`). */
const HIP4_PALETTE = chartPalette.multiSeries;

/** HIP-4 predictions lane: the biggest live questions with their probability, filling the lane height. */
export function Hip4Lane() {
  // The list page's live markets (indexer questions merged with Hyperliquid's
  // live markets), biggest volume first; the same hook as the dashboard card.
  const { questions, activeCount, volumesMissing, isLoading, error, isStale } = useHip4ActiveMarkets(12);

  const top = useMemo(
    () =>
      questions.map((q) => {
        const binary = isBinaryQuestion(q);
        // A Yes/No market shows its chance of Yes; any other question its
        // favourite, named, in that outcome's palette color.
        const [lead] = headlineOutcomes(q, 1);
        const prob =
          lead?.mid_price != null && Number.isFinite(lead.mid_price)
            ? Math.max(0, Math.min(1, lead.mid_price))
            : null;
        return {
          id: hip4QuestionKey(q),
          href: hip4QuestionHref(q) ?? "/market/hip4",
          title: q.title ?? "Untitled market",
          volume: q.total_volume,
          outcomeName: binary ? null : (lead?.display_name ?? null),
          color: binary || !lead ? null : HIP4_PALETTE[q.outcomes.indexOf(lead) % HIP4_PALETTE.length],
          prob,
        };
      }),
    [questions]
  );

  return (
    <LaneShell
      title="Predictions"
      tag="HIP-4"
      href="/market/hip4"
      hrefLabel={activeCount > 0 ? `${activeCount} live` : "All"}
      actions={<SourceBadge source="hypedexer" status={sourceStatus(error, isLoading, isStale)} />}
    >
      <RowFillList mobileHeight="h-[320px]" className="px-3.5 py-3 space-y-3">
        {top.length === 0 && (
          <p className="text-[11.5px] text-text-tertiary">
            {isLoading ? "Loading live questions…" : error ? "Live markets unavailable" : "No live markets"}
          </p>
        )}
        {top.map((q) => (
          <Link key={q.id} href={q.href} className="block group">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[12px] text-text-primary truncate group-hover:text-brand transition-colors" title={q.title}>
                {q.title}
              </span>
              {q.prob != null && (
                <span className="flex items-baseline gap-1 min-w-0 max-w-[45%] shrink-0">
                  {q.outcomeName && (
                    <span className="text-[11px] text-text-secondary truncate" title={q.outcomeName}>
                      {q.outcomeName}
                    </span>
                  )}
                  <span
                    className={`mono text-[12px] shrink-0 ${q.color ? "" : "text-success"}`}
                    style={q.color ? { color: q.color } : undefined}
                  >
                    {(q.prob * 100).toFixed(1)}%
                  </span>
                </span>
              )}
            </div>
            <div className="flex items-center justify-between gap-2 mt-1">
              {q.prob != null ? (
                <span className="flex-1 h-1 rounded-full bg-surface-2 overflow-hidden">
                  <span
                    className={`block h-full ${q.color ? "opacity-70" : "bg-success/70"}`}
                    style={{ width: `${q.prob * 100}%`, ...(q.color ? { background: q.color } : {}) }}
                  />
                </span>
              ) : (
                <span className="flex-1" />
              )}
              {!volumesMissing && (
                <span className="mono text-[10px] text-text-tertiary shrink-0">{compactUsd(q.volume)} vol</span>
              )}
            </div>
          </Link>
        ))}
      </RowFillList>
    </LaneShell>
  );
}

/** Builders lane: 7d top builders by volume, filling the lane height, + top-3 concentration note. */
export function BuildersLane() {
  const top = useBuildersTop({ timeframe: "7d", sort: "volume", limit: 12 });
  const allTf = useBuildersStatsAllTimeframes();

  const rows = top.data?.builders ?? [];
  const totals = allTf.stats?.["7d"]?.current;
  const concentration =
    totals && totals.totalVolume > 0 && rows.length >= 3
      ? (rows.slice(0, 3).reduce((acc, b) => acc + (b.totalVolume ?? 0), 0) / totals.totalVolume) * 100
      : null;

  return (
    <LaneShell
      title="Builders"
      tag="order flow · 7d"
      href="/market/builders"
      hrefLabel="All"
      actions={<SourceBadge source="hypedexer" status={combinedSourceStatus(top, allTf)} />}
      footer={
        totals ? (
          <div className="px-3.5 py-2.5 border-t border-border-subtle text-[10.5px] text-text-tertiary">
            {compactCount(totals.uniqueBuilders)} active builders
            {concentration != null && <> · top 3 hold <span className="mono text-text-secondary">{concentration.toFixed(1)}%</span></>}
          </div>
        ) : undefined
      }
    >
      <RowFillList mobileHeight="h-[220px]" minHeight="lg:min-h-[120px]" className="px-3.5 py-3 space-y-2.5">
        {rows.length === 0 && <p className="text-[11.5px] text-text-tertiary">Loading builders…</p>}
        {rows.map((b, i) => (
          <div key={b.builder} className="flex items-center gap-2.5">
            <span className="mono text-[10.5px] text-text-tertiary w-4 shrink-0">{i + 1}</span>
            <BuilderAvatar
              address={b.builder}
              label={resolveBuilderLabel(b.builder, b.builderName).label}
              size={16}
            />
            <span className="text-[12.5px] text-text-primary truncate flex-1" title={resolveBuilderLabel(b.builder, b.builderName).label}>
              {resolveBuilderLabel(b.builder, b.builderName).label}
            </span>
            <span className="mono text-[12px] text-text-secondary shrink-0">{compactUsd(b.totalVolume ?? 0)}</span>
            <span className="mono text-[11px] text-gold shrink-0">{compactUsd(b.totalBuilderFees ?? 0)}</span>
          </div>
        ))}
      </RowFillList>
    </LaneShell>
  );
}
