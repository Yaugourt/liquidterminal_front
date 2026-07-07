"use client";

import { Fragment } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface Crumb {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: Crumb[];
  className?: string;
}

/**
 * Wiki breadcrumb spine. Linked segments are tertiary and brighten on hover;
 * the last (current) segment is plain primary text with no link.
 */
export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center gap-1.5 text-[12px]", className)}>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <Fragment key={`${item.label}-${i}`}>
            {i > 0 && <span className="text-text-tertiary/60">/</span>}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-text-tertiary transition-colors hover:text-text-primary"
              >
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "text-text-primary" : "text-text-tertiary"}>{item.label}</span>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
