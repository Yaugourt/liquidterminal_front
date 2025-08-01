"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Copy, Check } from "lucide-react";
import { useNumberFormat } from '@/store/number-format.store';
import { formatNumber } from '@/lib/numberFormatting';
import { formatAddress, formatHash, isHip2Address } from '@/services/explorer/address';
import { Pagination } from '@/components/common';
import { TransactionListProps } from "@/components/types/explorer.types";
import { 
  getTokenPrice, 
  getTokenName, 
  calculateValueWithDirection,
  formatAmountWithDirection,
  getAmountColorClass 
} from '@/services/explorer/address';
import { useSpotTokens } from '@/services/market/spot/hooks/useSpotMarket';
import { usePerpMarkets } from '@/services/market/perp/hooks/usePerpMarket';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

export function TransactionList({ transactions, isLoading, error, currentAddress }: TransactionListProps) {
  const { format } = useNumberFormat();
  
  // Récupération des données de marché pour les prix
  const { data: spotTokens } = useSpotTokens({ limit: 100 });
  const { data: perpMarkets } = usePerpMarkets({ limit: 1000 });
  
  // Configuration pour les formatters
  const formatterConfig = {
    spotTokens,
    perpMarkets,
    format,
    currentAddress
  };
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Copy state
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Pagination logic
  const total = transactions?.length || 0;
  const paginatedTxs = transactions?.slice(page * rowsPerPage, (page + 1) * rowsPerPage) || [];
  
  // Dynamic height based on content
  const needsScroll = paginatedTxs.length > 10;
  const containerClass = needsScroll 
    ? "bg-[#051728E5] border-2 border-[#83E9FF4D] hover:border-[#83E9FF80] transition-colors shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm overflow-hidden rounded-lg flex flex-col h-[600px]"
    : "bg-[#051728E5] border-2 border-[#83E9FF4D] hover:border-[#83E9FF80] transition-colors shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm overflow-hidden rounded-lg flex flex-col";
  
  const tableContainerClass = needsScroll
    ? "overflow-auto scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-transparent flex-1"
    : "overflow-x-auto scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-transparent";

  // Fonction pour copier l'adresse
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Fonction pour copier le hash avec feedback
  const copyHashToClipboard = async (hash: string) => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopiedHash(hash);
      setTimeout(() => setCopiedHash(null), 2000);
          } catch {
        // Error handled silently
      }
  };

  const renderAddressCell = (address: string) => {
    if (!address) {
      return (
        <TableCell className="py-3 px-4 text-sm text-white">
          <span>-</span>
        </TableCell>
      );
    }

    // Cas spéciaux non-cliquables
    if (address === "Spot" || address === "Perp" || address === "Staking") {
      return (
        <TableCell className="py-3 px-4 text-sm text-white">
          <span>{address}</span>
        </TableCell>
      );
    }

    if (address === "Arbitrum") {
      return (
        <TableCell className="py-3 px-4 text-sm">
          <Link 
            href={`https://arbiscan.io/address/${currentAddress}#tokentxns`}
            className="text-[#83E9FF] hover:text-[#83E9FF]/80 truncate block"
            target="_blank"
            rel="noopener noreferrer"
          >
            {address}
          </Link>
        </TableCell>
      );
    }

    if (isHip2Address(address)) {
      return (
        <TableCell className="py-3 px-4 text-sm">
          <Link 
            href={`/explorer/address/${address}`}
            className="text-[#83E9FF] hover:text-[#83E9FF]/80 truncate block"
          >
            HIP2
          </Link>
        </TableCell>
      );
    }

    if (currentAddress && address.toLowerCase() === currentAddress.toLowerCase()) {
      return (
        <TableCell className="py-3 px-4 text-sm">
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
        </TableCell>
      );
    }

    return (
      <TableCell className="py-3 px-4 text-sm">
        <Link 
          href={`/explorer/address/${address}`}
          className="text-[#83E9FF] hover:text-[#83E9FF]/80 truncate block"
          title={address}
        >
          {formatAddress(address)}
        </Link>
      </TableCell>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-[#051728E5] border-2 border-[#83E9FF4D] hover:border-[#83E9FF80] transition-colors shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm overflow-hidden rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#83E9FF]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-[#051728E5] border-2 border-[#83E9FF4D] hover:border-[#83E9FF80] transition-colors shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm overflow-hidden rounded-lg text-red-500">
        {error.message}
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-[#051728E5] border-2 border-[#83E9FF4D] hover:border-[#83E9FF80] transition-colors shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm overflow-hidden rounded-lg text-white">
        No transactions found
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <div className={tableContainerClass}>
        <Table className="w-full">
          <TableHeader>
            <TableRow className="border-none bg-[#051728]">
              <TableHead className="text-white font-normal py-3 px-4 bg-[#051728] text-left text-sm">Hash</TableHead>
              <TableHead className="text-white font-normal py-3 px-4 bg-[#051728] text-left text-sm">Method</TableHead>
              <TableHead className="text-white font-normal py-3 px-4 bg-[#051728] text-left text-sm">Age</TableHead>
              <TableHead className="text-white font-normal py-3 px-4 bg-[#051728] text-left text-sm">From</TableHead>
              <TableHead className="text-white font-normal py-3 px-4 bg-[#051728] text-left text-sm">To</TableHead>
              <TableHead className="text-white font-normal py-3 px-4 bg-[#051728] text-left text-sm">Token</TableHead>
              <TableHead className="text-white font-normal py-3 px-4 bg-[#051728] text-left text-sm">Price</TableHead>
              <TableHead className="text-white font-normal py-3 px-4 bg-[#051728] text-right text-sm">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-[#051728]">
            {paginatedTxs.map((tx) => {
              const tokenName = getTokenName(tx.token, spotTokens, perpMarkets);
              const tokenPrice = getTokenPrice(tokenName, spotTokens);
              
              return (
                <TableRow 
                  key={tx.hash} 
                  className="border-b border-[#FFFFFF1A] hover:bg-[#FFFFFF0A] transition-colors"
                >
                  <TableCell className="py-3 px-4 text-sm">
                    <div className="flex items-center gap-1.5">
                      <Link 
                        href={`/explorer/transaction/${tx.hash}`}
                        className="text-[#83E9FF] hover:text-[#83E9FF]/80 transition-colors"
                        title={tx.hash}
                      >
                        {formatHash(tx.hash)}
                      </Link>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          copyHashToClipboard(tx.hash);
                        }}
                        className="group p-1 rounded transition-colors"
                      >
                        {copiedHash === tx.hash ? (
                          <Check className="h-3.5 w-3.5 text-green-500 transition-all duration-200" />
                        ) : (
                          <Copy className="h-3.5 w-3.5 text-[#f9e370] opacity-60 group-hover:opacity-100 transition-all duration-200" />
                        )}
                      </button>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-4 text-sm text-white">
                    {tx.method === 'accountClassTransfer' || tx.method === 'cStakingTransfer' ? 'Internal Transfer' : tx.method}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-sm text-white">{tx.age}</TableCell>
                  {renderAddressCell(tx.from)}
                  {renderAddressCell(tx.to)}
                  <TableCell className={`py-3 px-4 text-sm ${getAmountColorClass(tx, formatterConfig)}`}>
                    {formatAmountWithDirection(tx, formatterConfig)}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-sm text-white text-right">
                    {tx.price ? formatNumber(parseFloat(tx.price), format, {
                      currency: '$',
                      showCurrency: true,
                      minimumFractionDigits: 4
                    }) : (tokenPrice > 0 ? formatNumber(tokenPrice, format, {
                      currency: '$',
                      showCurrency: true,
                      minimumFractionDigits: 4
                    }) : '-')}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-sm text-white text-right">
                    {calculateValueWithDirection(tx, formatterConfig)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      
      <div className="border-t border-[#FFFFFF1A] flex items-center mt-auto">
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