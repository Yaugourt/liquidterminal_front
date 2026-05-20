"use client";

import { ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  QUICK_TIMEFRAMES,
  TIMEFRAME_GROUPS,
  type TimeframeType,
} from "./chart-helpers";

interface TimeframePopoverProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  selected: TimeframeType;
  onSelect: (t: TimeframeType) => void;
}

/**
 * "More timeframes" popover for the TradingView chart toolbar.
 *
 * When the active timeframe sits in `QUICK_TIMEFRAMES`, the trigger shows
 * an ellipsis. Otherwise it shows the active timeframe label in accent —
 * making the popover act as the visible indicator of selection.
 */
export function TimeframePopover({
  open,
  onOpenChange,
  selected,
  onSelect,
}: TimeframePopoverProps) {
  const isSelectedInQuick = (QUICK_TIMEFRAMES as readonly string[]).includes(selected);
  const triggerLabel = isSelectedInQuick ? null : selected;

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="More timeframes"
          className={`relative ml-0.5 flex items-center gap-0.5 rounded-md px-2 py-0.5 text-[10.5px] font-semibold tabular-nums transition-colors ${triggerLabel
            ? "bg-brand/15 text-brand ring-1 ring-brand/40"
            : open
              ? "text-text-primary bg-white/5"
              : "text-text-secondary hover:text-text-primary"
            }`}
        >
          {triggerLabel ? <span>{triggerLabel}</span> : <span>···</span>}
          <ChevronDown
            className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-auto min-w-[220px] rounded-xl border border-border-default bg-base/95 backdrop-blur-md p-2 shadow-2xl shadow-black/40"
      >
        <div className="flex flex-col gap-2">
          {TIMEFRAME_GROUPS.map((group) => (
            <div key={group.label}>
              <div className="px-1 pb-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-text-tertiary">
                {group.label}
              </div>
              <div className="grid grid-cols-5 gap-1">
                {group.items.map((t) => {
                  const isActive = selected === t;
                  return (
                    <button
                      key={t}
                      onClick={() => onSelect(t)}
                      className={`relative rounded-md px-2 py-1 text-[11px] font-semibold tabular-nums transition-colors ${isActive
                        ? "bg-brand/15 text-brand ring-1 ring-brand/40"
                        : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
                        }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
