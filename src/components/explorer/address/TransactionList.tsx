"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Copy } from "lucide-react";
import { useNumberFormat } from '@/store/number-format.store';
import { formatNumber } from '@/lib/formatting';
import { Pagination } from '@/components/common';
import { TransactionListProps } from "@/components/types/explorer.types";

export function TransactionList({ transactions, isLoading, error, currentAddress }: TransactionListProps) {
  const { format } = useNumberFormat();
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Pagination logic
  const total = transactions?.length || 0;
  const paginatedTxs = transactions?.slice(page * rowsPerPage, (page + 1) * rowsPerPage) || [];

  const HIP2_ADDRESS = "0xffffffffffffffffffffffffffffffffffffffff";

  const formatAddress = (address: string) => {
    if (!address) return '-';
    if (address === HIP2_ADDRESS) return 'HIP2';
    return address.length > 14 ? `${address.slice(0, 8)}...${address.slice(-6)}` : address;
  };

  const formatNumberValue = (value: string | number | null | undefined) => {
    if (!value) return '-';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '-';
    return formatNumber(num, format);
  };

  const calculateValue = (amount: string | undefined, price: string | undefined) => {
    if (!amount || !price) return '-';
    const amountNum = parseFloat(amount);
    const priceNum = parseFloat(price);
    if (isNaN(amountNum) || isNaN(priceNum)) return '-';
    return formatNumber(amountNum * priceNum, format, {
      currency: '$',
      showCurrency: true
    });
  };

  // Fonction pour copier l'adresse
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const renderAddressCell = (address: string) => {
    if (!address) {
      return (
        <td className="py-3 px-2 w-[180px]">
          <span className="text-white">-</span>
        </td>
      );
    }

    if (address === "Arbitrum") {
      return (
        <td className="py-3 px-2 w-[180px]">
          <Link 
            href={`https://arbiscan.io/address/${currentAddress}#tokentxns`}
            className="text-[#83E9FF] hover:text-[#83E9FF]/80 truncate block"
            target="_blank"
            rel="noopener noreferrer"
          >
            {address}
          </Link>
        </td>
      );
    }

    if (currentAddress && address.toLowerCase() === currentAddress.toLowerCase()) {
      return (
        <td className="py-3 px-2 w-[180px]">
          <div className="flex items-center gap-2">
            <span className="text-white truncate">
              {formatAddress(address)}
            </span>
            <button
              onClick={() => copyToClipboard(address)}
              className="text-white/50 hover:text-white transition-colors flex-shrink-0"
              title="Copy address"
            >
              <Copy size={14} />
            </button>
          </div>
        </td>
      );
    }

    return (
      <td className="py-3 px-2 w-[180px]">
        <Link 
          href={`/explorer/address/${address}`}
          className="text-[#83E9FF] hover:text-[#83E9FF]/80 truncate block"
          title={address}
        >
          {formatAddress(address)}
        </Link>
      </td>
    );
  };

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
    <div className="bg-[#0A1F32] h-[600px] border border-[#1E3851] rounded-xl flex flex-col">
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="px-4 pt-4">
          <table className="w-full">
            <thead>
              <tr className="text-[#8B8B8B] text-sm border-b border-[#1E3851]">
                <th className="text-left py-3 px-2 font-normal w-[180px]">Hash</th>
                <th className="text-left py-3 px-2 font-normal w-[120px]">Method</th>
                <th className="text-left py-3 px-2 font-normal w-[100px]">Age</th>
                <th className="text-left py-3 px-2 font-normal w-[180px]">From</th>
                <th className="text-left py-3 px-2 font-normal w-[180px]">To</th>
                <th className="text-right py-3 px-2 font-normal w-[120px]">Amount</th>
                <th className="text-left py-3 px-2 font-normal w-[80px]">Token</th>
                <th className="text-right py-3 px-2 font-normal w-[120px]">Price</th>
                <th className="text-right py-3 px-2 font-normal w-[120px]">Value</th>
              </tr>
            </thead>
          </table>
        </div>
        
        <div className="px-4 flex-1 overflow-auto">
          <table className="w-full h-full">
            <tbody>
              {paginatedTxs.map((tx, index) => (
                <tr 
                  key={tx.hash} 
                  className="text-white text-sm border-b border-[#1E3851] last:border-b-0"
                >
                  <td className="py-3 px-2 max-w-[180px]">
                    <Link 
                      href={`/explorer/transaction/${tx.hash}`}
                      className="text-[#83E9FF] hover:text-[#83E9FF]/80 truncate block"
                      title={tx.hash}
                    >
                      {formatAddress(tx.hash)}
                    </Link>
                  </td>
                  <td className="py-3 px-2 w-[120px]">{tx.method}</td>
                  <td className="py-3 px-2 w-[100px]">{tx.age}</td>
                  {renderAddressCell(tx.from)}
                  {renderAddressCell(tx.to)}
                  <td className="py-3 px-2 text-right w-[120px]">
                    {formatNumberValue(tx.amount)}
                  </td>
                  <td className="py-3 px-2 w-[80px]">
                    {tx.token && tx.token !== 'unknown' ? tx.token : '-'}
                  </td>
                  <td className="py-3 px-2 text-right w-[120px]">
                    {tx.price ? formatNumber(parseFloat(tx.price), format, {
                      currency: '$',
                      showCurrency: true
                    }) : '-'}
                  </td>
                  <td className="py-3 px-2 text-right w-[120px]">{calculateValue(tx.amount, tx.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="border-t border-[#1E3851] flex items-center">
        <div className="w-full px-4 py-3">
          <Pagination
            total={total}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={setPage}
            onRowsPerPageChange={(newRowsPerPage) => {
              setRowsPerPage(newRowsPerPage);
              setPage(0);
            }}
          />
        </div>
      </div>
    </div>
  );
} 