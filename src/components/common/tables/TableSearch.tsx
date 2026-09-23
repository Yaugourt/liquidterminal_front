"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TableSearchProps {
  /** Current query, owned by the parent (client or server side filtering). */
  value: string;
  /** Called with the new query — immediately, or after `debounceMs` of idle typing. */
  onChange: (value: string) => void;
  placeholder?: string;
  /**
   * Debounce `onChange` (ms) when the query hits the network. The field keeps
   * its own draft meanwhile, so typing never lags behind the parent.
   */
  debounceMs?: number;
  /** Width/placement overrides only (e.g. `max-w-sm`, `ml-auto`). */
  className?: string;
}

/**
 * TableSearch — the search field of a table `toolbar` (kit.html TypedDataTable
 * block): 32px, transparent, hairline border, magnifier left, clear button
 * once there is a query.
 */
export function TableSearch({ value, onChange, placeholder = "Search…", debounceMs, className }: TableSearchProps) {
  const [draft, setDraft] = useState(value);
  // Last query we emitted: lets us tell a parent echo of our own onChange
  // (ignore — the user may already have typed further) from an external
  // reset (adopt it).
  const lastEmitted = useRef(value);
  // Latest callback, read by the debounce timer: a parent passing a new
  // inline `onChange` each render must not keep restarting the timer.
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    if (value !== lastEmitted.current) {
      lastEmitted.current = value;
      setDraft(value);
    }
  }, [value]);

  useEffect(() => {
    if (!debounceMs || draft === lastEmitted.current) return;
    const t = setTimeout(() => {
      lastEmitted.current = draft;
      onChangeRef.current(draft);
    }, debounceMs);
    return () => clearTimeout(t);
  }, [draft, debounceMs]);

  const update = (next: string, immediate = false) => {
    setDraft(next);
    if (!debounceMs || immediate) {
      lastEmitted.current = next;
      onChange(next);
    }
  };

  return (
    <div className={cn("relative w-full min-w-[160px] flex-1 sm:max-w-xs", className)}>
      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
      <Input
        type="text"
        value={draft}
        onChange={(e) => update(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-8 rounded-md border-border-subtle bg-transparent pl-8 pr-7 text-[12.5px] md:text-[12.5px] text-text-primary focus:border-brand/50"
      />
      {draft && (
        <button
          type="button"
          onClick={() => update("", true)}
          aria-label="Clear search"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-text-tertiary transition-colors hover:text-text-primary"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
