"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface InlineSpinnerProps {
  className?: string;
}

/**
 * Tiny inline spinner — for use inside buttons, badges, table cells, or alongside other content.
 * For full block-level loading states, use <LoadingState> from "@/components/ui/loading-state".
 */
export function InlineSpinner({ className }: InlineSpinnerProps) {
  return <Loader2 className={cn("h-4 w-4 animate-spin", className)} />;
}
