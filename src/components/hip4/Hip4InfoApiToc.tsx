"use client";

import Link from "next/link";
import { HIP4_INFO_API_TOC_ITEMS } from "@/lib/hip4/api-info-spec";

export function Hip4InfoApiToc({ variant }: { variant: "inline" | "sidebar" }) {
  if (variant === "inline") {
    return (
      <div className="rounded-lg border border-border-subtle bg-brand-secondary/30 p-3 xl:hidden">
        <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-brand-gold/90">
          On this page
        </div>
        <div className="flex flex-wrap gap-2">
          {HIP4_INFO_API_TOC_ITEMS.map((item) => (
            <Link
              key={item.id}
              href={`#${item.id}`}
              className="rounded-md border border-border-subtle bg-brand-primary/40 px-2 py-1 text-[11px] text-text-secondary transition-colors hover:border-border-hover hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/40"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <nav
      aria-label="On this page"
      className="sticky top-28 hidden max-h-[calc(100vh-8rem)] overflow-y-auto pr-1 xl:block"
    >
      <div className="mb-3 text-[10px] font-bold uppercase tracking-wider text-brand-gold/90">
        On this page
      </div>
      <ul className="space-y-1 border-l border-border-subtle pl-3 text-[11px]">
        {HIP4_INFO_API_TOC_ITEMS.map((item) => (
          <li key={item.id}>
            <Link
              href={`#${item.id}`}
              className="block py-0.5 text-text-secondary transition-colors hover:text-brand-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-primary"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
