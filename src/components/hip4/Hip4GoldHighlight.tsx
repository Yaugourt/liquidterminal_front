import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Inline gold highlight (GitBook-style mark). */
export function Hip4GoldHighlight({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <mark
      className={cn(
        "rounded px-1.5 py-0.5 font-medium not-italic",
        "bg-gold/15 text-gold ring-1 ring-gold/25",
        className
      )}
    >
      {children}
    </mark>
  );
}
