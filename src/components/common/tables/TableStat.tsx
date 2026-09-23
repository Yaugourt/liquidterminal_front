import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { CellTone } from "../DataTable";

const TONE: Record<CellTone, string> = {
  success: "text-success",
  danger: "text-danger",
  gold: "text-gold",
  brand: "text-brand",
  muted: "text-text-tertiary",
  primary: "text-text-primary",
};

interface TableStatProps {
  /** Short label ("Delegated", "Total assets"). */
  label: ReactNode;
  /** Formatted figure, rendered mono. */
  value: ReactNode;
  /** Secondary figure after the value (e.g. USD equivalent). */
  sub?: ReactNode;
  /** Semantic colour of the value. Default primary. */
  tone?: CellTone;
  className?: string;
}

/**
 * TableStat — an inline "label · value" figure for a table `toolbar`
 * (totals, balances, counts). Tertiary 11px label + mono value; never a
 * hand-rolled `text-sm font-semibold` pair.
 */
export function TableStat({ label, value, sub, tone = "primary", className }: TableStatProps) {
  return (
    <span className={cn("inline-flex items-baseline gap-1.5 whitespace-nowrap text-[11px]", className)}>
      <span className="text-text-tertiary">{label}</span>
      <span className={cn("mono text-[12px]", TONE[tone])}>{value}</span>
      {sub != null && <span className="mono text-text-tertiary">{sub}</span>}
    </span>
  );
}
