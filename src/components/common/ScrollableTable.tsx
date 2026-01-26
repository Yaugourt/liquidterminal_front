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
    <div className={cn("flex flex-col h-full", className)}>
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent flex-1">
        {children}
      </div>
      {pagination && (
        <div className="border-t border-border-subtle px-4 py-3">
          <Pagination {...pagination} />
        </div>
      )}
    </div>
  );
}
