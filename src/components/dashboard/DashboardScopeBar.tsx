"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface ScopeItem {
  label: string;
  href: string;
  /** Exact match instead of prefix (the Overview tab). */
  exact?: boolean;
}

const SCOPES: ScopeItem[] = [
  { label: "Overview", href: "/dashboard", exact: true },
  { label: "Market", href: "/dashboard/market" },
  { label: "Capital", href: "/dashboard/capital" },
  { label: "Ecosystem", href: "/dashboard/ecosystem" },
];

/**
 * Persistent scope bar of the Dashboard, mirroring MarketScopeBar.
 *
 * The dashboard used to stack every module of the app in one 2800px scroll.
 * Each scope now owns its sections and only mounts its own hooks, so the
 * overview stays short and the page stops polling what nobody is looking at.
 *
 * No live counts here on purpose: the ones that would fit (vault count,
 * project count) each cost a heavy fetch on every dashboard page, which would
 * undo the very saving the split buys.
 */
export function DashboardScopeBar() {
  const pathname = usePathname();

  const isActive = (item: ScopeItem): boolean => {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };

  return (
    <nav
      aria-label="Dashboard sections"
      className="flex items-center gap-1 mb-5 -mt-1 overflow-x-auto scrollbar-brand"
    >
      <span className="text-[10px] uppercase tracking-[0.1em] text-text-tertiary mr-2 shrink-0">
        Dashboard
      </span>
      {SCOPES.map((item) => {
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
          </Link>
        );
      })}
    </nav>
  );
}
