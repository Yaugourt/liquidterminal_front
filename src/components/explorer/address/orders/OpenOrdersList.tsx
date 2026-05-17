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
import { Database } from "lucide-react";
import { LoadingState } from "@/components/ui/loading-state";

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
        <LoadingState message="Loading orders..." size="sm" withCard={false} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[200px]">
        <div className="flex flex-col items-center text-center px-4">
          <Database className="w-8 h-8 mb-3 text-brand-accent/30" />
          <p className="text-rose-400 text-sm mb-1">Error loading orders</p>
          <p className="text-white/50 text-xs">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      <div className="overflow-x-auto scrollbar-brand">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="border-b border-border-subtle hover:bg-transparent">
              <TableHead>Method</TableHead>
              <TableHead>Side</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Token</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Reduce Only</TableHead>
              <TableHead>Time in Force</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedOrders.length > 0 ? (
              paginatedOrders.map((order, index) => (
                <TableRow key={`${order.coin}-${order.side}-${index}`} className="border-b border-border-subtle hover:bg-white/[0.02] transition-colors">
                  <TableCell className="py-3 px-4 text-text-primary">{order.orderType}</TableCell>
                  <TableCell className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${order.side === 'A'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-rose-500/10 text-rose-400'
                      }`}>
                      {order.side === 'A' ? 'Buy' : 'Sell'}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 px-4 text-text-primary">
                    {formatNumberValue(order.sz, format)}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-text-primary">{order.coin}</TableCell>
                  <TableCell className="py-3 px-4 text-text-primary">
                    {order.limitPx ? formatNumberValue(order.limitPx, format) : 'Market'}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-text-primary">
                    {order.limitPx ?
                      `$${formatNumber(parseFloat(order.sz) * parseFloat(order.limitPx), format)}`
                      : '-'
                    }
                  </TableCell>
                  <TableCell className="py-3 px-4 text-text-primary">
                    {order.reduceOnly ? 'Yes' : 'No'}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-text-primary">{order.tif}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="py-8">
                  <div className="flex flex-col items-center justify-center text-center">
                    <Database className="w-10 h-10 mb-3 text-brand-accent/30" />
                    <p className="text-text-primary text-sm mb-1">No open orders found</p>
                    <p className="text-white/50 text-xs">Your active orders will appear here</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {orders.length > 0 && (
        <div className="border-t border-white/10 px-4 py-2">
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