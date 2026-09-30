import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * List body for the shorter card of a grid row. From `lg` up, the list is
 * taken out of the flow and fills whatever height the row gets from its
 * tallest neighbour, so the short card shows more real rows instead of a
 * blank band under its content (the "dead space" pattern). The grid must let
 * items stretch (no `items-start`) and the card must be `flex flex-col`.
 * Below `lg` cards stack, so the list scrolls inside `mobileHeight`.
 * Feed it more rows than fit: the extra ones hide under the bottom fade.
 */
export function RowFillList({
  children,
  minHeight = "lg:min-h-[240px]",
  mobileHeight = "h-[300px]",
  className,
}: {
  children: ReactNode;
  /** Floor for the filled height when the neighbour is short. */
  minHeight?: string;
  /** Scroll height when cards stack below `lg`. */
  mobileHeight?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative flex-1 lg:h-auto", mobileHeight, minHeight)}>
      <div className={cn("absolute inset-0 overflow-y-auto scrollbar-brand fade-bottom", className)}>{children}</div>
    </div>
  );
}
