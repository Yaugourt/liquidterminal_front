"use client";

import { memo, type ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SectionHeadProps {
  /** Section title (e.g. "Network Pulse"). */
  title: string;
  /** Optional subtitle, in tertiary text. */
  subtitle?: string;
  /** Optional right-aligned link label. */
  linkLabel?: string;
  /** Optional link href. */
  linkHref?: string;
  /**
   * Optional right-aligned actions node — an alternative to a plain link when a
   * section needs controls (filters, a period selector). Takes precedence over
   * the link when both are provided.
   */
  actions?: ReactNode;
  className?: string;
}

/**
 * SectionHead — the in-page section heading (title + subtitle baseline, with an
 * optional right-aligned link or actions). Shared from `common/` so pages
 * outside the dashboard use one head instead of re-declaring it.
 *
 * This is the dense section heading; it is distinct from `PageSection`, which
 * is the optional section container (semantics + vertical rhythm). A page may
 * use either, both, or neither.
 */
export const SectionHead = memo(function SectionHead({
  title,
  subtitle,
  linkLabel,
  linkHref,
  actions,
  className,
}: SectionHeadProps) {
  return (
    <div className={cn("flex items-baseline gap-3 mb-1", className)}>
      <h2 className="text-[14px] font-semibold text-text-primary">{title}</h2>
      {subtitle && (
        <span className="text-[11px] text-text-tertiary">{subtitle}</span>
      )}
      {actions ? (
        <div className="ml-auto shrink-0 flex items-center gap-2">{actions}</div>
      ) : linkLabel ? (
        linkHref ? (
          <Link
            href={linkHref}
            className="ml-auto text-[11px] text-text-secondary hover:text-brand transition-colors"
          >
            {linkLabel}
          </Link>
        ) : (
          <span className="ml-auto text-[11px] text-text-secondary hover:text-brand transition-colors">
            {linkLabel}
          </span>
        )
      ) : null}
    </div>
  );
});
