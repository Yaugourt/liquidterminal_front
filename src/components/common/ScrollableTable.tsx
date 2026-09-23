import * as React from "react";
import { cn } from "@/lib/utils";
import { Pagination, PaginationProps } from "./pagination";

interface ScrollableTableProps {
  children: React.ReactNode;
  className?: string;
  pagination?: PaginationProps;
}

/**
 * ScrollableTable - Wrapper pour tables avec scroll horizontal et pagination optionnelle
 * 
 * Encapsule le pattern répété :
 * - Container flex-col pour structure verticale
 * - Scroll container avec scrollbar stylée
 * - Pagination avec border-top
 */
export function ScrollableTable({
  children,
  className,
  pagination,
}: ScrollableTableProps) {
  return (
    <div className={cn("flex flex-col h-full min-h-0", className)}>
      {/* min-h-0: inside a height-capped parent the body scrolls instead of
          pushing the pagination footer out of the card. */}
      <div className="overflow-x-auto scrollbar-brand flex-1 min-h-0">
        {children}
      </div>
      {pagination && (
        <div className="border-t border-border-subtle px-4 py-2.5">
          <Pagination {...pagination} />
        </div>
      )}
    </div>
  );
}
