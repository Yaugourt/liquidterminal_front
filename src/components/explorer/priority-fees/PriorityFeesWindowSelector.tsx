"use client";

import {
  PRIORITY_FEES_WINDOW_HOURS,
  formatPriorityFeesWindowLabel,
} from "./priority-fees-format";

export interface PriorityFeesWindowSelectorProps {
  hours: number;
  onHoursChange: (h: number) => void;
}

export function PriorityFeesWindowSelector({
  hours,
  onHoursChange,
}: PriorityFeesWindowSelectorProps) {
  return (
    <div className="inline-flex w-full sm:w-auto rounded-lg p-1 border border-border-subtle bg-brand-secondary/40 backdrop-blur-md">
      {PRIORITY_FEES_WINDOW_HOURS.map((h) => (
        <button
          key={h}
          type="button"
          onClick={() => onHoursChange(h)}
          className={`flex-1 sm:flex-none px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
            hours === h
              ? "bg-brand-accent text-brand-tertiary"
              : "text-text-secondary hover:text-white"
          }`}
        >
          {formatPriorityFeesWindowLabel(h)}
        </button>
      ))}
    </div>
  );
}
