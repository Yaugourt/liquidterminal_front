import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PaginationProps } from "@/components/types/explorer.types";

export function Pagination({ currentPage, totalItems, itemsPerPage, onPageChange }: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between py-4 px-2">
      <Button
        variant="link"
        className="text-[#83E9FF] hover:text-white hover:no-underline"
      >
        View All
      </Button>

      <div className="flex items-center gap-4">
        <span className="text-sm text-[#FFFFFF99]">
          {startItem}-{endItem} of {totalItems}
        </span>
        
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-8 w-8 text-[#FFFFFF99] hover:text-white hover:bg-[#FFFFFF0A]"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="h-8 w-8 text-[#FFFFFF99] hover:text-white hover:bg-[#FFFFFF0A]"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 