"use client";

import { useState } from "react";
import { useXp } from "@/services/xp";
import { cn } from "@/lib/utils";
import { Star, Flame, ChevronRight, Loader2 } from "lucide-react";
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
        <Loader2 className="h-4 w-4 animate-spin text-[#F9E370]" />
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

  // Compact version for header/sidebar
  if (compact) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <button
            onClick={handleClick}
            className={cn(
              "flex items-center gap-2 px-2.5 py-1.5 rounded-lg",
              "bg-gradient-to-r from-[#F9E370]/10 to-purple-500/10",
              "border border-[#F9E370]/20 hover:border-[#F9E370]/40",
              "transition-all duration-200 hover:scale-105",
              "group cursor-pointer",
              className
            )}
          >
            {/* Level badge */}
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 text-[#F9E370] fill-[#F9E370]" />
              <span className="text-xs font-bold text-[#F9E370]">
                {displayStats.level}
              </span>
            </div>

            {/* Mini progress */}
            <div className="w-12 h-1.5 bg-[#0A0D12] rounded-full overflow-hidden border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-[#F9E370] to-purple-500 transition-all duration-500"
                style={{ width: `${displayStats.progressPercent}%` }}
              />
            </div>

            {/* Streak */}
            {showStreak && displayStats.loginStreak > 0 && (
              <div className="flex items-center gap-0.5">
                <Flame className="h-3 w-3 text-orange-500" />
                <span className="text-xs font-medium text-orange-400">
                  {displayStats.loginStreak}
                </span>
              </div>
            )}
          </button>
        </DialogTrigger>

        <DialogContent className="bg-[#151A25] border border-white/10 rounded-2xl shadow-xl shadow-black/20 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Star className="h-5 w-5 text-[#F9E370] fill-[#F9E370]" />
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
        "bg-[#151A25]/60 backdrop-blur-md",
        "border border-white/5 hover:border-white/10 transition-all",
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
            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-[#F9E370] to-purple-500 p-0.5">
              <div className="h-full w-full rounded-full bg-[#151A25] flex items-center justify-center">
                <span className="text-xl font-bold text-[#F9E370]">
                  {stats.level}
                </span>
              </div>
            </div>
            {/* Level glow effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#F9E370]/20 to-purple-500/20 blur-md -z-10" />
          </div>
          <div>
            <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Level</p>
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
                  stats.loginStreak > 0 ? "text-orange-500" : "text-zinc-600"
                )}
              />
              <span
                className={cn(
                  "text-lg font-bold",
                  stats.loginStreak > 0 ? "text-orange-400" : "text-zinc-500"
                )}
              >
                {stats.loginStreak}
              </span>
            </div>
            <p className="text-xs text-zinc-500">day streak</p>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-zinc-400">
            Level {stats.level} → {stats.level + 1}
          </span>
          <span className="text-[#F9E370] font-medium">{stats.progressPercent}%</span>
        </div>
        <Progress
          value={stats.progressPercent}
          className="h-2 bg-[#0A0D12] border border-white/5"
        />
        <div className="flex justify-between text-xs text-zinc-500">
          <span>{stats.currentLevelXp.toLocaleString()} XP</span>
          <span>{stats.nextLevelXp.toLocaleString()} XP</span>
        </div>
      </div>

      {/* XP to next level */}
      <div className="flex items-center justify-between p-3 bg-[#0A0D12] rounded-xl border border-white/5">
        <span className="text-sm text-zinc-400">XP to next level</span>
        <div className="flex items-center gap-1">
          <span className="text-sm font-bold text-[#F9E370]">
            {stats.xpToNextLevel.toLocaleString()}
          </span>
          <ChevronRight className="h-4 w-4 text-zinc-500" />
        </div>
      </div>
    </div>
  );
}
