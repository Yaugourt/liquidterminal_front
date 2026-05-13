"use client";

import { type ReactNode } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TooltipIconProps {
  /** Content shown inside the tooltip popup. */
  children: ReactNode;
  /** Custom trigger icon. Defaults to lucide `Info`. */
  icon?: ReactNode;
  /** Optional class on the trigger element (positioning, spacing). */
  className?: string;
  /** Tooltip placement. Defaults to "top". */
  side?: "top" | "right" | "bottom" | "left";
  /** Custom class on the tooltip content (e.g. `max-w-xs`). */
  contentClassName?: string;
  /** Delay before showing on hover (ms). Defaults to 200. */
  delayDuration?: number;
}

/**
 * Compact info-icon tooltip. Wraps the shadcn `<Tooltip>` primitive with a
 * sensible default trigger (lucide `Info` 14×14, muted color) and a styled
 * `TooltipContent`.
 *
 * Replaces 12–15 inline copies of the same `<Tooltip><TooltipTrigger><Info /></TooltipTrigger>...`
 * pattern. For non-icon triggers (e.g. tooltip over a number cell), use the
 * shadcn primitive directly.
 */
export function TooltipIcon({
  children,
  icon,
  className,
  side = "top",
  contentClassName,
  delayDuration = 200,
}: TooltipIconProps) {
  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "inline-flex cursor-help text-text-muted hover:text-text-secondary transition-colors",
              className
            )}
          >
            {icon ?? <Info className="h-3.5 w-3.5" />}
          </span>
        </TooltipTrigger>
        <TooltipContent
          side={side}
          className={cn(
            "max-w-xs border-border-subtle bg-brand-secondary text-text-secondary text-xs",
            contentClassName
          )}
        >
          {children}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
