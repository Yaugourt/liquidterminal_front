"use client";

import { useXpContext, DAILY_LIMIT_LABELS } from "@/services/xp";
import { cn } from "@/lib/utils";
import { AlertTriangle, X } from "lucide-react";
import { useState, useEffect } from "react";
import { LimitedActionType } from "@/services/xp/types";

interface DailyLimitsWarningProps {
  /** Show only for specific action type */
  actionType?: LimitedActionType;
  /** Always show, even if no limits reached */
  showProgress?: boolean;
  className?: string;
}

export function DailyLimitsWarning({ 
  actionType, 
  showProgress = false,
  className 
}: DailyLimitsWarningProps) {
  const { dailyLimits, limitsReached, hasReachedLimit } = useXpContext();
  const [dismissed, setDismissed] = useState<string[]>([]);

  // Reset dismissed state daily
  useEffect(() => {
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem('limits_dismissed_date');
    if (storedDate !== today) {
      localStorage.setItem('limits_dismissed_date', today);
      setDismissed([]);
    } else {
      const stored = localStorage.getItem('limits_dismissed');
      if (stored) {
        setDismissed(JSON.parse(stored));
      }
    }
  }, []);

  const handleDismiss = (type: string) => {
    const newDismissed = [...dismissed, type];
    setDismissed(newDismissed);
    localStorage.setItem('limits_dismissed', JSON.stringify(newDismissed));
  };

  // If specific action type, only show for that
  if (actionType) {
    if (!hasReachedLimit(actionType) && !showProgress) return null;
    
    const limit = dailyLimits.find(l => l.actionType === actionType);
    if (!limit) return null;
    
    if (dismissed.includes(actionType)) return null;

    const isReached = limit.remaining === 0;

    return (
      <div className={cn(
        "flex items-center gap-2 p-3 rounded-xl",
        isReached 
          ? "bg-orange-500/10 border border-orange-500/20" 
          : "bg-white/5 border border-border-subtle",
        className
      )}>
        {isReached && <AlertTriangle className="h-4 w-4 text-orange-400 shrink-0" />}
        <div className="flex-1 min-w-0">
          <p className={cn(
            "text-sm",
            isReached ? "text-orange-300" : "text-white/80"
          )}>
            {DAILY_LIMIT_LABELS[actionType]}
          </p>
          <p className="text-xs text-text-muted">
            {isReached 
              ? "Daily limit reached - no XP until tomorrow" 
              : `${limit.remaining}/${limit.max} remaining (+${limit.xpPerAction} XP each)`
            }
          </p>
        </div>
        {isReached && (
          <button
            onClick={() => handleDismiss(actionType)}
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            <X className="h-4 w-4 text-text-muted" />
          </button>
        )}
      </div>
    );
  }

  // Show all reached limits
  const visibleLimits = limitsReached.filter(type => !dismissed.includes(type));
  
  if (visibleLimits.length === 0) return null;

  return (
    <div className={cn("space-y-2", className)}>
      {visibleLimits.map((type) => {
        const limit = dailyLimits.find(l => l.actionType === type);
        if (!limit) return null;

        return (
          <div
            key={type}
            className="flex items-center gap-2 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20"
          >
            <AlertTriangle className="h-4 w-4 text-orange-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-orange-300">
                {DAILY_LIMIT_LABELS[type as LimitedActionType]}
              </p>
              <p className="text-xs text-text-muted">
                Daily limit reached - no XP until tomorrow
              </p>
            </div>
            <button
              onClick={() => handleDismiss(type)}
              className="p-1 hover:bg-white/10 rounded transition-colors"
            >
              <X className="h-4 w-4 text-text-muted" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

/** 
 * Hook to check if action will grant XP 
 */
export function useCanEarnXp(actionType: LimitedActionType): { canEarn: boolean; remaining: number } {
  const { dailyLimits, hasReachedLimit } = useXpContext();
  
  const limit = dailyLimits.find(l => l.actionType === actionType);
  
  return {
    canEarn: !hasReachedLimit(actionType),
    remaining: limit?.remaining ?? 0,
  };
}

