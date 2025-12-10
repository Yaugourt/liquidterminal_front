"use client";

import { useXpContext } from "@/services/xp";
import { cn } from "@/lib/utils";
import { 
  CheckCircle2, 
  Circle, 
  LogIn, 
  BookOpen, 
  Wallet, 
  Trophy,
  Gift,
  Loader2
} from "lucide-react";
import { DailyTaskType } from "@/services/xp/types";

interface DailyTasksWidgetProps {
  compact?: boolean;
  className?: string;
}

const TASK_ICONS: Record<DailyTaskType, React.ElementType> = {
  LOGIN: LogIn,
  READ_RESOURCE: BookOpen,
  ADD_WALLET: Wallet,
  EXPLORE_LEADERBOARD: Trophy,
};

const TASK_COLORS: Record<DailyTaskType, string> = {
  LOGIN: "text-emerald-400",
  READ_RESOURCE: "text-cyan-400",
  ADD_WALLET: "text-brand-accent",
  EXPLORE_LEADERBOARD: "text-[#F9E370]",
};

export function DailyTasksWidget({ compact = false, className }: DailyTasksWidgetProps) {
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
      <div className={cn("flex items-center justify-center p-4", className)}>
        <Loader2 className="h-5 w-5 animate-spin text-[#F9E370]" />
      </div>
    );
  }

  // Compact version for sidebar/header
  if (compact) {
    return (
      <div className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg",
        "bg-brand-secondary/60 border border-white/5",
        className
      )}>
        <div className="flex items-center gap-1">
          {dailyTasks.map((task) => {
            const Icon = TASK_ICONS[task.type];
            return (
              <div
                key={task.type}
                className={cn(
                  "h-6 w-6 rounded-full flex items-center justify-center",
                  task.completed 
                    ? "bg-emerald-500/20 border border-emerald-500/40" 
                    : "bg-white/5 border border-white/10"
                )}
              >
                {task.completed ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Icon className={cn("h-3.5 w-3.5", TASK_COLORS[task.type], "opacity-50")} />
                )}
              </div>
            );
          })}
        </div>
        <span className="text-xs text-zinc-400">
          {dailyTasksCompletedCount}/{dailyTasks.length}
        </span>
        {!allDailyTasksCompleted && (
          <span className="text-xs text-[#F9E370]">+{dailyBonusXp} bonus</span>
        )}
      </div>
    );
  }

  // Full version
  return (
    <div className={cn(
      "p-5 rounded-2xl",
      "bg-brand-secondary/60 backdrop-blur-md",
      "border border-white/5",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center border border-emerald-500/30">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Daily Tasks</h3>
            <p className="text-xs text-zinc-500">{dailyTasksCompletedCount}/{dailyTasks.length} completed</p>
          </div>
        </div>
        
        {/* Bonus indicator */}
        {!dailyBonusClaimed && (
          <div className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full",
            allDailyTasksCompleted 
              ? "bg-[#F9E370]/20 border border-[#F9E370]/40 animate-pulse"
              : "bg-[#F9E370]/10 border border-[#F9E370]/20"
          )}>
            <Gift className="h-3.5 w-3.5 text-[#F9E370]" />
            <span className="text-xs font-bold text-[#F9E370]">+{dailyBonusXp} XP</span>
          </div>
        )}
        {dailyBonusClaimed && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-400">Bonus claimed!</span>
          </div>
        )}
      </div>

      {/* Tasks list */}
      <div className="space-y-2">
        {dailyTasks.map((task) => {
          const Icon = TASK_ICONS[task.type];
          return (
            <div
              key={task.type}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl transition-all",
                task.completed 
                  ? "bg-emerald-500/10 border border-emerald-500/20" 
                  : "bg-white/5 border border-white/5 hover:border-white/10"
              )}
            >
              {/* Icon */}
              <div className={cn(
                "h-9 w-9 rounded-lg flex items-center justify-center shrink-0",
                task.completed 
                  ? "bg-emerald-500/20" 
                  : "bg-white/5"
              )}>
                <Icon className={cn(
                  "h-4.5 w-4.5",
                  task.completed ? "text-emerald-400" : TASK_COLORS[task.type]
                )} />
              </div>

              {/* Task info */}
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm font-medium",
                  task.completed ? "text-emerald-300" : "text-white"
                )}>
                  {task.description}
                </p>
                <p className="text-xs text-zinc-500">+{task.xp} XP</p>
              </div>

              {/* Status */}
              {task.completed ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              ) : (
                <Circle className="h-5 w-5 text-zinc-600 shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="mt-4 pt-4 border-t border-white/5">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-zinc-400">Daily progress</span>
          <span className="text-[#F9E370] font-medium">
            {Math.round((dailyTasksCompletedCount / Math.max(dailyTasks.length, 1)) * 100)}%
          </span>
        </div>
        <div className="h-2 bg-brand-dark rounded-full overflow-hidden border border-white/5">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-[#F9E370] transition-all duration-500"
            style={{ width: `${(dailyTasksCompletedCount / Math.max(dailyTasks.length, 1)) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

