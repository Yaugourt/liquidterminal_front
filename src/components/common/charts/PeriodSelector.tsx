"use client";

import { memo, useId } from "react";
import { motion } from "framer-motion";

interface PeriodSelectorProps<T extends string> {
  selected: T;
  onChange: (value: T) => void;
  options: readonly T[];
  labels?: Partial<Record<T, string>>;
  variant?: "accent" | "rose" | "aurora";
  size?: "sm" | "md";
  className?: string;
}

function PeriodSelectorInner<T extends string>({
  selected,
  onChange,
  options,
  labels,
  variant = "accent",
  size = "sm",
  className = "",
}: PeriodSelectorProps<T>) {
  // Unique layout id per selector instance — avoids animation cross-talk when
  // multiple selectors are mounted in the same tree (e.g. dashboard + sidebar).
  const uid = useId().replace(/:/g, "");

  // ── Aurora variant: glass pill with animated active background ────────
  if (variant === "aurora") {
    const pad = size === "md" ? "px-3 py-1" : "px-2.5 py-1";
    return (
      <div
        className={`flex items-center rounded-lg border border-border-subtle bg-black/30 p-1 ${className}`}
      >
        {options.map((option) => {
          const isActive = selected === option;
          return (
            <button
              key={option}
              onClick={() => onChange(option)}
              className={`relative rounded-lg ${pad} text-[11px] font-semibold tabular-nums whitespace-nowrap min-w-[32px] min-h-[24px]`}
            >
              {isActive && (
                <motion.span
                  layoutId={`aurora-period-${uid}`}
                  className="absolute inset-0 rounded-lg bg-white/[0.06] ring-1 ring-white/10"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                />
              )}
              <span
                className={`relative z-10 ${
                  isActive
                    ? "text-text-primary"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {labels?.[option] ?? option}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  // ── Legacy variants (accent / rose) — unchanged ───────────────────────
  const activeClass =
    variant === "rose"
      ? "bg-rose-500/20 text-rose-400 font-bold"
      : "bg-brand-accent text-brand-tertiary shadow-sm font-bold";

  const pad = size === "md" ? "px-3 py-1.5" : "px-2 py-1";

  return (
    <div
      className={`flex bg-brand-dark rounded-lg p-1 border border-border-subtle ${className}`}
    >
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={`${pad} rounded-md text-xs font-medium transition-all whitespace-nowrap min-w-[32px] min-h-[28px] ${
            selected === option ? activeClass : "tab-inactive"
          }`}
        >
          {labels?.[option] ?? option}
        </button>
      ))}
    </div>
  );
}

export const PeriodSelector = memo(PeriodSelectorInner) as typeof PeriodSelectorInner;
