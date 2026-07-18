"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSpotGlobalStats } from "@/services/market/spot/hooks/useSpotGlobalStats";
import { usePerpGlobalStats } from "@/services/market/perp/hooks/usePerpGlobalStats";
import { useHip3Overview } from "@/services/indexer/hip3";

interface ScopeItem {
  label: string;
  href: string;
  /** Exact match instead of prefix (the Overview tab). */
  exact?: boolean;
  count?: number | null;
}

/**
 * Persistent scope bar of the Market section (verdict design): Spot and
 * Perpetual left the sidebar, so every /market/* page carries this row —
 * any sibling is one click away, the hub is the Overview tab.
 */
export function MarketScopeBar() {
  const pathname = usePathname();
  const { stats: spotStats } = useSpotGlobalStats();
  const { stats: perpStats } = usePerpGlobalStats();
  const { data: hip3 } = useHip3Overview();

  const items: ScopeItem[] = [
    { label: "Overview", href: "/market", exact: true },
    { label: "Spot", href: "/market/spot", count: spotStats?.totalPairs ?? null },
    { label: "Perpetual", href: "/market/perp", count: perpStats?.totalPairs ?? null },
    { label: "PerpDexs", href: "/market/perpdex", count: hip3?.total_dexs ?? null },
    { label: "HIP-4", href: "/market/hip4" },
    { label: "Builders", href: "/market/builders" },
    { label: "Tracker", href: "/market/tracker" },
  ];

  const isActive = (item: ScopeItem): boolean => {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };

  return (
    <nav
      aria-label="Market sections"
      className="flex items-center gap-1 mb-5 -mt-1 overflow-x-auto scrollbar-brand"
    >
      <span className="text-[10px] uppercase tracking-[0.1em] text-text-tertiary mr-2 shrink-0">
        Market
      </span>
      {items.map((item) => {
        const active = isActive(item);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`px-2.5 py-1 rounded-md text-[12.5px] whitespace-nowrap transition-colors ${
              active
                ? "text-brand font-medium bg-brand/10"
                : "text-text-tertiary hover:text-text-primary"
            }`}
          >
            {item.label}
            {item.count != null && (
              <span className={`mono text-[10.5px] ml-1.5 ${active ? "text-brand/70" : "text-text-tertiary"}`}>
                {item.count.toLocaleString("en-US")}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
