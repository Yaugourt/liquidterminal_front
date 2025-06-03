import React from "react";

export interface PaginationProps {
  total: number;
  page: number;
  rowsPerPage: number;
  rowsPerPageOptions?: number[];
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newRowsPerPage: number) => void;
  className?: string;
}

export function Pagination({
  total,
  page,
  rowsPerPage,
  rowsPerPageOptions = [10, 25, 50, 100],
  onPageChange,
  onRowsPerPageChange,
  className = "",
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

  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onRowsPerPageChange(Number(e.target.value));
  };

  return (
    <div className={`flex items-center justify-between text-[#8B8B8B] text-sm ${className}`}>
      <div className="flex items-center gap-2">
        <span className="text-white">Items per page:</span>
        <select
          className="bg-[#151e2c] border border-[#1E3851] rounded px-2 py-1 text-white hover:border-[#f9e370] focus:border-[#f9e370] focus:outline-none transition-colors"
          value={rowsPerPage}
          onChange={handleChangeRowsPerPage}
        >
          {rowsPerPageOptions.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
      
      <div className="text-white">
        {from}-{to} of {total}
      </div>
      
      <div className="flex items-center gap-1">
        <button 
          onClick={handleFirstPage} 
          disabled={page === 0} 
          className="px-2 py-1 rounded text-[#f9e370] disabled:opacity-30 hover:bg-[#f9e370]/10 transition-colors disabled:text-[#8B8B8B]"
        >
          &#171;
        </button>
        <button 
          onClick={handlePrevPage} 
          disabled={page === 0} 
          className="px-2 py-1 rounded text-[#f9e370] disabled:opacity-30 hover:bg-[#f9e370]/10 transition-colors disabled:text-[#8B8B8B]"
        >
          &#60;
        </button>
        <button 
          onClick={handleNextPage} 
          disabled={page >= pageCount - 1} 
          className="px-2 py-1 rounded text-[#f9e370] disabled:opacity-30 hover:bg-[#f9e370]/10 transition-colors disabled:text-[#8B8B8B]"
        >
          &#62;
        </button>
        <button 
          onClick={handleLastPage} 
          disabled={page >= pageCount - 1} 
          className="px-2 py-1 rounded text-[#f9e370] disabled:opacity-30 hover:bg-[#f9e370]/10 transition-colors disabled:text-[#8B8B8B]"
        >
          &#187;
        </button>
      </div>
    </div>
  );
} 