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

interface CellValueProps {
  /** Main figure (already formatted), rendered mono. */
  value: ReactNode;
  /** Caption under the value (count, unit, secondary figure). */
  sub?: ReactNode;
  /** Semantic colour of the main figure. Default primary. */
  tone?: CellTone;
  /** Semantic colour of the caption (e.g. a danger note). Default muted. */
  subTone?: CellTone;
  /** Column alignment — match the column's `align`. Default right (figures). */
  align?: "left" | "right";
}

/**
 * CellValue — a table figure with a caption underneath ("$45.95M" over
 * "15 traders"). Use it in an untyped column (`align: "right"`) when a
 * numeric cell needs a second line; single-line figures use `Column.type`.
 */
export function CellValue({ value, sub, tone = "primary", subTone = "muted", align = "right" }: CellValueProps) {
  return (
    <div className={cn("flex flex-col leading-tight", align === "right" ? "items-end" : "items-start")}>
      <span className={cn("mono whitespace-nowrap", TONE[tone])}>{value}</span>
      {sub != null && (
        <span className={cn("mono whitespace-nowrap text-[10px]", TONE[subTone])}>{sub}</span>
      )}
    </div>
  );
}
