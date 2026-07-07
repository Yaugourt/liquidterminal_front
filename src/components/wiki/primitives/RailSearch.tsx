"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface RailSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** "sm" = h-7 nav rail filter; "lg" = h-9 front-door search. */
  size?: "sm" | "lg";
  /** Show the "/" keycap hint (front-door only). */
  keycap?: boolean;
  className?: string;
}

/**
 * Type-to-filter input for nav rails and the home front door. Replaces
 * "Show N more" toggles: the category/topic tail is reached by typing.
 */
export function RailSearch({
  value,
  onChange,
  placeholder = "Filter",
  size = "sm",
  keycap = false,
  className,
}: RailSearchProps) {
  return (
    <div className={cn("relative", className)}>
      <Search
        className={cn(
          "pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-text-tertiary",
          size === "lg" ? "h-4 w-4" : "h-3.5 w-3.5"
        )}
      />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full rounded-md border border-border-subtle bg-transparent pl-8 pr-8 text-text-primary placeholder:text-text-tertiary focus:border-border-default focus:outline-none",
          size === "lg" ? "h-9 text-[13px]" : "h-7 text-[12px]"
        )}
      />
      {keycap && (
        <span className="pointer-events-none absolute right-2.5 top-1/2 grid h-5 w-5 -translate-y-1/2 place-items-center rounded border border-border-subtle text-[11px] text-text-tertiary">
          <span className="mono">/</span>
        </span>
      )}
    </div>
  );
}
