"use client";

/**
 * Embeddable missions card — same data as the floating widget, in a static
 * V4 Card suitable for the profile page (e.g. next to daily tasks).
 * Not mounted anywhere yet; exported for future integration.
 */
import { Card } from "@/components/ui/card";
import { CardHead } from "@/components/common";
import { cn } from "@/lib/utils";
import { useMissions } from "@/services/missions";
import { MissionList } from "./MissionList";

export function MissionsCard({ className }: { className?: string }) {
  const { byCategory, progress } = useMissions();

  return (
    <Card interactive={false} className={cn("flex flex-col", className)}>
      <CardHead
        title="Onboarding missions"
        tag={
          <span className="mono">
            {progress.completedCount}/{progress.total}
          </span>
        }
        actions={
          <span className="mono text-[10.5px] font-semibold text-gold">
            {progress.earnedXp}/{progress.totalXp} XP
          </span>
        }
      />

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
