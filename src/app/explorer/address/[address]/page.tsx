"use client";

import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { useTransactions } from "@/services/explorer/hooks/useUserTransactions";
import { usePortfolio } from '@/services/explorer/hooks/usePortfolio';
import React, { useState } from "react";
import { PortfolioPeriodData } from '@/services/explorer/types';
import {  Header } from "@/components/Header";

export default function AddressPage() {
  const params = useParams();
  const address = params.address as string;
  const { transactions, isLoading, error } = useTransactions(address);
  const { data: portfolio, isLoading: loadingPortfolio } = usePortfolio(address);

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

  const [pnlMode, setPnlMode] = useState<'percent' | 'dollar'>('percent');

  function getVariation(history: [number, string][] | undefined, periodKey?: string): string | null {
    if (!history || history.length < 2) return null;
    const first = parseFloat(history[0][1]);
    const last = parseFloat(history[history.length - 1][1]);
    if (periodKey === 'allTime' && first < 10) return null;
    if (periodKey !== 'allTime' && first < 1) return null;
    if (pnlMode === 'percent') {
      return (((last - first) / first) * 100).toFixed(2) + '%';
    } else {
      const diff = last - first;
      return (diff > 0 ? '+' : '') + diff.toFixed(2) + ' $';
    }
  }

  const periods = [
    { key: 'allTime', label: 'All Time' },
    { key: 'day', label: '24H' },
    { key: 'week', label: '7D' },
    { key: 'month', label: '30D' },
  ];

  return (
    <div className="min-h-screen ">
      < Header customTitle="Explorer" />
      
      <div className="p-6">
        {/* En-tête de l'adresse */}
        <div className="mb-6">
          <span className="text-[#8B8B8B] text-sm block mb-2">Address</span>
          <div className="flex items-center gap-3">
            <code className="text-[#83E9FF] text-2xl font-medium">{address}</code>
            <button className="p-2 hover:bg-[#1E3851] rounded-lg transition-all">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 9H11C9.89543 9 9 9.89543 9 11V20C9 21.1046 9.89543 22 11 22H20C21.1046 22 22 21.1046 22 20V11C22 9.89543 21.1046 9 20 9Z" stroke="#83E9FF" strokeWidth="2"/>
                <path d="M5 15H4C3.46957 15 2.96086 14.7893 2.58579 14.4142C2.21071 14.0391 2 13.5304 2 13V4C2 3.46957 2.21071 2.96086 2.58579 2.58579C2.96086 2.21071 3.46957 2 4 2H13C13.5304 2 14.0391 2.21071 14.4142 2.58579C14.7893 2.96086 15 3.46957 15 4V5" stroke="#83E9FF" strokeWidth="2"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {/* Overview Card */}
          <Card className="bg-[#0A1F32] border border-[#1E3851] p-6 rounded-xl">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-white text-[18px] font-bold">Overview</h3>
              <span className="text-[#83E9FF] text-[18px] font-bold">58,721.70$</span>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <div className="text-[rgba(255,255,255,0.8)] text-[16px] mb-1">Spot:</div>
                <div className="text-white text-[16px]">Loading...</div>
              </div>
              <div>
                <div className="text-[rgba(255,255,255,0.8)] text-[16px] mb-1">Vault:</div>
                <div className="text-white text-[16px]">Loading...</div>
              </div>
              <div>
                <div className="text-[rgba(255,255,255,0.8)] text-[16px] mb-1">Perps:</div>
                <div className="text-white text-[16px]">Loading...</div>
              </div>
              <div>
                <div className="text-[rgba(255,255,255,0.8)] text-[16px] mb-1">Staked:</div>
                <div className="text-white text-[16px]">Loading...</div>
              </div>
            </div>
          </Card>

          {/* PnL Card */}
          <Card className="bg-[#0A1F32] border border-[#1E3851] p-6 rounded-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white text-[18px] font-bold">PnL</h3>
              <select
                className="bg-[#051728] text-[#83E9FF] border border-[#1E3851] rounded px-3 py-1.5 text-[16px] focus:outline-none focus:border-[#83E9FF]"
                value={pnlMode}
                onChange={e => setPnlMode(e.target.value as 'percent' | 'dollar')}
              >
                <option value="percent">%</option>
                <option value="dollar">$</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              {loadingPortfolio ? (
                <div className="col-span-2 text-[#83E9FF]">Chargement...</div>
              ) : (
                periods.map(({ key, label }) => {
                  const periodData = portfolio?.find?.((entry: [string, PortfolioPeriodData]) => entry[0] === key)?.[1];
                  const value = getVariation(periodData?.accountValueHistory, key);
                  let valueNum: number | null = null;
                  if (value && pnlMode === 'percent') valueNum = Number(value.replace('%', ''));
                  if (value && pnlMode === 'dollar') valueNum = Number(value.replace('$', ''));
                  return (
                    <div key={key}>
                      <div className="text-[rgba(255,255,255,0.8)] text-[16px] mb-1">{label}:</div>
                      <div className={valueNum !== null && valueNum > 0 ? "text-[#4ADE80] text-[16px]" : valueNum !== null && valueNum < 0 ? "text-[#FF5757] text-[16px]" : "text-white text-[16px]"}>
                        {value !== null ? value : '-'}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>

          {/* More Info Card */}
          <Card className="bg-[#0A1F32] border border-[#1E3851] p-6 rounded-xl">
            <h3 className="text-white text-[18px] font-bold mb-6">More Info</h3>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white text-[16px]">Private name tags</span>
                  <button className="bg-[#F3DC4D] text-black px-3 py-1 rounded text-[14px] font-medium hover:bg-opacity-90 transition-colors">+ Add</button>
                </div>
              </div>
              <div>
                <div className="text-white text-[16px] mb-2">Transactions sent</div>
                <div className="flex gap-6">
                  <div>
                    <span className="text-[rgba(255,255,255,0.8)] text-[16px]">Latest:</span>
                    <span className="text-[#83E9FF] ml-2 text-[16px]">Loading...</span>
                  </div>
                  <div>
                    <span className="text-[rgba(255,255,255,0.8)] text-[16px]">First:</span>
                    <span className="text-[#83E9FF] ml-2 text-[16px]">Loading...</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs et Table */}
        <div>
          <div className="flex gap-2 mb-4">
            <button className="bg-[#051728] text-white px-4 py-2 rounded-lg">
              Transactions
            </button>
            <button className="bg-[#1B9AAA] text-white px-4 py-2 rounded-lg hover:bg-[#051728] transition-colors">
              Holdings
            </button>
            <button className="bg-[#1B9AAA] text-white px-4 py-2 rounded-lg hover:bg-[#051728] transition-colors">
              Perps
            </button>
            <button className="bg-[#1B9AAA] text-white px-4 py-2 rounded-lg hover:bg-[#051728] transition-colors">
              Orders
            </button>
            <button className="bg-[#1B9AAA] text-white px-4 py-2 rounded-lg hover:bg-[#051728] transition-colors">
              Vaults
            </button>
            <button className="bg-[#1B9AAA] text-white px-4 py-2 rounded-lg hover:bg-[#051728] transition-colors">
              Staking
            </button>
          </div>
    
          <div className="bg-[#0A1F32] h-[600px] border border-[#1E3851] rounded-xl p-4 flex flex-col">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#83E9FF]"></div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full text-red-500">
                {error.message}
              </div>
            ) : transactions && transactions.length > 0 ? (
              <>
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
                <div className="flex items-center justify-between mt-4 text-[#8B8B8B] text-sm">
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
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-[#8B8B8B]">
                No transactions found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 