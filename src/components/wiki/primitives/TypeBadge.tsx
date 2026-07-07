"use client";

import { cn } from "@/lib/utils";
import { CONTENT_TYPE_META, detectContentType, type ContentType } from "./contentType";

interface TypeBadgeProps {
  /** Explicit type, or derive it from `url`. */
  type?: ContentType;
  url?: string;
  /** "chip": bordered icon+label. "icon": icon only (dense table cells). */
  variant?: "chip" | "icon";
  className?: string;
}

/**
 * Monochrome content-type badge (article, X thread, video, podcast, official
 * doc). Never colored: gold stays reserved for the saves signal. Replaces the
 * 64px monogram tile across every article surface.
 */
export function TypeBadge({ type, url, variant = "chip", className }: TypeBadgeProps) {
  const resolved = type ?? (url ? detectContentType(url) : "article");
  const meta = CONTENT_TYPE_META[resolved];
  const Icon = meta.icon;

  if (variant === "icon") {
    return (
      <span className={cn("inline-flex items-center text-text-tertiary", className)} title={meta.label}>
        <Icon className="h-3.5 w-3.5" />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded border border-border-subtle bg-surface-2 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-text-secondary",
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {meta.label}
    </span>
  );
}
