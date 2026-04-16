"use client";

import { memo } from "react";

interface PeriodSelectorProps<T extends string> {
  selected: T;
  onChange: (value: T) => void;
  options: readonly T[];
  labels?: Partial<Record<T, string>>;
  variant?: "accent" | "rose";
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
