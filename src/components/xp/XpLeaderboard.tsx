"use client";

import { useEffect, useRef } from "react";
import { useXpLeaderboard, useXpContext, xpService } from "@/services/xp";
import { cn } from "@/lib/utils";
import { Trophy, Medal, Crown, User } from "lucide-react";
import { InlineSpinner } from "@/components/ui/inline-spinner";
import { LoadingState } from "@/components/ui/loading-state";
import { Button } from "@/components/ui/button";
import { usePrivy } from "@privy-io/react-auth";
import { showXpGainToast } from "./XpNotification";

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
  const { authenticated } = usePrivy();
  const { refetchDailyTasks, refetchAll } = useXpContext();
  const {
    leaderboard,
    userRank,
    total,
    isLoading,
    loadMore,
    hasMore,
  } = useXpLeaderboard(limit);

  // Track if we've already triggered the daily task this session
  const hasTriggeredExplore = useRef(false);

  // Trigger EXPLORE_LEADERBOARD daily task when authenticated user views leaderboard
  useEffect(() => {
    if (!authenticated || hasTriggeredExplore.current) return;
    
    hasTriggeredExplore.current = true;

    const triggerExploreTask = async () => {
      try {
        const result = await xpService.completeDailyTask('EXPLORE_LEADERBOARD');
        
        // Show notification if XP was granted
        if (result.xpGranted > 0) {
          showXpGainToast(result.xpGranted, 'Explored leaderboard');
        }
        
        // Show bonus notification if all tasks completed
        if (result.bonusGranted > 0) {
          setTimeout(() => {
            showXpGainToast(result.bonusGranted, 'All daily tasks completed!');
          }, 500);
        }

        // Refetch XP data
        await refetchAll();
      } catch (err) {
        console.error('Failed to trigger explore leaderboard task:', err);
      }
    };

    triggerExploreTask();
  }, [authenticated, refetchDailyTasks, refetchAll]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-amber-400" />;
      case 2:
        return <Medal className="h-5 w-5 text-text-secondary" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return (
          <span className="w-5 text-center text-sm font-bold text-text-tertiary">
            {rank}
          </span>
        );
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-amber-500/10 to-amber-400/10 border-amber-500/30";
      case 2:
        return "bg-gradient-to-r from-zinc-400/10 to-zinc-300/10 border-zinc-400/30";
      case 3:
        return "bg-gradient-to-r from-amber-600/10 to-orange-500/10 border-amber-600/30";
      default:
        return "bg-base border-border-subtle";
    }
  };

  return (
    <div className={cn("bg-surface/60 border border-border-subtle rounded-2xl overflow-hidden", className)}>
      <div className="p-4 border-b border-border-subtle">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-text-primary font-semibold">
            <Trophy className="h-5 w-5 text-gold" />
            Leaderboard
          </h3>
          <span className="text-sm font-normal text-text-secondary">
            {total} players
          </span>
        </div>
      </div>
      <div className="p-4">
        {isLoading && leaderboard.length === 0 ? (
          <div className="py-12">
            <LoadingState size="md" withCard={false} />
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
                    <div className="h-8 w-8 rounded-lg bg-surface border border-border-subtle flex items-center justify-center">
                      <User className="h-4 w-4 text-text-secondary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-text-primary">{entry.name}</p>
                      <p className="text-xs text-text-tertiary">Level {entry.level}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gold">
                      {entry.totalXp.toLocaleString()}
                    </p>
                    <p className="text-xs text-text-tertiary">XP</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Current user rank (if not in visible list) */}
            {showCurrentUser && userRank && userRank > leaderboard.length && (
              <div className="pt-4 border-t border-border-subtle">
                <p className="text-xs text-text-tertiary mb-2">Your position</p>
                <div className="flex items-center justify-between p-3 rounded-lg bg-brand/10 border border-brand/30">
                  <div className="flex items-center gap-3">
                    <span className="w-5 text-center text-sm font-bold text-brand">
                      #{userRank}
                    </span>
                    <div className="h-8 w-8 rounded-lg bg-brand/20 flex items-center justify-center">
                      <User className="h-4 w-4 text-brand" />
                    </div>
                    <span className="font-medium text-sm text-brand">You</span>
                  </div>
                </div>
              </div>
            )}

            {/* Load more button */}
            {hasMore && (
              <Button
                variant="outline"
                className="w-full border-border-subtle hover:bg-white/5 text-text-secondary rounded-lg"
                onClick={loadMore}
                disabled={isLoading}
              >
                {isLoading ? (
                  <InlineSpinner className="mr-2" />
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
