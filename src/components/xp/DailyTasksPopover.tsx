"use client";

import { useXpContext } from "@/services/xp";
import { cn } from "@/lib/utils";
import { 
  CheckCircle2, 
  Circle, 
  Gift,
  ChevronRight,
  Loader2,
  ExternalLink
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Link from "next/link";
import { getDailyTaskRoute } from "@/services/xp/taskRoutes";

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
        <Loader2 className="h-3 w-3 animate-spin text-zinc-500" />
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
            "bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10",
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
          <span className="text-[10px] text-zinc-400 group-hover:text-zinc-300">
            {dailyTasksCompletedCount}/{dailyTasks.length}
          </span>

          {/* Bonus indicator if not all completed */}
          {!allDailyTasksCompleted && !dailyBonusClaimed && (
            <span className="text-[10px] text-[#F9E370] font-medium">
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
        className="w-72 p-0 bg-[#151A25] border border-white/10 rounded-xl shadow-xl shadow-black/40"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <span className="text-sm font-semibold text-white">Daily Tasks</span>
          </div>
          <span className="text-xs text-zinc-400">
            {dailyTasksCompletedCount}/{dailyTasks.length}
          </span>
        </div>

        {/* Tasks list */}
        <div className="p-2 space-y-1">
          {dailyTasks.map((task) => {
            const taskRoute = getDailyTaskRoute(task.type);
            const taskContent = (
              <>
                {/* Status icon */}
                {task.completed ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 text-zinc-500 group-hover:text-[#83E9FF] shrink-0 transition-colors" />
                )}

                {/* Task info */}
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-xs",
                    task.completed 
                      ? "text-emerald-300" 
                      : "text-zinc-300 group-hover:text-white transition-colors"
                  )}>
                    {task.description}
                  </p>
                </div>

                {/* XP and link indicator */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={cn(
                    "text-[10px] font-medium",
                    task.completed ? "text-emerald-400" : "text-zinc-500 group-hover:text-[#83E9FF] transition-colors"
                  )}>
                    +{task.xp}
                  </span>
                  {!task.completed && (
                    <ExternalLink className="h-3 w-3 text-zinc-500 group-hover:text-[#83E9FF] opacity-0 group-hover:opacity-100 transition-all" />
                  )}
                </div>
              </>
            );

            if (task.completed) {
              return (
                <div
                  key={task.type}
                  className={cn(
                    "flex items-center gap-2.5 p-2 rounded-lg transition-colors",
                    "bg-emerald-500/10 cursor-default"
                  )}
                >
                  {taskContent}
                </div>
              );
            }

            return (
              <Link
                key={task.type}
                href={taskRoute}
                className={cn(
                  "flex items-center gap-2.5 p-2 rounded-lg transition-colors",
                  "bg-white/5 hover:bg-white/10 cursor-pointer group"
                )}
              >
                {taskContent}
              </Link>
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
                : "bg-white/5 border border-white/5"
            )}>
              <Gift className={cn(
                "h-4 w-4",
                allDailyTasksCompleted ? "text-[#F9E370]" : "text-zinc-500"
              )} />
              <span className={cn(
                "text-xs",
                allDailyTasksCompleted ? "text-[#F9E370] font-medium" : "text-zinc-400"
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
        <div className="border-t border-white/5">
          <Link
            href="/profile?tab=missions"
            className="flex items-center justify-between p-3 text-xs text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <span>See Weekly Challenges</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}

