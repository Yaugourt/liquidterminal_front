"use client";

import { useXpLeaderboard } from "@/services/xp";
import { cn } from "@/lib/utils";
import { Trophy, Medal, Crown, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface XpLeaderboardProps {
  limit?: number;
  showCurrentUser?: boolean;
  className?: string;
}

export function XpLeaderboard({
  limit = 10,
  showCurrentUser = true,
  className,
}: XpLeaderboardProps) {
  const {
    leaderboard,
    userRank,
    total,
    isLoading,
    loadMore,
    hasMore,
  } = useXpLeaderboard(limit);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-400" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-300" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return (
          <span className="w-5 text-center text-sm font-bold text-gray-500">
            {rank}
          </span>
        );
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-yellow-500/30";
      case 2:
        return "bg-gradient-to-r from-gray-400/10 to-gray-300/10 border-gray-400/30";
      case 3:
        return "bg-gradient-to-r from-amber-600/10 to-orange-500/10 border-amber-600/30";
      default:
        return "bg-[#0b1d30] border-[#1e293b50]";
    }
  };

  return (
    <Card className={cn("bg-[#051728] border-[#1e293b] text-white", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-[#f9e370]" />
            Leaderboard
          </div>
          <span className="text-sm font-normal text-gray-400">
            {total} players
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && leaderboard.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#f9e370]" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Leaderboard list */}
            <div className="space-y-2">
              {leaderboard.map((entry) => (
                <div
                  key={entry.userId}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border transition-all",
                    getRankBg(entry.rank),
                    entry.rank <= 3 && "hover:scale-[1.02]"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {getRankIcon(entry.rank)}
                    <div className="h-8 w-8 rounded-full bg-[#1e293b] flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{entry.name}</p>
                      <p className="text-xs text-gray-500">Level {entry.level}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#f9e370]">
                      {entry.totalXp.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">XP</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Current user rank (if not in visible list) */}
            {showCurrentUser && userRank && userRank > leaderboard.length && (
              <div className="pt-4 border-t border-[#1e293b]">
                <p className="text-xs text-gray-500 mb-2">Your position</p>
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#83E9FF10] border border-[#83E9FF30]">
                  <div className="flex items-center gap-3">
                    <span className="w-5 text-center text-sm font-bold text-[#83E9FF]">
                      #{userRank}
                    </span>
                    <div className="h-8 w-8 rounded-full bg-[#83E9FF20] flex items-center justify-center">
                      <User className="h-4 w-4 text-[#83E9FF]" />
                    </div>
                    <span className="font-medium text-sm text-[#83E9FF]">You</span>
                  </div>
                </div>
              </div>
            )}

            {/* Load more button */}
            {hasMore && (
              <Button
                variant="outline"
                className="w-full border-[#1e293b] hover:bg-[#0b1d30] text-gray-300"
                onClick={loadMore}
                disabled={isLoading}
              >
                {isLoading ? (
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

