"use client";

import { useState } from "react";
import Link from "next/link";
import { useActiveUsers } from "@/services/market/activeusers";
import { formatLargeNumber } from "@/lib/formatters/numberFormatting";
import { Loader2, Users } from "lucide-react";
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

/**
 * Composant preview des utilisateurs actifs pour la home page du tracker
 * Affiche les utilisateurs les plus actifs avec filtres de période
 */
export function ActiveUsersPreview() {
  const [hours, setHours] = useState(24);
  const { users, metadata, isLoading, error, refetch } = useActiveUsers({
    hours,
    limit: 10
  });

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
    <div className="glass-panel rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-accent/10 rounded-lg">
            <Users className="h-5 w-5 text-brand-accent" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Active Users</h2>
            <p className="text-text-muted text-sm">Most active traders</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Timeframe selector */}
          <Select value={hours.toString()} onValueChange={(val) => setHours(Number(val))}>
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
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
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
              <TableHead className="py-3 px-4 text-right">
                <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">
                  Fills
                </span>
              </TableHead>
              <TableHead className="py-3 px-4 text-right">
                <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">
                  Volume
                </span>
              </TableHead>
              <TableHead className="py-3 px-4 text-right">
                <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">
                  Coins
                </span>
              </TableHead>
              <TableHead className="py-3 px-4 text-right">
                <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">
                  Last Active
                </span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-text-muted">
                  No active users data available
                </TableCell>
              </TableRow>
            ) : (
              users.map((user, index) => (
                <TableRow
                  key={user.user}
                  className="border-b border-border-subtle hover:bg-white/5 transition-colors"
                >
                  <TableCell className="py-3 px-4 text-sm text-white">
                    <div className="flex items-center gap-2">
                      <span className="text-brand-gold font-semibold">#{index + 1}</span>
                    </div>
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

      {/* Footer with metadata */}
      {metadata && (
        <div className="px-6 py-3 border-t border-border-subtle flex items-center justify-between text-xs text-text-muted">
          <span>
            Showing {users.length} of {metadata.totalCount} users
          </span>
          <span>
            Updated {new Date(metadata.cachedAt).toLocaleTimeString()}
          </span>
        </div>
      )}
    </div>
  );
}
