"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HIP4_CHAPTERS } from "@/lib/hip4-chapters";
import { cn } from "@/lib/utils";

export function Hip4SubNav() {
  const pathname = usePathname();
  const base = "/hip4";

  return (
    <nav
      className="flex flex-wrap gap-1.5 border-b border-border-subtle pb-4 mb-6"
      aria-label="HIP-4 documentation chapters"
    >
      {HIP4_CHAPTERS.map(({ slug, title }) => {
        const href = `${base}/${slug}`;
        const active = pathname === href;
        return (
          <Link
            key={slug}
            href={href}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              active
                ? "bg-brand-accent/15 text-brand-accent border border-brand-accent/25"
                : "bg-brand-secondary/40 text-text-secondary border border-border-subtle hover:border-border-hover hover:text-zinc-200"
            )}
          >
            {title}
          </Link>
        );
      })}
    </nav>
  );
}
