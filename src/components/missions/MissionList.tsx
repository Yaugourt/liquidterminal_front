"use client";

/**
 * Shared mission list body — category groups + mission rows.
 * Consumed by <MissionsWidget /> (floating panel) and <MissionsCard />
 * (embeddable). Handles row affordances: deep link, client actions
 * (open Cmd+K palette, Privy login), locked and completed states.
 */
import Link from "next/link";
import { CheckCircle2, Lock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGlobalSearch } from "@/store/use-global-search";
import { useAuthContext } from "@/contexts/auth.context";
import type {
  MissionCategoryGroup,
  MissionWithStatus,
} from "@/services/missions";

interface MissionListProps {
  byCategory: MissionCategoryGroup[];
  /** Called after a row navigates or triggers its action (close panel, ...). */
  onNavigate?: () => void;
  className?: string;
}

function XpChip({ xp, completed }: { xp: number; completed: boolean }) {
  return (
    <span
      className={cn(
        "mono shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded border",
        completed
          ? "bg-success/10 text-success border-success/20"
          : "bg-gold/10 text-gold border-gold/20"
      )}
    >
      +{xp} XP
    </span>
  );
}

function MissionRowContent({ mission }: { mission: MissionWithStatus }) {
  const Icon = mission.icon;
  return (
    <>
      {/* Mission icon */}
      <span
        className={cn(
          "w-6 h-6 rounded-md grid place-items-center shrink-0 transition-colors",
          mission.completed ? "bg-success/10" : "bg-brand/10"
        )}
      >
        {mission.completed ? (
          <CheckCircle2 size={13} className="text-success" />
        ) : (
          <Icon size={13} className="text-brand" />
        )}
      </span>

      {/* Title + description */}
      <span className="flex-1 min-w-0 flex flex-col gap-0.5">
        <span
          className={cn(
            "text-[12px] font-medium leading-tight",
            mission.completed
              ? "text-text-tertiary line-through decoration-text-tertiary/60"
              : "text-text-primary"
          )}
        >
          {mission.title}
        </span>
        <span className="text-[10.5px] text-text-tertiary leading-snug line-clamp-1">
          {mission.description}
        </span>
      </span>

      {/* Reward / lock / go */}
      <span className="flex items-center gap-1.5 shrink-0">
        <XpChip xp={mission.xpReward} completed={mission.completed} />
        {mission.locked && (
          <Lock size={11} className="text-text-tertiary" />
        )}
        {!mission.completed && !mission.locked && (
          <ArrowRight
            size={11}
            className="text-text-tertiary opacity-0 group-hover:opacity-100 group-hover:text-brand transition-all"
          />
        )}
      </span>
    </>
  );
}

export function MissionList({ byCategory, onNavigate, className }: MissionListProps) {
  const openSearch = useGlobalSearch((s) => s.setOpen);
  const { login, isAuthenticated } = useAuthContext();

  const rowClass = (interactive: boolean) =>
    cn(
      "group flex items-center gap-2.5 w-full text-left px-2 py-2 rounded-lg transition-colors",
      interactive ? "hover:bg-surface-2 cursor-pointer" : "cursor-default"
    );

  const handleAction = (mission: MissionWithStatus) => {
    if (mission.clientAction === "open-search") {
      openSearch(true);
    } else if (mission.clientAction === "login" && !isAuthenticated) {
      void login();
    }
    onNavigate?.();
  };

  const handleLockedClick = () => {
    // Locked missions need auth first — start the login flow directly.
    if (!isAuthenticated) void login();
  };

  return (
    <div className={cn("space-y-3", className)}>
      {byCategory.map((group) => (
        <div key={group.category}>
          <div className="flex items-center gap-2 px-2 pb-1">
            <span className="text-[10px] uppercase tracking-[0.1em] text-text-tertiary font-semibold">
              {group.label}
            </span>
            <span className="mono text-[10px] text-text-tertiary">
              {group.missions.filter((m) => m.completed).length}/{group.missions.length}
            </span>
          </div>
          <div className="space-y-0.5">
            {group.missions.map((mission) => {
              if (mission.completed) {
                return (
                  <div key={mission.id} className={rowClass(false)}>
                    <MissionRowContent mission={mission} />
                  </div>
                );
              }
              if (mission.locked) {
                return (
                  <button
                    key={mission.id}
                    type="button"
                    onClick={handleLockedClick}
                    className={rowClass(true)}
                    title="Sign in to unlock this mission"
                  >
                    <MissionRowContent mission={mission} />
                  </button>
                );
              }
              if (mission.clientAction) {
                return (
                  <button
                    key={mission.id}
                    type="button"
                    onClick={() => handleAction(mission)}
                    className={rowClass(true)}
                  >
                    <MissionRowContent mission={mission} />
                  </button>
                );
              }
              return (
                <Link
                  key={mission.id}
                  href={mission.href}
                  onClick={onNavigate}
                  className={rowClass(true)}
                >
                  <MissionRowContent mission={mission} />
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
