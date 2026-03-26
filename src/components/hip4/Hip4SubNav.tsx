"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HIP4_CHAPTERS,
  HIP4_NAV_SECTION_LABELS,
  HIP4_NAV_SECTIONS,
  type Hip4NavSection,
} from "@/lib/hip4-chapters";
import { cn } from "@/lib/utils";

export function Hip4SubNav() {
  const pathname = usePathname();
  const base = "/hip4";

  return (
    <nav
      className="mb-6 flex flex-col gap-3 rounded-lg bg-brand-dark p-2 sm:p-3"
      aria-label="HIP-4 documentation chapters"
    >
      {HIP4_NAV_SECTIONS.map((sectionId) => {
        const chapters = HIP4_CHAPTERS.filter((c) => c.section === sectionId);
        return (
          <div key={sectionId} className="flex flex-col gap-1.5">
            <div className="px-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
              {HIP4_NAV_SECTION_LABELS[sectionId as Hip4NavSection]}
            </div>
            <div className="flex flex-wrap gap-1">
              {chapters.map(({ slug, title }) => {
                const href = `${base}/${slug}`;
                const active = pathname === href;
                return (
                  <Link
                    key={slug}
                    href={href}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/40",
                      active
                        ? "bg-brand-accent text-brand-tertiary shadow-sm"
                        : "tab-inactive text-text-secondary hover:text-zinc-200"
                    )}
                  >
                    {title}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );
}
