"use client";

import { Info } from "lucide-react";
import { compactUsd, compactCount } from "@/lib/formatters/numberFormatting";
import { DefiLlamaChainStats, Project, ProjectPosition } from "@/services/ecosystem/project/types";

/** One label/value line of a rail card. */
function RailRow({ label, value, gold }: { label: string; value: React.ReactNode; gold?: boolean }) {
  return (
    <div className="flex items-center justify-between text-[12px]">
      <span className="text-text-tertiary">{label}</span>
      <span className={`mono ${gold ? "text-gold" : "text-text-secondary"}`}>{value}</span>
    </div>
  );
}

/** Labeled share bar (0-100). */
function ShareBar({ label, pct, strong }: { label: string; pct: number; strong?: boolean }) {
  const width = Math.max(0, Math.min(100, pct));
  return (
    <div>
      <div className="flex items-center justify-between text-[11.5px] mb-1">
        <span className="text-text-tertiary">{label}</span>
        <span className="mono text-text-secondary">{pct.toFixed(1)}%</span>
      </div>
      <span className="block h-1.5 rounded-full bg-surface-2 overflow-hidden">
        <span className={`block h-full ${strong ? "bg-brand" : "bg-brand/60"}`} style={{ width: `${width}%` }} />
      </span>
    </div>
  );
}

/**
 * Rail "Position" card (verdict): the project's rank as the hero figure,
 * with its two real shares as bars. Only renders on real ranking data.
 */
export function PositionRailCard({ position }: { position: ProjectPosition }) {
  if (position.categoryRank == null || position.categorySize == null || !position.category) return null;
  return (
    <div className="bg-surface border border-border-subtle rounded-lg">
      <div className="px-4 py-3 border-b border-border-subtle flex items-baseline justify-between">
        <h3 className="text-[13px] font-medium text-text-primary">Position</h3>
        <span className="text-[11px] text-text-tertiary">via DefiLlama</span>
      </div>
      <div className="px-4 py-3.5 space-y-3">
        <div className="flex items-baseline gap-2">
          <span className={`mono text-[26px] font-semibold leading-none ${position.categoryRank === 1 ? "text-gold" : "text-text-primary"}`}>
            #{position.categoryRank}
          </span>
          <span className="text-[12px] text-text-secondary">
            of {position.categorySize} {position.category} on HL
          </span>
        </div>
        <div className="space-y-2 pt-1">
          {position.shareOfCategoryPct != null && (
            <ShareBar label={`Share of ${position.category}`} pct={position.shareOfCategoryPct} strong />
          )}
          {position.shareOfChainPct != null && (
            <ShareBar label="Share of HL DeFi" pct={position.shareOfChainPct} />
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Rail "Links" card: website (as its hostname), socials, and the DefiLlama
 * protocol page when the project is linked.
 */
export function ProjectLinksCard({ project }: { project: Project }) {
  const websiteLabel = (() => {
    if (!project.website) return null;
    try {
      return new URL(project.website).hostname.replace(/^www\./, "");
    } catch {
      return "Website";
    }
  })();

  const links = [
    { url: project.website, label: websiteLabel ?? "Website" },
    { url: project.twitter, label: "X / Twitter" },
    { url: project.discord, label: "Discord" },
    { url: project.telegram, label: "Telegram" },
    project.defillamaSlug
      ? { url: `https://defillama.com/protocol/${project.defillamaSlug}`, label: "DefiLlama" }
      : { url: undefined, label: "" },
  ].filter((l): l is { url: string; label: string } => Boolean(l.url));

  if (links.length === 0) return null;
  return (
    <div className="bg-surface border border-border-subtle rounded-lg">
      <div className="px-4 py-3 border-b border-border-subtle">
        <h3 className="text-[13px] font-medium text-text-primary">Links</h3>
      </div>
      <div className="px-2 py-2">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-2 py-1.5 rounded-md text-[12.5px] text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors"
          >
            {link.label}
            <span className="ml-auto text-text-tertiary">↗</span>
          </a>
        ))}
      </div>
    </div>
  );
}

/**
 * Rail chain-context card (verdict): macro figures demoted to the last slot,
 * small and explicitly labeled — never competing with project info.
 */
export function OnHyperliquidCard({ chain, position }: { chain: DefiLlamaChainStats; position: ProjectPosition | null }) {
  const rows: React.ReactNode[] = [];
  if (chain.tvl != null) rows.push(<RailRow key="tvl" label="Chain TVL" value={compactUsd(chain.tvl)} />);
  if (chain.fees24h != null) rows.push(<RailRow key="fees" label="Chain fees 24h" value={compactUsd(chain.fees24h)} gold />);
  if (chain.protocolsTracked > 0) {
    rows.push(<RailRow key="protos" label="Protocols tracked" value={compactCount(chain.protocolsTracked)} />);
  }
  if (position?.category && position.categorySize != null) {
    rows.push(
      <RailRow key="cat" label={`${position.category} protocols`} value={compactCount(position.categorySize)} />
    );
  }
  if (rows.length === 0) return null;

  return (
    <div className="bg-surface border border-border-subtle rounded-lg">
      <div className="px-4 py-3 border-b border-border-subtle flex items-baseline justify-between">
        <h3 className="text-[13px] font-medium text-text-secondary">Hyperliquid L1</h3>
        <span className="text-[10px] text-text-tertiary">chain context</span>
      </div>
      <div className="px-4 py-3 space-y-1.5">{rows}</div>
    </div>
  );
}

/**
 * Rail "About" card for listing-only projects: strictly what we know.
 */
export function AboutMetaCard({ project }: { project: Project }) {
  const listed = new Date(project.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" });
  const category = project.categories?.[0]?.name;
  return (
    <div className="bg-surface border border-border-subtle rounded-lg">
      <div className="px-4 py-3 border-b border-border-subtle">
        <h3 className="text-[13px] font-medium text-text-primary">About</h3>
      </div>
      <div className="px-4 py-3 space-y-2">
        <RailRow label="Listed" value={listed} />
        {category && (
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-text-tertiary">Category</span>
            <span className="text-text-secondary">{category}</span>
          </div>
        )}
        <RailRow
          label="Data source"
          value={
            project.defillamaSlug ? (
              <span className="text-text-secondary">defillama:{project.defillamaSlug}</span>
            ) : (
              <span className="text-text-tertiary">none yet</span>
            )
          }
        />
      </div>
    </div>
  );
}

/**
 * Single honest line for listing-only projects (verdict): states the fact,
 * full width, no card that apologises, no product-policy recital.
 */
export function ListingNotice() {
  return (
    <div className="flex items-center gap-2.5 px-4 py-3 border border-border-subtle rounded-lg text-[12.5px] text-text-secondary">
      <Info className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
      No on-chain data is tracked for this project yet. Fundamentals appear here once a data source covers it.
    </div>
  );
}
