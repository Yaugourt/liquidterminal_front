"use client";

import React, { useState } from "react";
import { TransactionType } from "@/services/explorer/types";

interface TransactionListProps {
  transactions: TransactionType[];
  isLoading: boolean;
  error: Error | null;
}

export function TransactionList({ transactions, isLoading, error }: TransactionListProps) {
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const rowsPerPageOptions = [10, 25, 50, 100];

  // Pagination logic
  const total = transactions?.length || 0;
  const from = total === 0 ? 0 : page * rowsPerPage + 1;
  const to = Math.min((page + 1) * rowsPerPage, total);
  const paginatedTxs = transactions?.slice(page * rowsPerPage, (page + 1) * rowsPerPage) || [];
  const pageCount = Math.ceil(total / rowsPerPage);

  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setPage(0);
  };

  const handleFirstPage = () => setPage(0);
  const handlePrevPage = () => setPage((p) => Math.max(0, p - 1));
  const handleNextPage = () => setPage((p) => Math.min(pageCount - 1, p + 1));
  const handleLastPage = () => setPage(pageCount - 1);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-[#0A1F32] border border-[#1E3851] rounded-xl">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#83E9FF]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-[#0A1F32] border border-[#1E3851] rounded-xl text-red-500">
        {error.message}
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-[#0A1F32] border border-[#1E3851] rounded-xl text-[#8B8B8B]">
        No transactions found
      </div>
    );
  }

  return (
    <div className="bg-[#0A1F32] h-[600px] border border-[#1E3851] rounded-xl p-4 flex flex-col">
      <table className="w-full">
        <thead>
          <tr className="text-[#8B8B8B] text-sm border-b border-[#1E3851]">
            <th className="text-left py-3 px-2 font-normal w-[180px]">Hash</th>
            <th className="text-left py-3 px-2 font-normal">Method</th>
            <th className="text-left py-3 px-2 font-normal">Age</th>
            <th className="text-left py-3 px-2 font-normal">From</th>
            <th className="text-left py-3 px-2 font-normal">To</th>
            <th className="text-right py-3 px-2 font-normal">Amount</th>
            <th className="text-left py-3 px-2 font-normal">Token</th>
            <th className="text-right py-3 px-2 font-normal">Price</th>
            <th className="text-right py-3 px-2 font-normal">Value</th>
          </tr>
        </thead>
        <tbody>
          {paginatedTxs.map((tx) => (
            <tr key={tx.hash} className="text-white border-b border-[#1E3851] text-sm">
              <td
                className="py-3 px-2 text-[#83E9FF] max-w-[160px] truncate cursor-pointer"
                title={tx.hash}
              >
                {tx.hash.length > 14
                  ? `${tx.hash.slice(0, 8)}...${tx.hash.slice(-6)}`
                  : tx.hash}
              </td>
              <td className="py-3 px-2">{tx.method}</td>
              <td className="py-3 px-2">{tx.age}</td>
              <td className="py-3 px-2">{tx.from}</td>
              <td
                className="py-3 px-2 text-[#83E9FF] max-w-[180px] truncate cursor-pointer"
                title={tx.to}
              >
                {tx.to && tx.to.length > 14
                  ? `${tx.to.slice(0, 8)}...${tx.to.slice(-6)}`
                  : tx.to}
              </td>
              <td className="py-3 px-2 text-right">
                {tx.amount && tx.amount !== '0' ? tx.amount : '-'}
              </td>
              <td className="py-3 px-2">
                {tx.token && tx.token !== 'unknown' ? tx.token : '-'}
              </td>
              <td className="py-3 px-2 text-right">{tx.price}</td>
              <td className="py-3 px-2 text-right">{tx.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Pagination bar */}
      <div className="flex items-center justify-between mt-auto pt-4 text-[#8B8B8B] text-sm">
        <div className="flex items-center gap-2">
          <span>Items per page:</span>
          <select
            className="bg-[#151e2c] border border-[#1E3851] rounded px-2 py-1 text-white"
            value={rowsPerPage}
            onChange={handleChangeRowsPerPage}
          >
            {rowsPerPageOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        <div>
          {from}-{to} of {total}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={handleFirstPage} disabled={page === 0} className="px-2 py-1 rounded disabled:opacity-30 hover:bg-[#1E3851]">
            &#171;
          </button>
          <button onClick={handlePrevPage} disabled={page === 0} className="px-2 py-1 rounded disabled:opacity-30 hover:bg-[#1E3851]">
            &#60;
          </button>
          <button onClick={handleNextPage} disabled={page >= pageCount - 1} className="px-2 py-1 rounded disabled:opacity-30 hover:bg-[#1E3851]">
            &#62;
          </button>
          <button onClick={handleLastPage} disabled={page >= pageCount - 1} className="px-2 py-1 rounded disabled:opacity-30 hover:bg-[#1E3851]">
            &#187;
          </button>
        </div>
      </div>
    </div>
  );
} 