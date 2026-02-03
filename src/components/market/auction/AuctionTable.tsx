import { useState, useCallback } from 'react';
import { useAuctions } from '@/services/market/auction/hooks/useAuctions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  SortableTableHead,
} from '@/components/ui/table';
import { Copy, Check } from 'lucide-react';
import Link from "next/link";
import { useDateFormat } from '@/store/date-format.store';
import { formatDateTime } from '@/lib/formatters/dateFormatting';
import { Pagination } from '@/components/common';
import { TableEmptyState } from "@/components/ui/table-states";
import { LoadingState } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";

interface AuctionTableProps {
  marketType: "spot" | "perp";
}




const columns = [
  { key: 'time', label: 'Date', sortable: true, className: 'pl-4 w-[16%] text-left' },
  { key: 'name', label: 'Name', sortable: false, className: 'pl-2 w-[12%] text-left' },
  { key: 'deployer', label: 'Deployer', sortable: false, className: 'pl-2 w-[16%] text-left' },
  { key: 'tokenId', label: 'Token Address', sortable: false, className: 'pl-2 w-[16%] text-left' },
  { key: 'index', label: 'Index', sortable: false, className: 'pl-2 pr-4 w-[10%] text-center' },
  { key: 'gasHype', label: 'Gas (HYPE)', sortable: true, className: 'pl-4 pr-2 w-[15%] text-left' },
  { key: 'gasUsdc', label: 'Gas (USDC)', sortable: true, className: 'pl-4 pr-4 w-[15%] text-left' },
];

// Format court pour l'adresse
const formatAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

export function AuctionTable({ marketType }: AuctionTableProps) {
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<'time' | 'gasHype' | 'gasUsdc'>('time');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const { 
    auctions, 
    total, 
    page: currentPage, 
    isLoading, 
    error,
    updateParams 
  } = useAuctions({ 
    currency: 'ALL', 
    limit: pageSize,
    defaultParams: {
      page,
      sortBy: sortField === 'time' ? 'time' : 'deployGas',
      sortOrder
    }
  });

  const { format: dateFormat } = useDateFormat();

  const handleCopy = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      setTimeout(() => setCopiedAddress(null), 1200);
    } catch {}
  };



  const handleSort = useCallback((field: string) => {
    // Map column keys to API sort fields
    const sortFieldMap: Record<string, 'time' | 'deployGas'> = {
      'time': 'time',
      'gasHype': 'deployGas',
      'gasUsdc': 'deployGas'
    };
    
    const apiSortField = sortFieldMap[field];
    if (!apiSortField) return;
    
    if (sortField === field) {
      const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
      setSortOrder(newOrder);
      updateParams({ sortBy: apiSortField, sortOrder: newOrder, page: 1 });
      setPage(1);
    } else {
      setSortField(field as 'time' | 'gasHype' | 'gasUsdc');
      setSortOrder('desc');
      updateParams({ sortBy: apiSortField, sortOrder: 'desc', page: 1 });
      setPage(1);
    }
  }, [sortField, sortOrder, updateParams]);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage + 1);
    updateParams({ page: newPage + 1 });
  }, [updateParams]);

  const handleRowsPerPageChange = useCallback((newRowsPerPage: number) => {
    setPageSize(newRowsPerPage);
    setPage(1);
    updateParams({ limit: newRowsPerPage, page: 1 });
  }, [updateParams]);

  // Si c'est perp, afficher Coming Soon
  if (marketType === "perp") {
    return (
      <div className="bg-brand-secondary/60 backdrop-blur-md border border-border-subtle rounded-2xl shadow-xl shadow-black/20 overflow-hidden">
        <EmptyState
          title="Coming Soon"
          description="Perpetual auctions table will be available soon."
          withCard={false}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full bg-brand-secondary/60 backdrop-blur-md border border-border-subtle rounded-2xl shadow-xl shadow-black/20 overflow-hidden">
        <LoadingState message="Loading auctions..." size="lg" withCard={false} />
      </div>
    );
  }
  if (error) {
    return (
      <div className="w-full bg-brand-secondary/60 backdrop-blur-md border border-border-subtle rounded-2xl shadow-xl shadow-black/20 overflow-hidden">
        <ErrorState title="Error loading auctions" message={error.message} withCard={false} />
      </div>
    );
  }

  return (
    <div className="w-full bg-brand-secondary/60 backdrop-blur-md border border-border-subtle rounded-2xl hover:border-border-hover transition-all shadow-xl shadow-black/20 overflow-hidden">
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border-subtle hover:bg-transparent">
              {columns.map(col => (
                col.sortable ? (
                  <SortableTableHead
                    key={col.key}
                    label={col.label}
                    onClick={() => handleSort(col.key)}
                    isActive={sortField === col.key}
                    className={col.className}
                  />
                ) : (
                  <TableHead
                    key={col.key}
                    className={col.className}
                  >
                    <span className="text-label text-text-secondary">{col.label}</span>
                  </TableHead>
                )
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {auctions.length === 0 ? (
              <TableEmptyState colSpan={7} title="No auctions available" description="Check back later" />
            ) : (
              auctions.map((auction) => (
                <TableRow key={auction.tokenId} className="border-b border-border-subtle hover:bg-white/[0.02] transition-colors cursor-pointer">
                  <TableCell className="text-white text-sm text-left">{formatDateTime(auction.time, dateFormat)}</TableCell>
                  <TableCell className="text-white text-sm font-medium text-left">{auction.name}</TableCell>
                  <TableCell className="text-sm text-left">
                    <div className="flex items-center gap-1.5">
                      <Link href={`/explorer/address/${auction.deployer}`} className="text-brand-accent font-mono text-xs hover:text-white transition-colors">{formatAddress(auction.deployer)}</Link>
                      <button onClick={e => { e.preventDefault(); handleCopy(auction.deployer); }} className="group p-1 rounded transition-colors">{copiedAddress === auction.deployer ? (<Check className="h-3 w-3 text-emerald-400 transition-all duration-200" />) : (<Copy className="h-3 w-3 text-brand-gold opacity-60 group-hover:opacity-100 transition-all duration-200" />)}</button>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-left">
                    <div className="flex items-center gap-1.5">
                      <Link href={`/explorer/address/${auction.tokenId}`} className="text-brand-accent font-mono text-xs hover:text-white transition-colors">{formatAddress(auction.tokenId)}</Link>
                      <button onClick={e => { e.preventDefault(); handleCopy(auction.tokenId); }} className="group p-1 rounded transition-colors">{copiedAddress === auction.tokenId ? (<Check className="h-3 w-3 text-emerald-400 transition-all duration-200" />) : (<Copy className="h-3 w-3 text-brand-gold opacity-60 group-hover:opacity-100 transition-all duration-200" />)}</button>
                    </div>
                  </TableCell>
                  <TableCell className="text-white text-sm text-center w-[10%]">{auction.index}</TableCell>
                  <TableCell className="text-white text-sm text-left w-[15%]">{auction.currency === 'HYPE' ? auction.deployGas : '-'}</TableCell>
                  <TableCell className="text-white text-sm text-left w-[15%]">{auction.currency === 'USDC' ? auction.deployGas : '-'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination intégrée */}
      <div className="border-t border-border-subtle px-4 py-3">
        <Pagination
          total={total}
          page={currentPage - 1}
          rowsPerPage={pageSize}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPageOptions={[5, 10, 15, 20]}
        />
      </div>
    </div>
  );
}
