import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Hip4ChapterShell({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <div
      id={id}
      className={cn(
        "font-inter text-sm text-text-secondary leading-relaxed space-y-6",
        className
      )}
    >
      {children}
    </div>
  );
}

export function Hip4SectionTitle({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <h2
      id={id}
      className={cn(
        "text-xs font-bold uppercase tracking-wider text-text-secondary mb-3",
        className
      )}
    >
      {children}
    </h2>
  );
}

/** Short h3 inside a glass panel — breaks long panels into scannable chunks. */
export function Hip4SubsectionTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h3
      className={cn(
        "mb-2 text-[11px] font-semibold uppercase tracking-wide text-text-muted",
        className
      )}
    >
      {children}
    </h3>
  );
}

/** Lead paragraph: comfortable line length for body copy. */
export function Hip4DocLead({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "max-w-prose text-sm leading-relaxed text-text-secondary",
        className
      )}
    >
      {children}
    </p>
  );
}

/** Bulleted list with gold markers — use for “what’s on this page” style copy. */
export function Hip4DocList({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <ul
      className={cn(
        "list-disc space-y-2.5 pl-4 text-xs leading-relaxed text-text-secondary marker:text-brand-gold/75",
        className
      )}
    >
      {children}
    </ul>
  );
}

export function Hip4GlassPanel({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  /** Anchor for in-page TOC / deep links */
  id?: string;
}) {
  return (
    <div
      id={id}
      className={cn(
        "rounded-lg border border-border-subtle bg-brand-secondary/40 p-5 sm:p-6 scroll-mt-28",
        className
      )}
    >
      {children}
    </div>
  );
}
