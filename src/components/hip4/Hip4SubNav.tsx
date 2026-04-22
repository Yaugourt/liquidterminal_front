"use client";

import type * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import {
  HIP4_CHAPTERS,
  HIP4_NAV_SECTION_LABELS,
  HIP4_NAV_SECTIONS,
  getHip4SectionForSlug,
  type Hip4NavSection,
} from "@/lib/hip4-chapters";
import { cn } from "@/lib/utils";

function NavLink({
  href,
  active,
  children,
  className,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-md px-3 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/40",
        active
          ? "bg-brand-accent text-brand-tertiary shadow-sm"
          : "border border-transparent text-text-secondary hover:border-border-subtle hover:bg-white/[0.04] hover:text-white",
        className
      )}
    >
      {children}
    </Link>
  );
}

function SectionLinks({
  sectionId,
  base,
  pathname,
  layout,
}: {
  sectionId: Hip4NavSection;
  base: string;
  pathname: string;
  layout: "horizontal" | "vertical";
}) {
  const chapters = HIP4_CHAPTERS.filter((c) => c.section === sectionId);
  return (
    <div
      className={cn(
        layout === "vertical" ? "flex flex-col gap-1" : "flex flex-wrap gap-1"
      )}
    >
      {chapters.map(({ slug, title }) => {
        const href = `${base}/${slug}`;
        const active = pathname === href;
        return (
          <NavLink
            key={slug}
            href={href}
            active={active}
            className={layout === "vertical" ? "w-full text-left" : undefined}
          >
            {title}
          </NavLink>
        );
      })}
    </div>
  );
}

export function Hip4SubNav() {
  const pathname = usePathname();
  const base = "/hip4";
  const slug = pathname.startsWith(`${base}/`)
    ? pathname.slice(base.length + 1).split("/")[0] ?? "home"
    : "home";
  const activeSection = getHip4SectionForSlug(slug);

  return (
    <nav aria-label="HIP-4 documentation chapters">
      {/* Mobile / tablet: accordion by section */}
      <div className="space-y-2 lg:hidden">
        {HIP4_NAV_SECTIONS.map((sectionId) => {
          const openDefault = activeSection === sectionId;
          return (
            <details
              key={`${sectionId}-${slug}`}
              className="group rounded-lg border border-border-subtle bg-brand-dark/80"
              {...({ defaultOpen: openDefault } as React.HTMLAttributes<HTMLDetailsElement>)}
            >
              <summary
                className={cn(
                  "flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2.5",
                  "text-[10px] font-semibold uppercase tracking-wider text-brand-gold/85",
                  "[&::-webkit-details-marker]:hidden"
                )}
              >
                {HIP4_NAV_SECTION_LABELS[sectionId as Hip4NavSection]}
                <ChevronDown className="h-4 w-4 shrink-0 text-brand-gold/70 transition-transform group-open:rotate-180" />
              </summary>
              <div className="border-t border-border-subtle px-2 py-2">
                <SectionLinks
                  sectionId={sectionId as Hip4NavSection}
                  base={base}
                  pathname={pathname}
                  layout="vertical"
                />
              </div>
            </details>
          );
        })}
      </div>

      {/* Desktop: sticky sidebar column — vertical stacks */}
      <div className="hidden lg:flex lg:flex-col lg:gap-6">
        {HIP4_NAV_SECTIONS.map((sectionId) => (
          <div key={sectionId}>
            <div className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-wider text-brand-gold/85">
              {HIP4_NAV_SECTION_LABELS[sectionId as Hip4NavSection]}
            </div>
            <SectionLinks
              sectionId={sectionId as Hip4NavSection}
              base={base}
              pathname={pathname}
              layout="vertical"
            />
          </div>
        ))}
      </div>
    </nav>
  );
}
