"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getHip4Chapter } from "@/lib/hip4-chapters";
import { cn } from "@/lib/utils";

export function Hip4Breadcrumbs({ className }: { className?: string }) {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean);
  const slug = parts[0] === "hip4" && parts[1] ? parts[1] : "home";
  const chapter = getHip4Chapter(slug);
  const title = chapter?.title ?? slug;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("mb-5 flex flex-wrap items-center gap-1 text-[11px] text-text-muted", className)}
    >
      <Link href="/wiki" className="text-text-secondary hover:text-brand-accent">
        Wiki
      </Link>
      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-text-muted" aria-hidden />
      <Link href="/hip4/home" className="text-text-secondary hover:text-brand-accent">
        HIP-4
      </Link>
      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-text-muted" aria-hidden />
      <span className="font-medium text-white" aria-current="page">
        {title}
      </span>
    </nav>
  );
}
