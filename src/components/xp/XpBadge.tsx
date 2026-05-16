"use client";

import { useState } from "react";
import { useXp } from "@/services/xp";
import { cn } from "@/lib/utils";
import { Star, Flame, ChevronRight } from "lucide-react";
import { InlineSpinner } from "@/components/ui/inline-spinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

interface XpBadgeProps {
  compact?: boolean;
  showStreak?: boolean;
  onClick?: () => void;
  className?: string;
}

// Default stats for users without XP data yet
const DEFAULT_STATS = {
  totalXp: 0,
  level: 1,
  currentLevelXp: 0,
  nextLevelXp: 100,
  progressPercent: 0,
  xpToNextLevel: 100,
  loginStreak: 0,
  lastLoginAt: null,
};

export function XpBadge({
  compact = false,
  showStreak = true,
  onClick,
  className,
}: XpBadgeProps) {
  const { stats, isLoading } = useXp();
  const [isOpen, setIsOpen] = useState(false);

  // Use default stats if no stats available
  const displayStats = stats || DEFAULT_STATS;

  if (isLoading && !stats) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <InlineSpinner className="text-brand-gold" />
      </div>
    );
  }

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      setIsOpen(true);
    }
  };

  // Compact version for header/sidebar — V4 `.header-stat` chip
  if (compact) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <button
            onClick={handleClick}
            className={cn(
              "h-8 inline-flex items-center gap-1.5 px-2.5 rounded-md",
              "bg-surface-2 border border-border-subtle hover:bg-surface-3",
              "transition-colors cursor-pointer",
              className
            )}
          >
            {/* Level */}
            <Star className="h-3 w-3 text-gold fill-gold" />
            <span className="mono text-[12px] font-medium text-text-primary">
              {displayStats.level}
            </span>

            {/* Streak */}
            {showStreak && (
              <>
                <Flame
                  className={cn(
                    "h-3 w-3",
                    displayStats.loginStreak > 0 ? "text-warning" : "text-text-tertiary"
                  )}
                />
                <span className="mono text-[12px] font-medium text-text-primary">
                  {displayStats.loginStreak}
                </span>
              </>
            )}
          </button>
        </DialogTrigger>

        <DialogContent className="bg-surface border border-border-default rounded-xl text-text-primary max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Star className="h-5 w-5 text-brand-gold fill-brand-gold" />
              Your Progress
            </DialogTitle>
          </DialogHeader>
          <XpBadgeContent stats={displayStats} />
        </DialogContent>
      </Dialog>
    );
  }

  // Full version
  return (
    <div
      className={cn(
        "p-6 rounded-2xl",
        "bg-brand-secondary/60 backdrop-blur-md",
        "border border-border-subtle hover:border-border-hover transition-all",
        "shadow-xl shadow-black/20",
        className
      )}
    >
      <XpBadgeContent stats={displayStats} showStreak={showStreak} />
    </div>
  );
}

interface XpBadgeContentProps {
  stats: {
    totalXp: number;
    level: number;
    currentLevelXp: number;
    nextLevelXp: number;
    progressPercent: number;
    xpToNextLevel: number;
    loginStreak: number;
    lastLoginAt: string | null;
  };
  showStreak?: boolean;
}

function XpBadgeContent({ stats, showStreak = true }: XpBadgeContentProps) {
  return (
    <div className="space-y-4">
      {/* Level display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-brand-gold to-purple-500 p-0.5">
              <div className="h-full w-full rounded-full bg-brand-secondary flex items-center justify-center">
                <span className="text-xl font-bold text-brand-gold">
                  {stats.level}
                </span>
              </div>
            </div>
            {/* Level glow effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-brand-gold/20 to-purple-500/20 blur-md -z-10" />
          </div>
          <div>
            <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Level</p>
            <p className="text-lg font-bold text-white">
              {stats.totalXp.toLocaleString()} XP
            </p>
          </div>
        </div>

        {/* Streak */}
        {showStreak && (
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end">
              <Flame
                className={cn(
                  "h-5 w-5",
                  stats.loginStreak > 0 ? "text-orange-500" : "text-text-muted"
                )}
              />
              <span
                className={cn(
                  "text-lg font-bold",
                  stats.loginStreak > 0 ? "text-orange-400" : "text-text-muted"
                )}
              >
                {stats.loginStreak}
              </span>
            </div>
            <p className="text-xs text-text-muted">day streak</p>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-text-secondary">
            Level {stats.level} → {stats.level + 1}
          </span>
          <span className="text-brand-gold font-medium">{stats.progressPercent}%</span>
        </div>
        <Progress
          value={stats.progressPercent}
          className="h-2 bg-brand-dark border border-border-subtle"
        />
        <div className="flex justify-between text-xs text-text-muted">
          <span>{stats.currentLevelXp.toLocaleString()} XP</span>
          <span>{stats.nextLevelXp.toLocaleString()} XP</span>
        </div>
      </div>

      {/* XP to next level */}
      <div className="flex items-center justify-between p-3 bg-brand-dark rounded-xl border border-border-subtle">
        <span className="text-sm text-text-secondary">XP to next level</span>
        <div className="flex items-center gap-1">
          <span className="text-sm font-bold text-brand-gold">
            {stats.xpToNextLevel.toLocaleString()}
          </span>
          <ChevronRight className="h-4 w-4 text-text-muted" />
        </div>
      </div>
    </div>
  );
}
