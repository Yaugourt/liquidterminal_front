"use client";

import { useEffect } from "react";
import { useXp, XpTransaction, XP_ACTION_LABELS } from "@/services/xp";
import { cn } from "@/lib/utils";
import {
  Gift,
  CalendarCheck,
  Flame,
  Users,
  BookPlus,
  BookOpenCheck,
  Copy,
  Wallet,
  Send,
  CheckCircle,
  Loader2,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface XpHistoryListProps {
  transactions?: XpTransaction[];
  className?: string;
  maxItems?: number;
}

const ACTION_ICONS: Record<string, React.ElementType> = {
  REGISTRATION: Gift,
  DAILY_LOGIN: CalendarCheck,
  LOGIN_STREAK_7: Flame,
  LOGIN_STREAK_30: Flame,
  REFERRAL_SUCCESS: Users,
  CREATE_READLIST: BookPlus,
  MARK_RESOURCE_READ: BookOpenCheck,
  COPY_PUBLIC_READLIST: Copy,
  CREATE_WALLETLIST: Wallet,
  ADD_WALLET_TO_LIST: Wallet,
  SUBMIT_PUBLIC_GOOD: Send,
  PUBLIC_GOOD_APPROVED: CheckCircle,
};

const ACTION_COLORS: Record<string, string> = {
  REGISTRATION: "text-purple-400 bg-purple-400/10",
  DAILY_LOGIN: "text-emerald-400 bg-emerald-400/10",
  LOGIN_STREAK_7: "text-orange-400 bg-orange-400/10",
  LOGIN_STREAK_30: "text-orange-500 bg-orange-500/10",
  REFERRAL_SUCCESS: "text-blue-400 bg-blue-400/10",
  CREATE_READLIST: "text-cyan-400 bg-cyan-400/10",
  MARK_RESOURCE_READ: "text-teal-400 bg-teal-400/10",
  COPY_PUBLIC_READLIST: "text-indigo-400 bg-indigo-400/10",
  CREATE_WALLETLIST: "text-brand-accent bg-brand-accent/10",
  ADD_WALLET_TO_LIST: "text-brand-accent bg-brand-accent/10",
  SUBMIT_PUBLIC_GOOD: "text-amber-400 bg-amber-400/10",
  PUBLIC_GOOD_APPROVED: "text-[#F9E370] bg-[#F9E370]/10",
};

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function XpHistoryList({
  transactions: externalTransactions,
  className,
  maxItems,
}: XpHistoryListProps) {
  const {
    history: hookHistory,
    isLoadingHistory,
    refetchHistory,
    historyPagination,
  } = useXp();

  // Use external transactions if provided, otherwise use hook data
  const transactions = externalTransactions || hookHistory;
  const displayTransactions = maxItems
    ? transactions.slice(0, maxItems)
    : transactions;

  // Fetch history on mount if using hook data
  useEffect(() => {
    if (!externalTransactions && hookHistory.length === 0) {
      refetchHistory();
    }
  }, [externalTransactions, hookHistory.length, refetchHistory]);

  return (
    <div className={cn("bg-brand-secondary/60 backdrop-blur-md border border-border-subtle rounded-2xl shadow-xl shadow-black/20 overflow-hidden", className)}>
      <div className="p-4 border-b border-border-subtle">
        <h3 className="flex items-center gap-2 text-white font-semibold">
          <History className="h-5 w-5 text-[#F9E370]" />
          XP History
        </h3>
      </div>
      <div className="p-4">
        {isLoadingHistory && transactions.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-brand-accent" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8">
            <History className="h-12 w-12 mx-auto mb-3 text-text-muted" />
            <p className="text-text-secondary">No XP activity yet</p>
            <p className="text-sm mt-1 text-text-muted">Start earning XP by using the platform!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              {displayTransactions.map((tx) => {
                const Icon = ACTION_ICONS[tx.actionType] || Gift;
                const colorClass = ACTION_COLORS[tx.actionType] || "text-text-secondary bg-zinc-400/10";
                const [textColor, bgColor] = colorClass.split(" ");

                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 bg-brand-dark rounded-xl border border-border-subtle hover:border-border-hover transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "h-9 w-9 rounded-lg flex items-center justify-center",
                          bgColor
                        )}
                      >
                        <Icon className={cn("h-4 w-4", textColor)} />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-white">
                          {XP_ACTION_LABELS[tx.actionType] || tx.actionType}
                        </p>
                        {tx.description && (
                          <p className="text-xs text-text-muted truncate max-w-[200px]">
                            {tx.description}
                          </p>
                        )}
                        <p className="text-xs text-text-muted">
                          {formatRelativeTime(tx.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-[#F9E370]">
                        +{tx.xpAmount}
                      </span>
                      <span className="text-xs text-text-muted ml-1">XP</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination / Load more */}
            {!externalTransactions &&
              historyPagination &&
              historyPagination.page < historyPagination.totalPages && (
                <Button
                  variant="outline"
                  className="w-full border-border-subtle hover:bg-white/5 text-white/80 rounded-lg"
                  onClick={() => refetchHistory(historyPagination.page + 1)}
                  disabled={isLoadingHistory}
                >
                  {isLoadingHistory ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Load More
                </Button>
              )}
          </div>
        )}
      </div>
    </div>
  );
}
