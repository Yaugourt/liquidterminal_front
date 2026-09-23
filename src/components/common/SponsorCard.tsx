"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, ChevronRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  sponsors,
  partners,
  FUNDING_HREF,
  type FundingAccent,
} from "@/lib/funding-config";

interface SponsorCardProps {
  /** Collapsed 56px rail: render a single heart affordance instead of the card. */
  collapsed: boolean;
  /** Closes the mobile drawer on navigate, mirroring the nav links. */
  onNavigate?: () => void;
}

/** Monogram tile accent, kept in sync with the sidebar family accents. */
const accentTile = (accent: FundingAccent = "brand"): string => {
  if (accent === "gold") return "border-gold/30 bg-gold/10 text-gold hover:border-gold/50";
  if (accent === "neutral")
    return "border-border-default bg-surface-2 text-text-secondary hover:border-border-strong";
  return "border-brand/30 bg-brand/10 text-brand hover:border-brand/50";
};

/**
 * SponsorCard — the "Backed by" block that sits between the nav and the footer.
 * Config-driven from `funding-config.ts`: an empty `sponsors` list swaps the
 * featured slot for a "become the first sponsor" call to action, so the UI
 * never names a prospect that has not signed. Every link routes to /funding.
 */
export function SponsorCard({ collapsed, onNavigate }: SponsorCardProps) {
  const featured = sponsors.find((s) => s.featured) ?? sponsors[0] ?? null;

  // Collapsed rail: a single heart, same hover language as the nav rows.
  if (collapsed) {
    return (
      <div className="border-t border-border-subtle py-2 flex justify-center">
        <Link
          href={FUNDING_HREF}
          onClick={onNavigate}
          aria-label="Support Liquid Terminal"
          title="Support Liquid Terminal"
          className="p-2 rounded-md text-text-tertiary hover:bg-surface-2 hover:text-brand transition-colors"
        >
          <Heart className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="border-t border-border-subtle px-2.5 py-2.5 space-y-2">
      {/* Header row: label + sponsor CTA */}
      <div className="flex items-center justify-between px-0.5">
        <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.1em] font-semibold text-text-tertiary">
          <Heart className="w-3 h-3 text-brand" fill="currentColor" />
          Backed by
        </span>
        <Link
          href={FUNDING_HREF}
          onClick={onNavigate}
          className="flex items-center gap-0.5 text-[11px] font-semibold text-brand hover:text-brand-hover transition-colors"
        >
          Sponsor
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Featured slot: a real sponsor, or the "be first" CTA when none signed */}
      {featured ? (
        <Link
          href={featured.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center gap-2.5 rounded-lg border border-brand/30 bg-brand/[0.06] px-2.5 py-2 overflow-hidden hover:border-brand/50 transition-colors"
        >
          {/* Soft brand glow behind the tile */}
          <span
            aria-hidden
            className="absolute inset-0 opacity-70 pointer-events-none"
            style={{
              background:
                "radial-gradient(120px 60px at 14% 50%, rgba(131,233,255,0.16), transparent 70%)",
            }}
          />
          <span className="relative w-9 h-9 rounded-md bg-surface-2 border border-brand/25 grid place-items-center shrink-0 overflow-hidden">
            {featured.logo ? (
              <Image src={featured.logo} alt="" width={36} height={36} className="object-cover" />
            ) : (
              <span className="text-[11px] font-bold text-brand">{featured.monogram}</span>
            )}
          </span>
          <span className="relative min-w-0 flex-1">
            <span className="block text-[12.5px] font-semibold text-text-primary truncate">
              {featured.name}
            </span>
            <span className="block text-[10.5px] text-text-tertiary truncate">
              {featured.tagline}
            </span>
          </span>
          <span className="relative shrink-0 text-[8px] uppercase tracking-[0.08em] font-semibold text-brand/80">
            Featured
          </span>
        </Link>
      ) : (
        <Link
          href={FUNDING_HREF}
          onClick={onNavigate}
          className="group flex items-center gap-2.5 rounded-lg border border-dashed border-brand/30 bg-brand/[0.04] px-2.5 py-2 hover:bg-brand/[0.08] transition-colors"
        >
          <span className="w-9 h-9 rounded-md border border-dashed border-brand/30 grid place-items-center shrink-0">
            <Plus className="w-4 h-4 text-brand" />
          </span>
          <span className="min-w-0">
            <span className="block text-[12px] font-semibold text-text-primary">
              Become the first sponsor
            </span>
            <span className="block text-[10.5px] text-text-tertiary">
              Featured slot, every page
            </span>
          </span>
        </Link>
      )}

      {/* Partners row */}
      {partners.length > 0 && (
        <div className="flex items-center gap-1.5 pt-0.5">
          <span className="text-[10px] text-text-tertiary mr-0.5">Partners</span>
          {partners.map((p) => (
            <a
              key={p.name}
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              title={p.name}
              aria-label={p.name}
              className={cn(
                "w-6 h-6 rounded-full grid place-items-center overflow-hidden text-[8.5px] font-bold border transition-colors",
                accentTile(p.accent)
              )}
            >
              {p.logo ? (
                <Image src={p.logo} alt="" width={24} height={24} className="w-full h-full object-cover" />
              ) : (
                p.monogram
              )}
            </a>
          ))}
          <Link
            href={FUNDING_HREF}
            onClick={onNavigate}
            title="All partners"
            aria-label="All partners"
            className="w-6 h-6 rounded-full grid place-items-center border border-border-default text-text-tertiary hover:text-text-primary hover:border-border-strong transition-colors"
          >
            <Plus className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* Donor call to action */}
      <Link
        href={FUNDING_HREF}
        onClick={onNavigate}
        className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-border-default px-2.5 py-2 text-[12px] font-medium text-text-secondary hover:text-gold hover:border-gold/40 transition-colors"
      >
        <Heart className="w-3.5 h-3.5 text-gold" />
        Support the terminal
      </Link>
    </div>
  );
}
