"use client";

import { useState, useCallback } from 'react';
import { useAuctions } from '@/services/market/auction/hooks/useAuctions';
import { TypedDataTable, TokenAvatar, type Column } from '@/components/common';
import { Copy, Check } from 'lucide-react';
import Link from "next/link";
import { useDateFormat } from '@/store/date-format.store';
import { formatDateTime } from '@/lib/formatters/dateFormatting';
import { EmptyState } from "@/components/ui/empty-state";
import { Card } from "@/components/ui/card";
import type { AuctionInfo } from '@/services/market/auction/types';
import type { SortDirection } from '@/components/common';

interface AuctionTableProps {
  marketType: "spot" | "perp";
}

// Format court pour l'adresse
const formatAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

export function AuctionTable({ marketType }: AuctionTableProps) {
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<'time' | 'gasHype' | 'gasUsdc'>('time');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const { format: dateFormat } = useDateFormat();

  const {
    auctions,
    total,
    page: currentPage,
    isLoading,
    error,
    updateParams,
  } = useAuctions({
    currency: 'ALL',
    limit: pageSize,
    defaultParams: {
      page,
      sortBy: sortField === 'time' ? 'time' : 'deployGas',
      sortOrder,
    },
  });

  const handleCopy = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      setTimeout(() => setCopiedAddress(null), 1200);
    } catch {}
  };

  // Server-side sort handler
  const handleSortChange = useCallback(
    (field: string, dir: SortDirection) => {
      const sortFieldMap: Record<string, 'time' | 'deployGas'> = {
        time: 'time',
        gasHype: 'deployGas',
        gasUsdc: 'deployGas',
      };
      const apiSortField = sortFieldMap[field];
      if (!apiSortField) return;
      setSortField(field as 'time' | 'gasHype' | 'gasUsdc');
      setSortOrder(dir);
      updateParams({ sortBy: apiSortField, sortOrder: dir, page: 1 });
      setPage(1);
    },
    [updateParams]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage + 1);
      updateParams({ page: newPage + 1 });
    },
    [updateParams]
  );

  const handleRowsPerPageChange = useCallback(
    (newRowsPerPage: number) => {
      setPageSize(newRowsPerPage);
      setPage(1);
      updateParams({ limit: newRowsPerPage, page: 1 });
    },
    [updateParams]
  );

  // Si c'est perp, afficher Coming Soon
  if (marketType === "perp") {
    return (
      <Card>
        <EmptyState
          title="Coming Soon"
          description="Perpetual auctions table will be available soon."
          withCard={false}
        />
      </Card>
    );
  }

  const columns: Column<AuctionInfo>[] = [
    {
      key: 'time',
      header: 'Date',
      sortable: true,
      accessor: (row) => (
        <span className="text-text-primary text-sm">
          {formatDateTime(row.time, dateFormat)}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Name',
      accessor: (row) => (
        <span className="inline-flex items-center gap-2">
          <TokenAvatar assetName={row.name} kind="spot" size="md" />
          <span className="text-text-primary text-sm font-medium">{row.name}</span>
        </span>
      ),
    },
    {
      key: 'deployer',
      header: 'Deployer',
      accessor: (row) => (
        <div className="flex items-center gap-1.5">
          <Link
            href={`/explorer/address/${row.deployer}`}
            className="text-brand text-xs hover:text-text-primary transition-colors"
          >
            {formatAddress(row.deployer)}
          </Link>
          <button
            onClick={(e) => { e.preventDefault(); handleCopy(row.deployer); }}
            className="group p-1 rounded transition-colors"
          >
            {copiedAddress === row.deployer ? (
              <Check className="h-3 w-3 text-emerald-400 transition-all duration-200" />
            ) : (
              <Copy className="h-3 w-3 text-gold opacity-60 group-hover:opacity-100 transition-all duration-200" />
            )}
          </button>
        </div>
      ),
    },
    {
      key: 'tokenId',
      header: 'Token Address',
      accessor: (row) => (
        <div className="flex items-center gap-1.5">
          <Link
            href={`/explorer/address/${row.tokenId}`}
            className="text-brand text-xs hover:text-text-primary transition-colors"
          >
            {formatAddress(row.tokenId)}
          </Link>
          <button
            onClick={(e) => { e.preventDefault(); handleCopy(row.tokenId); }}
            className="group p-1 rounded transition-colors"
          >
            {copiedAddress === row.tokenId ? (
              <Check className="h-3 w-3 text-emerald-400 transition-all duration-200" />
            ) : (
              <Copy className="h-3 w-3 text-gold opacity-60 group-hover:opacity-100 transition-all duration-200" />
            )}
          </button>
        </div>
      ),
    },
    {
      key: 'index',
      header: 'Index',
      type: 'numeric',
      accessor: (row) => (
        <span className="text-text-primary text-sm">{row.index}</span>
      ),
    },
    {
      key: 'gasHype',
      header: 'Gas (HYPE)',
      type: 'fees',
      sortable: true,
      accessor: (row) => row.currency === 'HYPE' ? row.deployGas : '-',
    },
    {
      key: 'gasUsdc',
      header: 'Gas (USDC)',
      type: 'numeric',
      sortable: true,
      accessor: (row) => row.currency === 'USDC' ? row.deployGas : '-',
    },
  ];

  return (
    <TypedDataTable<AuctionInfo>
      data={auctions}
      columns={columns}
      getRowKey={(row) => row.tokenId}
      isLoading={isLoading && auctions.length === 0}
      error={error}
      errorTitle="Error loading auctions"
      emptyMessage="No auctions available"
      emptyDescription="Check back later"
      // Server-side sort
      onSortChange={handleSortChange}
      sortField={sortField}
      sortDirection={sortOrder}
      // Server-side pagination
      total={total}
      page={currentPage - 1}
      rowsPerPage={pageSize}
      onPageChange={handlePageChange}
      onRowsPerPageChange={handleRowsPerPageChange}
      rowsPerPageOptions={[5, 10, 15, 20]}
      paginationVariant="full"
    />
  );
}
