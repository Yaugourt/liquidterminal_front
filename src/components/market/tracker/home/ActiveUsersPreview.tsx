"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useActiveUsers } from "@/services/market/activeusers";
import { formatLargeNumber } from "@/lib/formatters/numberFormatting";
import { Loader2, Users, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ActiveUser } from "@/services/market/activeusers";

const ITEMS_PER_PAGE = 10;

type SortField = 'fill_count' | 'total_volume' | 'unique_coins' | 'last_activity';
type SortDirection = 'asc' | 'desc';

interface ColumnSort {
  field: SortField | null;
  direction: SortDirection;
}

/**
 * Composant Active Users avec pagination et tri par colonnes
 */
export function ActiveUsersPreview() {
  const [hours, setHours] = useState(24);
  const [page, setPage] = useState(1);
  const [columnSort, setColumnSort] = useState<ColumnSort>({ field: null, direction: 'desc' });

  const { users, metadata, isLoading, error, refetch } = useActiveUsers({
    hours,
    limit: 100
  });

  // Sort users locally based on column click
  const sortedUsers = useMemo(() => {
    if (!columnSort.field) return users;

    return [...users].sort((a, b) => {
      let aVal: number | string;
      let bVal: number | string;

      if (columnSort.field === 'last_activity') {
        aVal = new Date(a.last_activity).getTime();
        bVal = new Date(b.last_activity).getTime();
      } else {
        aVal = a[columnSort.field as keyof ActiveUser] as number;
        bVal = b[columnSort.field as keyof ActiveUser] as number;
      }

      if (columnSort.direction === 'asc') {
        return (aVal as number) - (bVal as number);
      }
      return (bVal as number) - (aVal as number);
    });
  }, [users, columnSort]);

  // Pagination logic
  const totalPages = Math.ceil(sortedUsers.length / ITEMS_PER_PAGE);
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const paginatedUsers = sortedUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset page when hours changes
  const handleHoursChange = (newHours: number) => {
    setHours(newHours);
    setPage(1);
    setColumnSort({ field: null, direction: 'desc' });
  };

  // Handle column sort click
  const handleColumnSort = (field: SortField) => {
    setPage(1);
    if (columnSort.field === field) {
      if (columnSort.direction === 'desc') {
        setColumnSort({ field, direction: 'asc' });
      } else {
        setColumnSort({ field: null, direction: 'desc' });
      }
    } else {
      setColumnSort({ field, direction: 'desc' });
    }
  };

  // Get sort icon for column
  const getSortIcon = (field: SortField) => {
    if (columnSort.field !== field) {
      return <ArrowUpDown className="h-3 w-3 ml-1 opacity-50" />;
    }
    if (columnSort.direction === 'desc') {
      return <ArrowDown className="h-3 w-3 ml-1 text-brand-accent" />;
    }
    return <ArrowUp className="h-3 w-3 ml-1 text-brand-accent" />;
  };

  // Sortable column header component
  const SortableHeader = ({ field, children, align = 'left' }: { field: SortField; children: React.ReactNode; align?: 'left' | 'right' }) => (
    <TableHead className={`py-3 px-4 ${align === 'right' ? 'text-right' : ''}`}>
      <button
        onClick={() => handleColumnSort(field)}
        className={`inline-flex items-center gap-0.5 text-text-secondary text-[10px] font-semibold uppercase tracking-wider hover:text-white transition-colors ${
          columnSort.field === field ? 'text-brand-accent' : ''
        }`}
      >
        {children}
        {getSortIcon(field)}
      </button>
    </TableHead>
  );

  // Format relative time
  const formatRelativeTime = (isoDate: string) => {
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px] glass-panel rounded-2xl">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-brand-accent" />
          <span className="text-text-muted text-sm">Loading active users...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="glass-panel rounded-2xl p-6">
        <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-4 text-center">
          <p className="text-rose-400 text-sm mb-3">Failed to load active users</p>
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            className="border-rose-500/50 text-rose-400 hover:bg-rose-500/10"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-accent/10 rounded-lg">
            <Users className="h-5 w-5 text-brand-accent" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Active Users</h2>
            <p className="text-text-muted text-sm">
              {metadata?.totalCount || users.length} users
            </p>
          </div>
        </div>
        <Select value={hours.toString()} onValueChange={(val) => handleHoursChange(Number(val))}>
          <SelectTrigger className="w-[120px] bg-brand-secondary/40 border-border-subtle text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Last 1h</SelectItem>
            <SelectItem value="4">Last 4h</SelectItem>
            <SelectItem value="12">Last 12h</SelectItem>
            <SelectItem value="24">Last 24h</SelectItem>
            <SelectItem value="168">Last 7d</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border-subtle hover:bg-transparent">
              <TableHead className="py-3 px-4">
                <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">
                  Rank
                </span>
              </TableHead>
              <TableHead className="py-3 px-4">
                <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">
                  Trader
                </span>
              </TableHead>
              <SortableHeader field="fill_count" align="right">Fills</SortableHeader>
              <SortableHeader field="total_volume" align="right">Volume</SortableHeader>
              <SortableHeader field="unique_coins" align="right">Coins</SortableHeader>
              <SortableHeader field="last_activity" align="right">Last Active</SortableHeader>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-text-muted">
                  No active users data available
                </TableCell>
              </TableRow>
            ) : (
              paginatedUsers.map((user, index) => (
                <TableRow
                  key={user.user}
                  className="border-b border-border-subtle hover:bg-white/5 transition-colors"
                >
                  <TableCell className="py-3 px-4 text-sm text-white">
                    <span className="text-brand-gold font-semibold">#{startIndex + index + 1}</span>
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <Link
                      href={`/market/tracker/wallet/${user.user}`}
                      className="text-sm text-brand-accent hover:underline font-mono"
                    >
                      {user.user.slice(0, 6)}...{user.user.slice(-4)}
                    </Link>
                  </TableCell>
                  <TableCell className="py-3 px-4 text-sm text-white text-right">
                    {formatLargeNumber(user.fill_count)}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-sm text-white text-right">
                    ${formatLargeNumber(user.total_volume)}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-sm text-white text-right">
                    {user.unique_coins}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-sm text-text-muted text-right">
                    {formatRelativeTime(user.last_activity)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="px-6 py-3 border-t border-border-subtle flex items-center justify-between">
          <span className="text-text-muted text-xs">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-8 w-8 p-0 text-text-muted hover:text-white disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant="ghost"
                    size="sm"
                    onClick={() => setPage(pageNum)}
                    className={`h-8 w-8 p-0 text-sm ${
                      pageNum === page
                        ? 'bg-brand-accent/20 text-brand-accent'
                        : 'text-text-muted hover:text-white'
                    }`}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="h-8 w-8 p-0 text-text-muted hover:text-white disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
