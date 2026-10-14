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
 * In-page tabs of the Market family: the same entries, in the same order, as
 * the sidebar's Markets group, so any sibling market is one click away.
 * Builders, portfolio margin and the wallet tracker live under /market/* for
 * URL history only; they belong to other families, so the bar stays off their pages.
 */
const NOT_MARKET = ["/market/builders", "/market/portfolio-margin", "/market/tracker"];

export function MarketScopeBar() {
  const pathname = usePathname();
  const { stats: spotStats } = useSpotGlobalStats();
  const { stats: perpStats } = usePerpGlobalStats();
  const { data: hip3 } = useHip3Overview();

  const items: ScopeItem[] = [
    { label: "Overview", href: "/market", exact: true },
    { label: "Spot", href: "/market/spot", count: spotStats?.totalPairs ?? null },
    { label: "Perps", href: "/market/perp", count: perpStats?.totalPairs ?? null },
    { label: "Perp DEXs", href: "/market/perpdex", count: hip3?.total_dexs ?? null },
    { label: "Outcomes", href: "/market/hip4" },
    { label: "Trades", href: "/market/trades" },
  ];

  const isActive = (item: ScopeItem): boolean => {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };

  if (NOT_MARKET.some((r) => pathname === r || pathname.startsWith(`${r}/`))) return null;

  return (
    <nav
      aria-label="Market sections"
      className="flex items-center gap-1 mb-5 -mt-1 overflow-x-auto scrollbar-brand"
    >
      <span className="hidden sm:inline text-[10px] uppercase tracking-[0.1em] text-text-tertiary mr-2 shrink-0">
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
