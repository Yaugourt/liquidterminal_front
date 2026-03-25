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
      className="mb-6 rounded-lg bg-brand-dark p-1 flex flex-wrap gap-1"
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
    </nav>
  );
}
