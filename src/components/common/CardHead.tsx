"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface CardHeadProps {
  /** Card title — 13px, medium weight. */
  title: ReactNode;
  /** One-line helper next to the title (tertiary, truncates). */
  subtitle?: ReactNode;
  /** Short plain figure (count, total…) pinned right, before `actions`. */
  tag?: ReactNode;
  /** Right-aligned slot: `SourceBadge`, `DataStatus`, selects, buttons. */
  actions?: ReactNode;
  /**
   * Target of the trailing "View all →" link. Omit to hide the link. An
   * absolute URL (`https://…`, docs) opens in a new tab.
   */
  href?: string;
  /** Label of the trailing link. Defaults to "View all". */
  viewAllLabel?: string;
  className?: string;
}

/**
 * CardHead — the minimal card header (DS_MINIMAL_SPEC §A3, kit.html
 * "OverviewModule" block): title + optional helper, tag and right-hand
 * actions, over a hairline. No brand icon square, no pill chrome.
 *
 * Single source for every table card head: `TypedDataTable` (card mode) and
 * `OverviewModule` both render it, so a page's tables share one header look.
 */
export function CardHead({
  title,
  subtitle,
  tag,
  actions,
  href,
  viewAllLabel = "View all",
  className,
}: CardHeadProps) {
  return (
    <div
      className={cn(
        // flex-wrap: on a narrow card the actions drop to a second line
        // instead of squeezing the title into an ellipsis.
        "flex flex-wrap items-center gap-x-2 gap-y-1.5 px-4 py-3 min-h-[44px] border-b border-border-subtle",
        className
      )}
    >
      <h3 className="text-[13px] font-medium text-text-primary truncate">{title}</h3>
      {subtitle != null && (
        <span className="min-w-0 truncate text-[11px] text-text-tertiary">{subtitle}</span>
      )}
      {(tag != null || actions || href) && (
        // Right group wraps on its own (flex-wrap + justify-end) so a long
        // tag + source + link set never pushes the card wider than its column.
        <div className="ml-auto flex min-w-0 max-w-full flex-wrap items-center justify-end gap-x-2 gap-y-1">
          {tag != null && <span className="text-[11px] text-text-tertiary">{tag}</span>}
          {actions}
          {href &&
            (/^https?:\/\//.test(href) ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-text-tertiary hover:text-text-primary transition-colors"
              >
                {viewAllLabel} →
              </a>
            ) : (
              <Link
                href={href}
                className="text-[11px] text-text-tertiary hover:text-text-primary transition-colors"
              >
                {viewAllLabel} →
              </Link>
            ))}
        </div>
      )}
    </div>
  );
}
