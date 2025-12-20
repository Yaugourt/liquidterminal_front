"use client";

import { useEffect, useRef, createContext, useContext, useCallback, ReactNode } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useXp } from "@/services/xp";
import { toast } from "sonner";
import { Star, Flame, TrendingUp } from "lucide-react";

// Context for XP refetch callback
interface XpRefetchContextValue {
  refetch: () => Promise<void>;
}

const XpRefetchContext = createContext<XpRefetchContextValue | null>(null);

// Global refetch function that can be called from anywhere
let globalRefetch: (() => Promise<void>) | null = null;

export function XpNotificationProvider({ children }: { children?: ReactNode }) {
  const { ready, authenticated } = usePrivy();
  const { lastLoginResult, stats, refetch } = useXp();
  const previousLevel = useRef<number | null>(null);
  const hasShownLoginToast = useRef(false);

  // Register global refetch
  useEffect(() => {
    globalRefetch = refetch;
    return () => {
      globalRefetch = null;
    };
  }, [refetch]);

  // Don't do anything until Privy is ready and user is authenticated
  const shouldShowNotifications = ready && authenticated;

  // Show notification when daily login XP is granted
  useEffect(() => {
    if (!shouldShowNotifications) return;
    if (lastLoginResult && lastLoginResult.xpGranted > 0 && !hasShownLoginToast.current) {
      hasShownLoginToast.current = true;

      // Calculate total XP gained (base + streak bonus)
      const totalXp = lastLoginResult.xpGranted + lastLoginResult.streakBonus;

      toast.custom(
        () => (
          <div className="flex items-center gap-3 bg-brand-secondary backdrop-blur-md border border-[#F9E370]/20 rounded-xl p-4 shadow-xl shadow-black/20">
            <div className="h-10 w-10 rounded-lg bg-[#F9E370]/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-[#F9E370]" />
            </div>
            <div>
              <p className="font-bold text-white">
                +{totalXp} XP
              </p>
              <p className="text-sm text-text-secondary">
                Daily login bonus
                {lastLoginResult.streakBonus > 0 && (
                  <span className="text-orange-400">
                    {" "}(+{lastLoginResult.streakBonus} streak bonus!)
                  </span>
                )}
              </p>
            </div>
            {lastLoginResult.newStreak > 1 && (
              <div className="flex items-center gap-1 ml-auto">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-bold text-orange-400">
                  {lastLoginResult.newStreak}
                </span>
              </div>
            )}
          </div>
        ),
        {
          duration: 4000,
          position: "bottom-right",
        }
      );
    }
  }, [lastLoginResult, shouldShowNotifications]);

  // Show level up notification
  useEffect(() => {
    if (!shouldShowNotifications) return;
    if (stats && previousLevel.current !== null && stats.level > previousLevel.current) {
      toast.custom(
        () => (
          <div className="flex items-center gap-3 bg-gradient-to-r from-purple-500/20 to-[#F9E370]/20 border border-[#F9E370]/50 rounded-xl p-4 shadow-xl shadow-[#F9E370]/10 animate-pulse">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#F9E370] to-purple-500 flex items-center justify-center">
              <Star className="h-6 w-6 text-brand-tertiary fill-brand-tertiary" />
            </div>
            <div>
              <p className="font-bold text-[#F9E370] text-lg">
                Level Up! 🎉
              </p>
              <p className="text-sm text-white">
                You reached level {stats.level}
              </p>
            </div>
          </div>
        ),
        {
          duration: 5000,
          position: "bottom-right",
        }
      );
    }
    
    if (stats) {
      previousLevel.current = stats.level;
    }
  }, [stats?.level, stats, shouldShowNotifications]);

  const contextValue = useCallback(() => refetch(), [refetch]);

  return (
    <XpRefetchContext.Provider value={{ refetch: contextValue }}>
      {children}
    </XpRefetchContext.Provider>
  );
}

// Hook to get refetch function
export function useXpRefetch() {
  const context = useContext(XpRefetchContext);
  return context?.refetch || null;
}

// Utility function to show XP gain toast from anywhere and refresh stats
export function showXpGainToast(amount: number, action: string) {
  toast.custom(
    () => (
      <div className="flex items-center gap-3 bg-brand-secondary backdrop-blur-md border border-[#F9E370]/20 rounded-xl p-3 shadow-xl shadow-black/20">
        <div className="h-8 w-8 rounded-lg bg-[#F9E370]/10 flex items-center justify-center">
          <Star className="h-4 w-4 text-[#F9E370]" />
        </div>
        <div>
          <p className="font-bold text-[#F9E370]">+{amount} XP</p>
          <p className="text-xs text-text-secondary">{action}</p>
        </div>
      </div>
    ),
    {
      duration: 3000,
      position: "bottom-right",
    }
  );

  // Trigger refetch of XP stats after a short delay to let backend update
  setTimeout(() => {
    if (globalRefetch) {
      globalRefetch().catch(console.error);
    }
  }, 500);
}

// Show daily task completed toast
export function showDailyTaskToast(xpGranted: number, taskName: string, bonusGranted?: number) {
  toast.custom(
    () => (
      <div className="flex items-center gap-3 bg-brand-secondary backdrop-blur-md border border-emerald-500/20 rounded-xl p-3 shadow-xl shadow-black/20">
        <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
          <Star className="h-4 w-4 text-emerald-400" />
        </div>
        <div>
          <p className="font-bold text-emerald-400">Daily Task Completed!</p>
          <p className="text-xs text-text-secondary">{taskName} +{xpGranted} XP</p>
          {bonusGranted && bonusGranted > 0 && (
            <p className="text-xs text-[#F9E370]">All tasks bonus: +{bonusGranted} XP!</p>
          )}
        </div>
      </div>
    ),
    {
      duration: 4000,
      position: "bottom-right",
    }
  );

  setTimeout(() => {
    if (globalRefetch) {
      globalRefetch().catch(console.error);
    }
  }, 500);
}

// Show weekly challenge completed toast
export function showWeeklyChallengeToast(xpReward: number, challengeName: string) {
  toast.custom(
    () => (
      <div className="flex items-center gap-3 bg-gradient-to-r from-purple-500/20 to-[#F9E370]/20 border border-[#F9E370]/30 rounded-xl p-3 shadow-xl shadow-black/20">
        <div className="h-8 w-8 rounded-lg bg-[#F9E370]/10 flex items-center justify-center">
          <TrendingUp className="h-4 w-4 text-[#F9E370]" />
        </div>
        <div>
          <p className="font-bold text-[#F9E370]">Weekly Challenge Complete!</p>
          <p className="text-xs text-text-secondary">{challengeName}</p>
          <p className="text-xs text-[#F9E370]">+{xpReward} XP</p>
        </div>
      </div>
    ),
    {
      duration: 5000,
      position: "bottom-right",
    }
  );

  setTimeout(() => {
    if (globalRefetch) {
      globalRefetch().catch(console.error);
    }
  }, 500);
}

// Show daily limit reached warning toast
export function showDailyLimitToast(actionName: string) {
  toast.custom(
    () => (
      <div className="flex items-center gap-3 bg-brand-secondary backdrop-blur-md border border-orange-500/20 rounded-xl p-3 shadow-xl shadow-black/20">
        <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
          <Flame className="h-4 w-4 text-orange-400" />
        </div>
        <div>
          <p className="font-bold text-orange-400">Daily Limit Reached</p>
          <p className="text-xs text-text-secondary">{actionName} - No XP until tomorrow</p>
        </div>
      </div>
    ),
    {
      duration: 4000,
      position: "bottom-right",
    }
  );
}
