import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

export interface PaginationProps {
  total: number;
  page: number;
  rowsPerPage: number;
  rowsPerPageOptions?: number[];
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newRowsPerPage: number) => void;
  className?: string;
  disabled?: boolean;
  hidePageNavigation?: boolean;
}

export function Pagination({
  total,
  page,
  rowsPerPage,
  rowsPerPageOptions = [10, 25, 50, 100],
  onPageChange,
  onRowsPerPageChange,
  className = "",
  disabled = false,
  hidePageNavigation = false,
}: PaginationProps) {
  // Pagination calculations
  const from = total === 0 ? 0 : page * rowsPerPage + 1;
  const to = Math.min((page + 1) * rowsPerPage, total);
  const pageCount = Math.ceil(total / rowsPerPage);

  // Page navigation handlers
  const handleFirstPage = () => onPageChange(0);
  const handlePrevPage = () => onPageChange(Math.max(0, page - 1));
  const handleNextPage = () => onPageChange(Math.min(pageCount - 1, page + 1));
  const handleLastPage = () => onPageChange(pageCount - 1);

  const handleChangeRowsPerPage = (value: string) => {
    onRowsPerPageChange(Number(value));
  };

  return (
    <div className={`flex items-center justify-between text-zinc-400 text-sm ${className}`}>
      <div className="flex items-center gap-2">
        <span className="text-white hidden sm:inline">Items per page:</span>
        <Select
          value={rowsPerPage.toString()}
          onValueChange={handleChangeRowsPerPage}
          disabled={disabled}
        >
          <SelectTrigger className="h-8 w-[70px] bg-brand-secondary border-white/10 text-white hover:bg-brand-secondary/80 focus:ring-brand-accent">
            <SelectValue placeholder={rowsPerPage} />
          </SelectTrigger>
          <SelectContent className="bg-brand-secondary border-white/10 text-white">
            {rowsPerPageOptions.map((opt) => (
              <SelectItem key={opt} value={opt.toString()} className="focus:bg-white/10 focus:text-brand-accent">
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="text-white font-medium">
        {from}-{to} <span className="text-zinc-500">of</span> {total}
      </div>

      {!hidePageNavigation && (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFirstPage}
            disabled={page === 0 || disabled}
            className="h-8 w-8 text-brand-accent hover:bg-brand-accent/10 hover:text-brand-accent disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevPage}
            disabled={page === 0 || disabled}
            className="h-8 w-8 text-brand-accent hover:bg-brand-accent/10 hover:text-brand-accent disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextPage}
            disabled={page >= pageCount - 1 || disabled}
            className="h-8 w-8 text-brand-accent hover:bg-brand-accent/10 hover:text-brand-accent disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLastPage}
            disabled={page >= pageCount - 1 || disabled}
            className="h-8 w-8 text-brand-accent hover:bg-brand-accent/10 hover:text-brand-accent disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
} 