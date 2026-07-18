"use client";

import Link from "next/link";
import { useMemo } from "react";
import { compactUsd, compactCount } from "@/lib/formatters/numberFormatting";
import { Hip3Overview } from "@/services/indexer/hip3";
import { useHip4QuestionsWithOutcomes } from "@/services/indexer/hip4/hooks/useHip4QuestionsWithOutcomes";
import { useBuildersTop, useBuildersStatsAllTimeframes } from "@/services/indexer/builders";
import { formatBuilderDisplayNameOrAddress } from "@/components/market/builders/formatBuilderDisplayName";
import { AuctionStrip } from "./AuctionStrip";

function LaneShell({
  title,
  tag,
  href,
  hrefLabel,
  children,
  footer,
}: {
  title: string;
  tag?: string;
  href: string;
  hrefLabel: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="bg-surface border border-border-subtle rounded-lg overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-3.5 py-3 border-b border-border-subtle">
        <div className="flex items-baseline gap-2 min-w-0">
          <h3 className="text-[13px] font-semibold text-text-primary truncate">{title}</h3>
          {tag && <span className="text-[11px] text-text-tertiary truncate">{tag}</span>}
        </div>
        <Link href={href} className="text-[11.5px] text-brand hover:text-brand-hover shrink-0">
          {hrefLabel} →
        </Link>
      </div>
      <div className="flex-1">{children}</div>
      {footer}
    </div>
  );
}

/**
 * PerpDexs (HIP-3) lane: the venue totals plus the deploy-auction recall
 * (the same auction as the Perpetuals strip — HIP-3 is where deploys land).
 */
export function PerpDexsLane({ overview }: { overview: Hip3Overview | null }) {
  return (
    <LaneShell
      title="Perp DEXs"
      tag="HIP-3"
      href="/market/perpdex"
      hrefLabel="All"
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

/** HIP-4 predictions lane: the 3 biggest live questions with their probability. */
export function Hip4Lane() {
  const { questions } = useHip4QuestionsWithOutcomes();

  const top = useMemo(() => {
    const rows = (questions ?? [])
      .filter((q) => q.status === "live" && q.title)
      .sort((a, b) => (b.total_volume ?? 0) - (a.total_volume ?? 0))
      .slice(0, 3);
    return rows.map((q) => {
      const lead = [...q.outcomes].sort((a, b) => (b.total_volume ?? 0) - (a.total_volume ?? 0))[0];
      const prob = lead?.mid_price != null ? Math.max(0, Math.min(1, lead.mid_price)) : null;
      return {
        id: q.question_id ?? q.title,
        title: q.title as string,
        volume: q.total_volume,
        outcomeName: lead?.display_name ?? null,
        prob,
      };
    });
  }, [questions]);

  const liveCount = useMemo(() => (questions ?? []).filter((q) => q.status === "live").length, [questions]);

  return (
    <LaneShell title="Predictions" tag="HIP-4" href="/market/hip4" hrefLabel={liveCount > 0 ? `${liveCount} live` : "All"}>
      <div className="px-3.5 py-3 space-y-3">
        {top.length === 0 && <p className="text-[11.5px] text-text-tertiary">Loading live questions…</p>}
        {top.map((q) => (
          <Link key={q.id} href="/market/hip4" className="block group">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[12px] text-text-primary truncate group-hover:text-brand transition-colors">
                {q.title}
              </span>
              {q.prob != null && (
                <span className="mono text-[12px] text-success shrink-0">{(q.prob * 100).toFixed(1)}%</span>
              )}
            </div>
            <div className="flex items-center justify-between gap-2 mt-1">
              {q.prob != null ? (
                <span className="flex-1 h-1 rounded-full bg-surface-2 overflow-hidden">
                  <span className="block h-full bg-success/70" style={{ width: `${q.prob * 100}%` }} />
                </span>
              ) : (
                <span className="flex-1" />
              )}
              <span className="mono text-[10px] text-text-tertiary shrink-0">{compactUsd(q.volume)} vol</span>
            </div>
          </Link>
        ))}
      </div>
    </LaneShell>
  );
}

/** Builders lane: 7d top by volume + concentration note. */
export function BuildersLane() {
  const top = useBuildersTop({ timeframe: "7d", sort: "volume", limit: 3 });
  const allTf = useBuildersStatsAllTimeframes();

  const rows = top.data?.builders ?? [];
  const totals = allTf.stats?.["7d"]?.current;
  const concentration =
    totals && totals.totalVolume > 0 && rows.length === 3
      ? (rows.reduce((acc, b) => acc + (b.totalVolume ?? 0), 0) / totals.totalVolume) * 100
      : null;

  return (
    <LaneShell
      title="Builders"
      tag="order flow · 7d"
      href="/market/builders"
      hrefLabel="All"
      footer={
        totals ? (
          <div className="px-3.5 py-2.5 border-t border-border-subtle text-[10.5px] text-text-tertiary">
            {compactCount(totals.uniqueBuilders)} active builders
            {concentration != null && <> · top 3 hold <span className="mono text-text-secondary">{concentration.toFixed(1)}%</span></>}
          </div>
        ) : undefined
      }
    >
      <div className="px-3.5 py-3 space-y-2.5">
        {rows.length === 0 && <p className="text-[11.5px] text-text-tertiary">Loading builders…</p>}
        {rows.map((b, i) => (
          <div key={b.builder} className="flex items-center gap-2.5">
            <span className="mono text-[10.5px] text-text-tertiary w-4 shrink-0">{i + 1}</span>
            <span className="text-[12.5px] text-text-primary truncate flex-1">
              {formatBuilderDisplayNameOrAddress(b.builderName, b.builder)}
            </span>
            <span className="mono text-[12px] text-text-secondary shrink-0">{compactUsd(b.totalVolume ?? 0)}</span>
            <span className="mono text-[11px] text-gold shrink-0">{compactUsd(b.totalBuilderFees ?? 0)}</span>
          </div>
        ))}
      </div>
    </LaneShell>
  );
}
