"use client";

/**
 * Embeddable missions card — same data as the floating widget, in a static
 * V4 Card suitable for the profile page (e.g. next to daily tasks).
 * Not mounted anywhere yet; exported for future integration.
 */
import { Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useMissions } from "@/services/missions";
import { MissionList } from "./MissionList";

export function MissionsCard({ className }: { className?: string }) {
  const { byCategory, progress } = useMissions();

  return (
    <Card interactive={false} className={cn("flex flex-col", className)}>
      {/* V4 card-head */}
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle">
        <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
          <Target size={13} className="text-brand" />
        </span>
        <h3 className="text-[13px] font-semibold text-text-primary">
          Onboarding missions
        </h3>
        <span className="mono text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle">
          {progress.completedCount}/{progress.total}
        </span>
        <span className="ml-auto mono text-[10.5px] font-semibold text-gold">
          {progress.earnedXp}/{progress.totalXp} XP
        </span>
      </div>

      {/* Overall progress */}
      <div className="px-3.5 pt-3 pb-1">
        <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-deep to-brand transition-[width] duration-500"
            style={{ width: `${progress.percent}%` }}
          />
        </div>
      </div>

      <div className="px-1.5 py-2">
        <MissionList byCategory={byCategory} />
      </div>
    </Card>
  );
}
