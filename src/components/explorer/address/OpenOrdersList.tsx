"use client";

import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { formatNumber } from '@/lib/formatting';
import { useNumberFormat } from '@/store/number-format.store';
import { OpenOrder } from '@/services/explorer/address/types';
import { Pagination } from '@/components/common';
import { formatNumberValue } from '@/services/explorer/address';

interface OpenOrdersListProps {
  orders: OpenOrder[];
  isLoading: boolean;
}

export function OpenOrdersList({ orders, isLoading }: OpenOrdersListProps) {
  const { format } = useNumberFormat();
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Pagination logic
  const total = orders?.length || 0;
  const paginatedOrders = orders?.slice(page * rowsPerPage, (page + 1) * rowsPerPage) || [];
  
  // Dynamic height based on content
  const needsScroll = paginatedOrders.length > 10;
  const containerClass = needsScroll 
    ? "bg-[#051728E5] border-2 border-[#83E9FF4D] hover:border-[#83E9FF80] transition-colors shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm overflow-hidden rounded-lg flex flex-col h-[600px]"
    : "bg-[#051728E5] border-2 border-[#83E9FF4D] hover:border-[#83E9FF80] transition-colors shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm overflow-hidden rounded-lg flex flex-col";
  
  const tableContainerClass = needsScroll
    ? "overflow-auto scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-transparent flex-1"
    : "overflow-x-auto scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-transparent";

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString(format === 'FR' ? 'fr-FR' : 'en-US');
  };

  const getSideColor = (side: string) => {
    return side === 'B' ? 'text-[#4ADE80]' : 'text-[#FF5757]';
  };

  const getSideText = (side: string) => {
    return side === 'B' ? 'Buy' : 'Sell';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-[#051728E5] border-2 border-[#83E9FF4D] hover:border-[#83E9FF80] transition-colors shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm overflow-hidden rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#83E9FF]"></div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-[#051728E5] border-2 border-[#83E9FF4D] hover:border-[#83E9FF80] transition-colors shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm overflow-hidden rounded-lg text-white">
        No open orders found
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <div className={tableContainerClass}>
        <Table className="w-full">
          <TableHeader>
            <TableRow className="border-none bg-[#051728]">
              <TableHead className="text-white font-normal py-3 px-4 bg-[#051728] text-left text-sm">Coin</TableHead>
              <TableHead className="text-white font-normal py-3 px-4 bg-[#051728] text-left text-sm">Side</TableHead>
              <TableHead className="text-white font-normal py-3 px-4 bg-[#051728] text-left text-sm">Type</TableHead>
              <TableHead className="text-white font-normal py-3 px-4 bg-[#051728] text-left text-sm">Size</TableHead>
              <TableHead className="text-white font-normal py-3 px-4 bg-[#051728] text-left text-sm">Price</TableHead>
              <TableHead className="text-white font-normal py-3 px-4 bg-[#051728] text-left text-sm">Total</TableHead>
              <TableHead className="text-white font-normal py-3 px-6 bg-[#051728] text-left text-sm">Reduce Only</TableHead>
              <TableHead className="text-white font-normal py-3 px-4 bg-[#051728] text-left text-sm">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-[#051728]">
            {paginatedOrders.map((order, index) => {
              const total = parseFloat(order.sz) * parseFloat(order.limitPx);
              
              return (
                <TableRow 
                  key={`${order.oid}-${index}`} 
                  className="border-b border-[#FFFFFF1A] hover:bg-[#FFFFFF0A] transition-colors"
                >
                  <TableCell className="py-3 px-4 text-sm text-white font-medium">
                    {order.coin}
                  </TableCell>
                  <TableCell className={`py-3 px-4 text-sm ${getSideColor(order.side)}`}>
                    {getSideText(order.side)}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-sm text-white">
                    {order.orderType}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-sm text-white">
                    {formatNumberValue(order.sz, format)}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-sm text-white">
                    {formatNumber(parseFloat(order.limitPx), format, {
                      currency: '$',
                      showCurrency: true,
                      minimumFractionDigits: 4
                    })}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-sm text-white">
                    {formatNumber(total, format, {
                      currency: '$',
                      showCurrency: true,
                      minimumFractionDigits: 2
                    })}
                  </TableCell>
                  <TableCell className="py-3 px-6 text-sm">
                    {order.reduceOnly ? (
                      <span className="text-[#FFFFFF]">Yes</span>
                    ) : (
                      <span className="text-[#FFFFFF]">No</span>
                    )}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-sm text-white">
                    {formatTimestamp(order.timestamp)}
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