"use client";

import { useState } from "react";
import { useWallets } from "@/store/use-wallets";
import { useUserFills } from "@/services/explorer/address/hooks/useUserFills";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Copy, Check } from "lucide-react";
import { useNumberFormat } from '@/store/number-format.store';
import { formatAssetValue } from '@/lib/formatters/numberFormatting';
import { formatAge } from "@/services/explorer/address/utils";
import { Pagination } from "@/components/common/pagination";

export function WalletRecentFillsSection() {
  const { getActiveWallet } = useWallets();
  const { format } = useNumberFormat();
  const activeWallet = getActiveWallet();
  
  // État pour la pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Copy state pour les hashs
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Récupérer tous les fills
  const { 
    data: allFills,
    isLoading,
    error
  } = useUserFills(activeWallet?.address, {
    pageSize: 1000, // Récupérer beaucoup de fills pour la pagination côté client
    refreshInterval: 30000
  });

  // Calculer les données paginées côté client
  const fills = allFills || [];
  const total = fills.length;
  const paginatedFills = fills.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
  
  // Dynamic height based on content - identique à TransactionList
  const needsScroll = paginatedFills.length > 10;
  const containerClass = needsScroll 
    ? "bg-[#051728E5] border-2 border-[#83E9FF4D] hover:border-[#83E9FF80] transition-colors shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm overflow-hidden rounded-lg flex flex-col h-[600px]"
    : "bg-[#051728E5] border-2 border-[#83E9FF4D] hover:border-[#83E9FF80] transition-colors shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm overflow-hidden rounded-lg flex flex-col";
  
  const tableContainerClass = needsScroll
    ? "overflow-auto scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-transparent flex-1"
    : "overflow-x-auto scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-transparent";

  const formatCurrency = (value: string | number) => {
    return formatAssetValue(Number(value), format);
  };

  const formatDirection = (dir: string) => {
    const isClose = dir.toLowerCase().includes('close');
    const isShort = dir.toLowerCase().includes('short');
    const isLong = dir.toLowerCase().includes('long');
    
    if (isClose) {
      return <span className="text-[#F9E370]">{dir}</span>;
    } else if (isShort) {
      return <span className="text-[#FF4D4F]">{dir}</span>;
    } else if (isLong) {
      return <span className="text-[#52C41A]">{dir}</span>;
    }
    
    return <span className="text-white">{dir}</span>;
  };

  const formatPnl = (pnl: string) => {
    const pnlValue = parseFloat(pnl);
    if (pnlValue === 0) return <span className="text-[#FFFFFF80]">$0.00</span>;
    
    const color = pnlValue > 0 ? 'text-[#4ADE80]' : 'text-[#FF5757]';
    const sign = pnlValue > 0 ? '+' : '';
    
    return (
      <span className={color}>
        {sign}{formatCurrency(Math.abs(pnlValue))}
      </span>
    );
  };

  // Fonction pour copier le hash avec feedback - identique à TransactionList
  const copyHashToClipboard = async (hash: string) => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopiedHash(hash);
      setTimeout(() => setCopiedHash(null), 2000);
          } catch {
        // Error handled silently
      }
  };

  // Fonction pour formater le hash - identique à TransactionList
  const formatHash = (hash: string) => {
    if (!hash) return '-';
    return hash.length > 10 ? `${hash.slice(0, 5)}...${hash.slice(-3)}` : hash;
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

  if (!activeWallet?.address) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-[#051728E5] border-2 border-[#83E9FF4D] hover:border-[#83E9FF80] transition-colors shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm overflow-hidden rounded-lg text-white">
        No wallet selected
      </div>
    );
  }

  if (!fills || fills.length === 0) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-[#051728E5] border-2 border-[#83E9FF4D] hover:border-[#83E9FF80] transition-colors shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm overflow-hidden rounded-lg text-white">
        No fills found
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
              <TableHead className="text-white font-normal py-3 px-4 bg-[#051728] text-left text-sm">Asset</TableHead>
              <TableHead className="text-white font-normal py-3 px-4 bg-[#051728] text-left text-sm">Direction</TableHead>
              <TableHead className="text-white font-normal py-3 px-4 bg-[#051728] text-left text-sm">Age</TableHead>
              <TableHead className="text-white font-normal py-3 px-4 bg-[#051728] text-left text-sm">Size</TableHead>
              <TableHead className="text-white font-normal py-3 px-4 bg-[#051728] text-left text-sm">Price</TableHead>
              <TableHead className="text-white font-normal py-3 px-4 bg-[#051728] text-right text-sm">PnL</TableHead>
              <TableHead className="text-white font-normal py-3 px-4 bg-[#051728] text-right text-sm">Fee</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-[#051728]">
            {paginatedFills.map((fill) => (
              <TableRow 
                key={`${fill.hash}-${fill.tid}`} 
                className="border-b border-[#FFFFFF1A] hover:bg-[#FFFFFF0A] transition-colors"
              >
                <TableCell className="py-3 px-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#83E9FF]" title={fill.hash}>
                      {formatHash(fill.hash)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        copyHashToClipboard(fill.hash);
                      }}
                      className="group p-1 rounded transition-colors"
                    >
                      {copiedHash === fill.hash ? (
                        <Check className="h-3.5 w-3.5 text-green-500 transition-all duration-200" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 text-[#f9e370] opacity-60 group-hover:opacity-100 transition-all duration-200" />
                      )}
                    </button>
                  </div>
                </TableCell>
                <TableCell className="py-3 px-4 text-sm text-white">
                  {fill.coin}
                </TableCell>
                <TableCell className="py-3 px-4 text-sm">
                  {formatDirection(fill.dir)}
                </TableCell>
                <TableCell className="py-3 px-4 text-sm text-white">
                  {formatAge(fill.time)}
                </TableCell>
                <TableCell className="py-3 px-4 text-sm text-white">
                  {parseFloat(fill.sz).toFixed(4)}
                </TableCell>
                <TableCell className="py-3 px-4 text-sm text-white">
                  {formatCurrency(fill.px)}
                </TableCell>
                <TableCell className="py-3 px-4 text-sm text-right">
                  {formatPnl(fill.closedPnl)}
                </TableCell>
                <TableCell className="py-3 px-4 text-sm text-white text-right">
                  {formatCurrency(fill.fee)} {fill.feeToken}
                </TableCell>
              </TableRow>
            ))}
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