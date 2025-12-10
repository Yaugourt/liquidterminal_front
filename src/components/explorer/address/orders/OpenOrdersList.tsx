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
import { formatNumber } from '@/lib/formatters/numberFormatting';
import { useNumberFormat } from '@/store/number-format.store';
import { OpenOrder } from '@/services/explorer/address/types';
import { Pagination } from '@/components/common';
import { formatNumberValue } from '@/services/explorer/address';
import { Loader2, Database } from "lucide-react";

interface OpenOrdersListProps {
  orders: OpenOrder[];
  isLoading: boolean;
  error?: Error | null;
}

export function OpenOrdersList({ orders, isLoading, error }: OpenOrdersListProps) {
  const { format } = useNumberFormat();
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Pagination logic
  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedOrders = orders.slice(startIndex, endIndex);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[200px]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-6 w-6 animate-spin text-brand-accent mb-2" />
          <span className="text-[#FFFFFF80] text-sm">Loading orders...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[200px]">
        <div className="flex flex-col items-center text-center px-4">
          <Database className="w-8 h-8 mb-3 text-[#83E9FF4D]" />
          <p className="text-[#FF5757] text-sm mb-1">Error loading orders</p>
          <p className="text-[#FFFFFF80] text-xs">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-transparent">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="text-white text-left py-2 px-4 font-normal text-xs">Method</TableHead>
              <TableHead className="text-white text-left py-2 px-4 font-normal text-xs">Side</TableHead>
              <TableHead className="text-white text-left py-2 px-4 font-normal text-xs">Size</TableHead>
              <TableHead className="text-white text-left py-2 px-4 font-normal text-xs">Token</TableHead>
              <TableHead className="text-white text-left py-2 px-4 font-normal text-xs">Price</TableHead>
              <TableHead className="text-white text-left py-2 px-4 font-normal text-xs">Value</TableHead>
              <TableHead className="text-white text-left py-2 px-4 font-normal text-xs">Reduce Only</TableHead>
              <TableHead className="text-white text-left py-2 px-4 font-normal text-xs">Time in Force</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedOrders.length > 0 ? (
              paginatedOrders.map((order, index) => (
                <TableRow key={`${order.coin}-${order.side}-${index}`} className="border-b border-[#FFFFFF1A] hover:bg-[#FFFFFF0A]">
                  <TableCell className="py-3 px-4 text-white">{order.orderType}</TableCell>
                  <TableCell className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      order.side === 'A' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {order.side === 'A' ? 'Buy' : 'Sell'}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 px-4 text-white">
                    {formatNumberValue(order.sz, format)}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-white">{order.coin}</TableCell>
                  <TableCell className="py-3 px-4 text-white">
                    {order.limitPx ? formatNumberValue(order.limitPx, format) : 'Market'}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-white">
                    {order.limitPx ? 
                      `$${formatNumber(parseFloat(order.sz) * parseFloat(order.limitPx), format)}` 
                      : '-'
                    }
                  </TableCell>
                  <TableCell className="py-3 px-4 text-white">
                    {order.reduceOnly ? 'Yes' : 'No'}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-white">{order.tif}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="py-8">
                  <div className="flex flex-col items-center justify-center text-center">
                    <Database className="w-10 h-10 mb-3 text-[#83E9FF4D]" />
                    <p className="text-white text-sm mb-1">No open orders found</p>
                    <p className="text-[#FFFFFF80] text-xs">Your active orders will appear here</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {orders.length > 0 && (
        <div className="border-t border-[#FFFFFF1A] px-4 py-2">
          <Pagination
            total={orders.length}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={setPage}
            onRowsPerPageChange={setRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </div>
      )}
    </div>
  );
} 