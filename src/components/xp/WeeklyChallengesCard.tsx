"use client";

import { memo } from "react";

import { useXpContext } from "@/services/xp";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  BookOpen,
  ListPlus,
  CalendarCheck,
  Wallet,
  Clock,
  Trophy,
  Loader2,
  Star
} from "lucide-react";
import { WeeklyChallengeType } from "@/services/xp/types";
import { Progress } from "@/components/ui/progress";

interface WeeklyChallengesCardProps {
  compact?: boolean;
  className?: string;
}

const CHALLENGE_ICONS: Record<WeeklyChallengeType, React.ElementType> = {
  READ_20_RESOURCES: BookOpen,
  CREATE_5_READLISTS: ListPlus,
  LOGIN_7_DAYS: CalendarCheck,
  ADD_15_WALLETS: Wallet,
};

const CHALLENGE_COLORS: Record<WeeklyChallengeType, { text: string; bg: string; border: string }> = {
  READ_20_RESOURCES: {
    text: "text-cyan-400",
    bg: "bg-cyan-500/20",
    border: "border-cyan-500/30"
  },
  CREATE_5_READLISTS: {
    text: "text-purple-400",
    bg: "bg-purple-500/20",
    border: "border-purple-500/30"
  },
  LOGIN_7_DAYS: {
    text: "text-emerald-400",
    bg: "bg-emerald-500/20",
    border: "border-emerald-500/30"
  },
  ADD_15_WALLETS: {
    text: "text-brand-accent",
    bg: "bg-brand-accent/20",
    border: "border-brand-accent/30"
  },
};

export const WeeklyChallengesCard = memo(function WeeklyChallengesCard({ compact = false, className }: WeeklyChallengesCardProps) {
  const {
    weeklyChallenges,
    timeUntilWeeklyReset,
    isLoading,
  } = useXpContext();

  const completedCount = weeklyChallenges.filter(c => c.completed).length;
  const totalXpAvailable = weeklyChallenges.reduce((sum, c) => sum + c.xpReward, 0);
  const totalXpEarned = weeklyChallenges.filter(c => c.completed).reduce((sum, c) => sum + c.xpReward, 0);

  if (isLoading && weeklyChallenges.length === 0) {
    return (
      <div className={cn("flex items-center justify-center p-4", className)}>
        <Loader2 className="h-5 w-5 animate-spin text-[#F9E370]" />
      </div>
    );
  }

  // Compact version
  if (compact) {
    return (
      <div className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg",
        "bg-brand-secondary/60 border border-border-subtle",
        className
      )}>
        <Trophy className="h-4 w-4 text-[#F9E370]" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-secondary">Weekly</span>
            <span className="text-xs text-[#F9E370] font-medium">{completedCount}/{weeklyChallenges.length}</span>
          </div>
          <div className="h-1.5 bg-brand-dark rounded-full overflow-hidden mt-1">
            <div
              className="h-full bg-gradient-to-r from-[#F9E370] to-purple-500 transition-all"
              style={{ width: `${(completedCount / Math.max(weeklyChallenges.length, 1)) * 100}%` }}
            />
          </div>
        </div>
        {timeUntilWeeklyReset && (
          <div className="flex items-center gap-1 text-xs text-text-muted">
            <Clock className="h-3 w-3" />
            {timeUntilWeeklyReset}
          </div>
        )}
      </div>
    );
  }

  // Full version
  return (
    <div className={cn(
      "p-5 rounded-2xl",
      "bg-brand-secondary/60 backdrop-blur-md",
      "border border-border-subtle",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#F9E370]/20 to-purple-500/20 flex items-center justify-center border border-[#F9E370]/30">
            <Trophy className="h-4 w-4 text-[#F9E370]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Weekly Challenges</h3>
            <p className="text-xs text-text-muted">{completedCount}/{weeklyChallenges.length} completed</p>
          </div>
        </div>

        {/* Timer */}
        {timeUntilWeeklyReset && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-border-hover">
            <Clock className="h-3.5 w-3.5 text-text-secondary" />
            <span className="text-xs text-text-secondary">Resets in {timeUntilWeeklyReset}</span>
          </div>
        )}
      </div>

      {/* XP Summary */}
      <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-brand-dark border border-border-subtle">
        <Star className="h-4 w-4 text-[#F9E370]" />
        <span className="text-sm text-text-secondary">XP Earned:</span>
        <span className="text-sm font-bold text-[#F9E370]">{totalXpEarned}</span>
        <span className="text-sm text-text-muted">/ {totalXpAvailable}</span>
      </div>

      {/* Challenges list */}
      <div className="space-y-3">
        {weeklyChallenges.map((challenge) => {
          const Icon = CHALLENGE_ICONS[challenge.type];
          const colors = CHALLENGE_COLORS[challenge.type];

          return (
            <div
              key={challenge.type}
              className={cn(
                "p-4 rounded-xl transition-all",
                challenge.completed
                  ? "bg-emerald-500/10 border border-emerald-500/20"
                  : "bg-white/5 border border-border-subtle"
              )}
            >
              <div className="flex items-center gap-3 mb-3">
                {/* Icon */}
                <div className={cn(
                  "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
                  challenge.completed ? "bg-emerald-500/20" : colors.bg,
                  "border",
                  challenge.completed ? "border-emerald-500/30" : colors.border
                )}>
                  <Icon className={cn(
                    "h-5 w-5",
                    challenge.completed ? "text-emerald-400" : colors.text
                  )} />
                </div>

                {/* Challenge info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className={cn(
                      "text-sm font-medium",
                      challenge.completed ? "text-emerald-300" : "text-white"
                    )}>
                      {challenge.description}
                    </p>
                    {challenge.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                    ) : (
                      <span className="text-xs font-bold text-[#F9E370] shrink-0">
                        +{challenge.xpReward} XP
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs text-text-muted">
                    <span>{challenge.progress}/{challenge.target}</span>
                    <span>{challenge.progressPercent}%</span>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <Progress
                value={challenge.progressPercent}
                className={cn(
                  "h-2 bg-brand-dark border border-border-subtle",
                  challenge.completed && "[&>div]:bg-emerald-500"
                )}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
});

