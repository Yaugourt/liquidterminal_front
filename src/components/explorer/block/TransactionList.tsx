"use client";

import { useState, useCallback, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Copy, Check, Clock, FileText, User } from "lucide-react";
import { format } from "date-fns";
import { Pagination } from "@/components/explorer/Pagination";
import { BlockTransaction } from "@/services/explorer/types";

interface TransactionListProps {
  transactions: BlockTransaction[];
  onTransactionClick: (hash: string) => void;
  onAddressClick: (address: string) => void;
}

export function TransactionList({
  transactions,
  onTransactionClick,
  onAddressClick,
}: TransactionListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedValues, setCopiedValues] = useState<Record<string, boolean>>({});
  const ITEMS_PER_PAGE = 15;

  // Calculate pagination
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const displayedTransactions = transactions.slice(startIndex, endIndex);

  // Calculate dynamic height based on transaction count
  const cardHeight = useMemo(() => {
    const rowHeight = 46; // Hauteur approximative d'une ligne en pixels
    const headerHeight = 60; // Hauteur du header
    const paginationHeight = 60; // Hauteur de la pagination
    const padding = 32; // Padding vertical total
    
    // Calculer la hauteur en fonction du nombre de transactions à afficher
    const tableHeight = Math.min(transactions.length, ITEMS_PER_PAGE) * rowHeight;
    const headerRowHeight = 40; // Hauteur de la ligne d'en-tête
    
    // Hauteur minimale pour éviter une carte trop petite
    const minHeight = 200;
    
    return Math.max(minHeight, headerHeight + headerRowHeight + tableHeight + paginationHeight + padding);
  }, [transactions.length, ITEMS_PER_PAGE]);

  const copyToClipboard = useCallback((text: string, key: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopiedValues((prev) => ({ ...prev, [key]: true }));
        setTimeout(() => {
          setCopiedValues((prev) => ({ ...prev, [key]: false }));
        }, 2000);
      })
      .catch((err) => {
        console.error("Erreur lors de la copie :", err);
      });
  }, []);

  return (
    <Card 
      className="bg-[#051728E5]/80 backdrop-blur-sm border-2 border-[#83E9FF4D] p-0 shadow-md hover:border-[#83E9FF40] transition-all duration-300"
      style={{ height: `${cardHeight}px` }}
    >
      <div className="flex items-center px-5 py-4 bg-[#051728]/95 border-b border-[#FFFFFF1A] rounded-t-xl">
        <FileText size={16} className="text-[#83E9FF80] mr-2" />
        <h2 className="text-lg text-white font-serif">Transactions</h2>
        {transactions.length > 0 && (
          <span className="ml-3 text-xs text-[#FFFFFF80]">({transactions.length})</span>
        )}
      </div>
      
      <div className="p-4 flex flex-col h-[calc(100%-60px)]">
        <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-transparent">
          {transactions.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-[#FFFFFF80] text-sm">Aucune transaction dans ce bloc</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[#FFFFFF99]">
                  <th className="text-left pb-3 px-2 font-medium text-xs uppercase tracking-wide border-b border-[#FFFFFF1A]">Hash</th>
                  <th className="text-left pb-3 px-2 font-medium text-xs uppercase tracking-wide border-b border-[#FFFFFF1A]">Action</th>
                  <th className="text-left pb-3 px-2 font-medium text-xs uppercase tracking-wide border-b border-[#FFFFFF1A]">Block</th>
                  <th className="text-left pb-3 px-2 font-medium text-xs uppercase tracking-wide border-b border-[#FFFFFF1A]">Time</th>
                  <th className="text-left pb-3 px-2 font-medium text-xs uppercase tracking-wide border-b border-[#FFFFFF1A]">User</th>
                </tr>
              </thead>
              <tbody>
                {displayedTransactions.map((tx) => (
                  <tr
                    key={tx.hash}
                    className="text-white border-b border-[#FFFFFF0A] hover:bg-[#FFFFFF0A] transition-colors"
                  >
                    <td className="py-3 px-2">
                      <div className="flex items-center group">
                        <span
                          className="text-[#83E9FF] cursor-pointer hover:text-[#83E9FF]/80 transition-colors mr-1.5 font-medium"
                          onClick={() => onTransactionClick(tx.hash)}
                        >
                          {tx.hash.slice(0, 6)}...{tx.hash.slice(-4)}
                        </span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 p-0 text-[#83E9FF] opacity-60 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  copyToClipboard(tx.hash, `tx-${tx.hash}`, e);
                                }}
                              >
                                {copiedValues[`tx-${tx.hash}`] ? (
                                  <Check size={12} />
                                ) : (
                                  <Copy size={12} />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-[#051728] border border-[#83E9FF] text-white">
                              <p className="text-xs px-1">
                                {copiedValues[`tx-${tx.hash}`]
                                  ? "Hash copié !"
                                  : "Copier le hash"}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </td>
                    <td className="py-3 px-2 font-medium">
                      <span className="bg-[#83E9FF20] px-2 py-0.5 rounded text-xs">
                        {tx.action.type}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-[#83E9FF]">{tx.block}</td>
                    <td className="py-3 px-2 text-[#FFFFFF99] text-xs">
                      <div className="flex items-center">
                        <Clock size={12} className="mr-1.5 text-[#83E9FF50]" />
                        {format(tx.time, "dd/MM/yyyy HH:mm:ss")}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center group">
                        <User size={12} className="mr-1.5 text-[#83E9FF50]" />
                        <span
                          className="text-[#83E9FF] cursor-pointer hover:text-[#83E9FF]/80 transition-colors mr-1.5 font-medium"
                          onClick={() => onAddressClick(tx.user)}
                        >
                          {tx.user.slice(0, 6)}...{tx.user.slice(-4)}
                        </span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 p-0 text-[#83E9FF] opacity-60 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  copyToClipboard(tx.user, `user-${tx.hash}`, e);
                                }}
                              >
                                {copiedValues[`user-${tx.hash}`] ? (
                                  <Check size={12} />
                                ) : (
                                  <Copy size={12} />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-[#051728] border border-[#83E9FF] text-white">
                              <p className="text-xs px-1">
                                {copiedValues[`user-${tx.hash}`]
                                  ? "Adresse copiée !"
                                  : "Copier l'adresse"}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {transactions.length > ITEMS_PER_PAGE && (
          <div className="mt-4 border-t border-[#FFFFFF1A] pt-4">
            <Pagination
              currentPage={currentPage}
              totalItems={transactions.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </Card>
  );
} 