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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DAILY_LOGIN: "text-green-400 bg-green-400/10",
  LOGIN_STREAK_7: "text-orange-400 bg-orange-400/10",
  LOGIN_STREAK_30: "text-orange-500 bg-orange-500/10",
  REFERRAL_SUCCESS: "text-blue-400 bg-blue-400/10",
  CREATE_READLIST: "text-cyan-400 bg-cyan-400/10",
  MARK_RESOURCE_READ: "text-teal-400 bg-teal-400/10",
  COPY_PUBLIC_READLIST: "text-indigo-400 bg-indigo-400/10",
  CREATE_WALLETLIST: "text-[#83E9FF] bg-[#83E9FF]/10",
  ADD_WALLET_TO_LIST: "text-[#83E9FF] bg-[#83E9FF]/10",
  SUBMIT_PUBLIC_GOOD: "text-yellow-400 bg-yellow-400/10",
  PUBLIC_GOOD_APPROVED: "text-[#f9e370] bg-[#f9e370]/10",
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
    <Card className={cn("bg-[#051728] border-[#1e293b] text-white", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5 text-[#f9e370]" />
          XP History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoadingHistory && transactions.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#f9e370]" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <History className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No XP activity yet</p>
            <p className="text-sm mt-1">Start earning XP by using the platform!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              {displayTransactions.map((tx) => {
                const Icon = ACTION_ICONS[tx.actionType] || Gift;
                const colorClass = ACTION_COLORS[tx.actionType] || "text-gray-400 bg-gray-400/10";
                const [textColor, bgColor] = colorClass.split(" ");

                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 bg-[#0b1d30] rounded-lg border border-[#1e293b50] hover:border-[#1e293b] transition-colors"
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
                        <p className="font-medium text-sm">
                          {XP_ACTION_LABELS[tx.actionType] || tx.actionType}
                        </p>
                        {tx.description && (
                          <p className="text-xs text-gray-500 truncate max-w-[200px]">
                            {tx.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          {formatRelativeTime(tx.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-[#f9e370]">
                        +{tx.xpAmount}
                      </span>
                      <span className="text-xs text-gray-500 ml-1">XP</span>
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
                  className="w-full border-[#1e293b] hover:bg-[#0b1d30] text-gray-300"
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
      </CardContent>
    </Card>
  );
}

