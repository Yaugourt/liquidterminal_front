"use client";

import { compactUsd, compactCount } from "@/lib/formatters/numberFormatting";
import { DefiLlamaChainStats, ProjectPosition } from "@/services/ecosystem/project/types";

/** One label/value line of a rail card. */
function RailRow({ label, value, gold }: { label: string; value: React.ReactNode; gold?: boolean }) {
  return (
    <div className="flex items-center justify-between text-[12px]">
      <span className="text-text-tertiary">{label}</span>
      <span className={`mono ${gold ? "text-gold" : "text-text-secondary"}`}>{value}</span>
    </div>
  );
}

interface OnHyperliquidCardProps {
  chain: DefiLlamaChainStats;
  position: ProjectPosition | null;
}

/**
 * Rail card situating the page in the chain: chain TVL, protocols tracked,
 * category size, chain fees. Renders whatever is known, nothing else.
 */
export function OnHyperliquidCard({ chain, position }: OnHyperliquidCardProps) {
  const rows: React.ReactNode[] = [];
  if (chain.tvl != null) rows.push(<RailRow key="tvl" label="Chain TVL" value={compactUsd(chain.tvl)} />);
  if (chain.protocolsTracked > 0) {
    rows.push(<RailRow key="protos" label="Protocols tracked" value={compactCount(chain.protocolsTracked)} />);
  }
  if (position?.category && position.categorySize != null) {
    rows.push(
      <RailRow key="cat" label={`${position.category} protocols`} value={compactCount(position.categorySize)} />
    );
  }
  if (chain.fees24h != null) rows.push(<RailRow key="fees" label="Chain fees 24h" value={compactUsd(chain.fees24h)} gold />);
  if (rows.length === 0) return null;

  return (
    <div className="bg-surface border border-border-subtle rounded-lg">
      <div className="px-4 py-3 border-b border-border-subtle flex items-baseline justify-between">
        <h3 className="text-[13px] font-medium text-text-primary">On Hyperliquid</h3>
        <span className="text-[10px] text-text-tertiary">DefiLlama</span>
      </div>
      <div className="px-4 py-3 space-y-2">{rows}</div>
    </div>
  );
}

/**
 * Rail note for unlinked projects: states plainly that no data source is
 * attached — no estimates, no placeholders (the debate's hard rule).
 */
export function ProjectDataNote() {
  return (
    <div className="bg-surface border border-border-subtle rounded-lg">
      <div className="px-4 py-3 border-b border-border-subtle">
        <h3 className="text-[13px] font-medium text-text-primary">Metrics</h3>
      </div>
      <div className="px-4 py-3">
        <p className="text-[12px] leading-relaxed text-text-tertiary">
          No on-chain data source is attached to this project yet, so no metrics
          are shown. No estimates, no placeholders.
        </p>
      </div>
    </div>
  );
}
