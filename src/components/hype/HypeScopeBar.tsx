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
  { label: "Overview", href: "/hype", exact: true },
  { label: "Financials", href: "/hype/financials" },
];

/**
 * Persistent scope bar of the HYPE page, mirroring DashboardScopeBar.
 *
 * The token page was one long scroll mixing the live quote with supply
 * mechanics and revenue. Splitting it lets each scope read as a chapter and
 * mount only its own hooks — and it makes room for the analysis the overview
 * could never hold without burying the price.
 *
 * Chapters are added here as they ship. An entry that leads to a page with
 * nothing in it costs more than the missing tab.
 */
export function HypeScopeBar() {
  const pathname = usePathname();

  const isActive = (item: ScopeItem): boolean => {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };

  return (
    <nav
      aria-label="HYPE sections"
      className="flex items-center gap-1 mb-5 -mt-1 overflow-x-auto scrollbar-brand"
    >
      <span className="text-[10px] uppercase tracking-[0.1em] text-text-tertiary mr-2 shrink-0">
        HYPE
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
