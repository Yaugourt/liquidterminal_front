"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { TokenAvatar } from "@/components/common";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebarBadges } from "@/hooks/useSidebarBadges";
import { HL_SECTIONS, sectionForPath, type NavSection } from "@/lib/sidebar-config";
import { cn } from "@/lib/utils";

function SectionIcon({ section, className }: { section: NavSection; className?: string }) {
  if (section.tokenIcon) return <TokenAvatar assetName={section.tokenIcon} size="xs" className="rounded-full" />;
  const Icon = section.IconComponent;
  return Icon ? <Icon className={cn("h-4 w-4 shrink-0", className)} /> : null;
}

/**
 * In-page navigation of a Hyperliquid section, mounted once in the sticky
 * header: a section switcher, then one tab per page of the section, with the
 * live counts the sidebar used to carry. Renders nothing outside a section
 * (tool pages, Elysium, profile).
 *
 * Replaces the per-section scope bars (Dashboard, HYPE, Market), which each
 * kept their own copy of the tab list and drifted from the sidebar.
 */
export function SectionNav() {
  const pathname = usePathname();
  const hit = sectionForPath(pathname);
  // Same hooks as the sidebar: useDataFetching's cache shares the requests.
  const badges = useSidebarBadges();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLAnchorElement>(null);

  // On a phone the tabs scroll sideways: bring the current one into view.
  useEffect(() => {
    const scroller = scrollerRef.current;
    const active = activeRef.current;
    if (!scroller || !active) return;
    scroller.scrollLeft = active.offsetLeft - scroller.clientWidth / 2 + active.clientWidth / 2;
  }, [pathname]);

  if (!hit) return null;
  const { section, tab: activeTab } = hit;

  return (
    <nav aria-label={`${section.name} pages`} className="mx-auto w-full max-w-[1600px] px-4 sm:px-6">
      <div className="flex items-end gap-1 border-b border-border-subtle">
        <DropdownMenu>
          <DropdownMenuTrigger
            className="focus-ring mb-1.5 flex shrink-0 items-center gap-2 rounded-md px-2 py-1.5 text-[13px] font-semibold text-text-primary transition-colors hover:bg-surface-2"
            aria-label={`${section.name}, switch section`}
          >
            <SectionIcon section={section} className="text-brand" />
            <span className="max-sm:hidden">{section.name}</span>
            <ChevronDown className="h-3.5 w-3.5 text-text-tertiary" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[240px]">
            {HL_SECTIONS.map((s) => (
              <DropdownMenuItem key={s.id} asChild>
                <Link href={s.href} className={cn("flex items-center gap-2.5", s.id === section.id && "text-brand")}>
                  <SectionIcon section={s} className={s.id === section.id ? "text-brand" : "text-text-secondary"} />
                  <span className="flex min-w-0 flex-col">
                    <span className="text-[13px] font-medium">{s.name}</span>
                    {s.hint && <span className="truncate text-[11px] text-text-tertiary">{s.hint}</span>}
                  </span>
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <span aria-hidden className="mx-1 mb-3 h-4 w-px shrink-0 bg-border-subtle" />

        <div ref={scrollerRef} className="flex min-w-0 items-end overflow-x-auto scrollbar-hide">
          {section.tabs.map((tab) => {
            const active = tab.href === activeTab.href;
            const badge = badges[tab.href];
            // Counts only: the HYPE row's price badge is not a page count.
            const count = badge && badge.tone === "muted" ? badge.text : null;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                ref={active ? activeRef : undefined}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "focus-ring relative flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-t-md px-2.5 pb-2.5 pt-2 text-[13px] transition-colors",
                  active ? "font-medium text-text-primary" : "text-text-secondary hover:text-text-primary"
                )}
              >
                {tab.label}
                {count ? (
                  <span className={cn("mono text-[10.5px]", active ? "text-brand" : "text-text-tertiary")}>{count}</span>
                ) : tab.tag ? (
                  <span className="mono text-[9.5px] text-text-tertiary">{tab.tag}</span>
                ) : null}
                {active && <span aria-hidden className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand" />}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
