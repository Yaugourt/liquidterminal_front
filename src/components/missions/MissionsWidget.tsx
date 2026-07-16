"use client";

/**
 * Floating onboarding-missions widget (bottom-right).
 *
 * Collapsed: compact FAB pill with a progress ring + "n/total".
 * Expanded: Card panel with grouped missions, overall progress, hide flow,
 * and a celebratory burst when everything is complete.
 *
 * z-40: above page content and the sticky header (z-30), below dialogs and
 * the sidebar (z-50). On mobile the panel stretches edge-to-edge like a
 * bottom sheet; the FAB stays a small pill.
 */
import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Target, ChevronDown, X, PartyPopper } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useMissionsStore } from "@/store/use-missions";
import { useMissions } from "@/services/missions";
import { MissionList } from "./MissionList";

/** Deterministic confetti-ish particles (no Math.random in render). */
const BURST_PARTICLES: readonly {
  angle: number;
  distance: number;
  colorClass: string;
  size: number;
  delay: number;
}[] = Array.from({ length: 14 }, (_, i) => ({
  angle: (i / 14) * Math.PI * 2,
  distance: 46 + (i % 3) * 18,
  colorClass: ["bg-brand", "bg-gold", "bg-success"][i % 3],
  size: 4 + (i % 3) * 2,
  delay: (i % 5) * 0.04,
}));

function ProgressRing({
  percent,
  size = 34,
  strokeWidth = 3,
}: {
  percent: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent / 100);

  return (
    <span className="relative grid place-items-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-border-default"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="stroke-brand transition-[stroke-dashoffset] duration-500"
        />
      </svg>
      <Target size={13} className="absolute text-brand" />
    </span>
  );
}

function CelebrationBurst() {
  const reducedMotion = useReducedMotion();
  if (reducedMotion) return null;

  return (
    <span className="pointer-events-none absolute inset-0 grid place-items-center overflow-visible">
      {BURST_PARTICLES.map((p, i) => (
        <motion.span
          key={i}
          className={cn("absolute rounded-full", p.colorClass)}
          style={{ width: p.size, height: p.size }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: Math.cos(p.angle) * p.distance,
            y: Math.sin(p.angle) * p.distance,
            opacity: 0,
            scale: 0.4,
          }}
          transition={{ duration: 0.9, delay: p.delay, ease: "easeOut" }}
        />
      ))}
    </span>
  );
}

export function MissionsWidget() {
  const { byCategory, progress, nextMission } = useMissions();
  const panelCollapsed = useMissionsStore((s) => s.panelCollapsed);
  const togglePanel = useMissionsStore((s) => s.togglePanel);
  const setPanelCollapsed = useMissionsStore((s) => s.setPanelCollapsed);
  const dismissMissions = useMissionsStore((s) => s.dismissMissions);
  const acknowledgeCelebration = useMissionsStore((s) => s.acknowledgeCelebration);

  const [confirmingHide, setConfirmingHide] = useState(false);

  // Auto-expand once to show the celebration when everything is done.
  useEffect(() => {
    if (progress.allDone && panelCollapsed) setPanelCollapsed(false);
  }, [progress.allDone, panelCollapsed, setPanelCollapsed]);

  const expanded = !panelCollapsed || progress.allDone;

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-40 flex flex-col items-end",
        "max-sm:bottom-3 max-sm:right-3",
        expanded && "max-sm:left-3"
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {!expanded ? (
          /* ---- Collapsed FAB pill ---- */
          <motion.button
            key="fab"
            type="button"
            onClick={togglePanel}
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn(
              "flex items-center gap-2.5 rounded-full pl-1.5 pr-4 py-1.5",
              "bg-surface border border-border-default",
              "shadow-lg shadow-brand/15 hover:border-brand/40 transition-colors"
            )}
            aria-label={`Open missions — ${progress.completedCount} of ${progress.total} complete`}
          >
            <ProgressRing percent={progress.percent} />
            <span className="flex flex-col items-start leading-none gap-0.5">
              <span className="text-[11px] font-semibold text-text-primary">Missions</span>
              <span className="mono text-[10px] text-text-tertiary">
                {progress.completedCount}/{progress.total}
              </span>
            </span>
          </motion.button>
        ) : (
          /* ---- Expanded panel ---- */
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="w-[340px] max-sm:w-full"
          >
            <Card
              interactive={false}
              className="flex flex-col shadow-2xl shadow-black/50 max-h-[min(560px,calc(100vh-6rem))]"
            >
              {/* V4 card-head */}
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle shrink-0">
                <span className="relative w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
                  {progress.allDone ? (
                    <PartyPopper size={13} className="text-gold" />
                  ) : (
                    <Target size={13} className="text-brand" />
                  )}
                  {progress.allDone && <CelebrationBurst />}
                </span>
                <h3 className="text-[13px] font-semibold text-text-primary">Missions</h3>
                <span className="mono text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle">
                  {progress.completedCount}/{progress.total}
                </span>
                <span className="ml-auto flex items-center gap-0.5">
                  {!progress.allDone && (
                    <button
                      type="button"
                      onClick={togglePanel}
                      className="p-1.5 rounded-md text-text-tertiary hover:bg-surface-2 hover:text-text-primary transition-colors"
                      aria-label="Minimize missions"
                    >
                      <ChevronDown size={13} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      progress.allDone
                        ? acknowledgeCelebration()
                        : setConfirmingHide(true)
                    }
                    className="p-1.5 rounded-md text-text-tertiary hover:bg-surface-2 hover:text-text-primary transition-colors"
                    aria-label="Hide missions"
                  >
                    <X size={13} />
                  </button>
                </span>
              </div>

              {/* Overall progress */}
              <div className="px-3.5 pt-3 pb-1 shrink-0">
                <div className="flex items-center justify-between pb-1.5">
                  <span className="text-[10.5px] uppercase tracking-[0.06em] text-text-tertiary font-semibold">
                    {progress.allDone ? "All complete" : "Getting started"}
                  </span>
                  <span className="mono text-[10.5px] font-semibold text-gold">
                    {progress.earnedXp}/{progress.totalXp} XP
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-brand-deep to-brand"
                    initial={false}
                    animate={{ width: `${progress.percent}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>

              {progress.allDone ? (
                /* ---- Celebration state ---- */
                <div className="relative flex flex-col items-center text-center px-6 py-8 gap-2">
                  <CelebrationBurst />
                  <motion.span
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18 }}
                    className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/25 grid place-items-center"
                  >
                    <PartyPopper size={22} className="text-gold" />
                  </motion.span>
                  <p className="text-[14px] font-semibold text-text-primary pt-1">
                    All missions complete!
                  </p>
                  <p className="text-[11.5px] text-text-secondary leading-snug">
                    You have mastered the basics of Liquid Terminal.
                    Daily tasks and weekly challenges await on your profile.
                  </p>
                  <button
                    type="button"
                    onClick={acknowledgeCelebration}
                    className="mt-2 px-4 py-1.5 rounded-md bg-brand/10 border border-brand/25 text-[12px] font-semibold text-brand hover:bg-brand/15 transition-colors"
                  >
                    Done
                  </button>
                </div>
              ) : (
                /* ---- Mission list ---- */
                <>
                  <div className="overflow-y-auto px-1.5 py-2 min-h-0">
                    <MissionList
                      byCategory={byCategory}
                      onNavigate={() => setPanelCollapsed(true)}
                    />
                  </div>

                  {/* Footer: next hint / hide confirm */}
                  <div className="border-t border-border-subtle px-3.5 py-2 shrink-0">
                    {confirmingHide ? (
                      <div className="flex items-center gap-2">
                        <span className="flex-1 text-[11px] text-text-secondary">
                          Hide missions for good?
                        </span>
                        <button
                          type="button"
                          onClick={() => setConfirmingHide(false)}
                          className="px-2 py-1 rounded-md text-[11px] font-medium text-text-secondary hover:bg-surface-2 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={dismissMissions}
                          className="px-2 py-1 rounded-md text-[11px] font-semibold bg-danger/10 border border-danger/25 text-danger hover:bg-danger/15 transition-colors"
                        >
                          Hide
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-[10.5px] text-text-tertiary truncate">
                          {nextMission
                            ? `Up next: ${nextMission.title}`
                            : "Sign in to unlock the remaining missions"}
                        </span>
                        <button
                          type="button"
                          onClick={() => setConfirmingHide(true)}
                          className="shrink-0 text-[10.5px] text-text-tertiary hover:text-text-secondary transition-colors"
                        >
                          Hide
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
