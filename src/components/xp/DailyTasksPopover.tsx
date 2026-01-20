"use client";

import { useXpContext } from "@/services/xp";
import { cn } from "@/lib/utils";
import { 
  CheckCircle2, 
  Circle, 
  Gift,
  ChevronRight,
  Loader2
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Link from "next/link";

interface DailyTasksPopoverProps {
  className?: string;
}

export function DailyTasksPopover({ className }: DailyTasksPopoverProps) {
  const {
    dailyTasks,
    allDailyTasksCompleted,
    dailyBonusXp,
    dailyBonusClaimed,
    dailyTasksCompletedCount,
    isLoading,
  } = useXpContext();

  if (isLoading && dailyTasks.length === 0) {
    return (
      <div className={cn("flex items-center gap-1.5", className)}>
        <Loader2 className="h-3 w-3 animate-spin text-text-muted" />
      </div>
    );
  }

  // Don't show if no tasks loaded
  if (dailyTasks.length === 0) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button 
          className={cn(
            "flex items-center gap-2 w-full px-2 py-1.5 rounded-lg",
            "bg-white/5 hover:bg-white/10 border border-border-subtle hover:border-border-hover",
            "transition-all duration-200 group",
            className
          )}
        >
          {/* 4 dots indicator */}
          <div className="flex items-center gap-0.5">
            {dailyTasks.map((task) => (
              <div
                key={task.type}
                className={cn(
                  "h-2 w-2 rounded-full transition-colors",
                  task.completed 
                    ? "bg-emerald-400" 
                    : "bg-zinc-600 group-hover:bg-zinc-500"
                )}
              />
            ))}
          </div>
          
          {/* Count */}
          <span className="text-label text-text-secondary group-hover:text-white/80">
            {dailyTasksCompletedCount}/{dailyTasks.length}
          </span>

          {/* Bonus indicator if not all completed */}
          {!allDailyTasksCompleted && !dailyBonusClaimed && (
            <span className="text-label text-[#F9E370]">
              +{dailyBonusXp}
            </span>
          )}

          {/* Checkmark if all done */}
          {allDailyTasksCompleted && (
            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent 
        side="right" 
        align="end"
        sideOffset={8}
        className="w-72 p-0 bg-brand-secondary border border-border-hover rounded-xl shadow-xl shadow-black/40"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <span className="text-sm font-semibold text-white">Daily Tasks</span>
          </div>
          <span className="text-xs text-text-secondary">
            {dailyTasksCompletedCount}/{dailyTasks.length}
          </span>
        </div>

        {/* Tasks list */}
        <div className="p-2 space-y-1">
          {dailyTasks.map((task) => {
            return (
              <div
                key={task.type}
                className={cn(
                  "flex items-center gap-2.5 p-2 rounded-lg transition-colors",
                  task.completed 
                    ? "bg-emerald-500/10" 
                    : "bg-white/5"
                )}
              >
                {/* Status icon */}
                {task.completed ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 text-text-muted shrink-0" />
                )}

                {/* Task info */}
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-xs",
                    task.completed ? "text-emerald-300" : "text-white/80"
                  )}>
                    {task.description}
                  </p>
                </div>

                {/* XP */}
                <span className={cn(
                  "text-label shrink-0",
                  task.completed ? "text-emerald-400" : "text-text-muted"
                )}>
                  +{task.xp}
                </span>
              </div>
            );
          })}
        </div>

        {/* Bonus section */}
        <div className="px-3 pb-3">
          {!dailyBonusClaimed ? (
            <div className={cn(
              "flex items-center gap-2 p-2 rounded-lg",
              allDailyTasksCompleted 
                ? "bg-[#F9E370]/20 border border-[#F9E370]/30" 
                : "bg-white/5 border border-border-subtle"
            )}>
              <Gift className={cn(
                "h-4 w-4",
                allDailyTasksCompleted ? "text-[#F9E370]" : "text-text-muted"
              )} />
              <span className={cn(
                "text-xs",
                allDailyTasksCompleted ? "text-[#F9E370] font-medium" : "text-text-secondary"
              )}>
                {allDailyTasksCompleted 
                  ? `Bonus unlocked! +${dailyBonusXp} XP` 
                  : `Complete all for +${dailyBonusXp} XP`
                }
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span className="text-xs text-emerald-300 font-medium">
                Bonus claimed! +{dailyBonusXp} XP
              </span>
            </div>
          )}
        </div>

        {/* Link to full missions page */}
        <div className="border-t border-border-subtle">
          <Link
            href="/profile?tab=missions"
            className="flex items-center justify-between p-3 text-xs text-text-secondary hover:text-white hover-subtle"
          >
            <span>See Weekly Challenges</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}

