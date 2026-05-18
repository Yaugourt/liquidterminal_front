"use client";

import { cn } from "@/lib/utils";
import { useNumberFormat } from "@/store/number-format.store";
import {
  compactUsd,
  formatPrice,
  formatMetricValue,
} from "@/lib/formatters/numberFormatting";

type NumFormat = "compact" | "price" | "metric" | "raw" | ((value: number) => string);
type NumVariant = "default" | "fees" | "change" | "muted";

interface NumProps {
  /** Valeur numérique (string parsée). `null`/`undefined`/`NaN` → `fallback`. */
  value: number | string | null | undefined;
  /** Stratégie de formatage. Défaut `"raw"`. */
  format?: NumFormat;
  /** Variante de style. `fees` = or ; `change` = couleur signée + `+`. Défaut `"default"`. */
  variant?: NumVariant;
  prefix?: string;
  suffix?: string;
  /** Texte affiché si la valeur est absente. Défaut `"—"`. */
  fallback?: string;
  className?: string;
}

/**
 * `<Num>` — primitive d'affichage d'un chiffre autonome (hors table).
 *
 * Rend toujours en police mono V4 (`.mono`). Les chiffres en table passent
 * par `Column.type` ; les chiffres interpolés dans du texte gardent les
 * fonctions de `numberFormatting.ts`.
 */
export function Num({
  value,
  format = "raw",
  variant = "default",
  prefix,
  suffix,
  fallback = "—",
  className,
}: NumProps) {
  const { format: numberFormat } = useNumberFormat();

  const num = typeof value === "string" ? parseFloat(value) : value;

  if (num == null || !Number.isFinite(num)) {
    return <span className={cn("mono text-text-tertiary", className)}>{fallback}</span>;
  }

  let text: string;
  if (typeof format === "function") {
    text = format(num);
  } else if (format === "compact") {
    text = compactUsd(num);
  } else if (format === "price") {
    text = formatPrice(num, numberFormat);
  } else if (format === "metric") {
    text = formatMetricValue(num, { format: numberFormat });
  } else {
    text = String(num);
  }

  const signPrefix = variant === "change" && num > 0 ? "+" : "";

  const variantClass =
    variant === "fees"
      ? "fees-cell"
      : variant === "muted"
        ? "text-text-secondary"
        : variant === "change"
          ? num > 0
            ? "text-success"
            : num < 0
              ? "text-danger"
              : "text-text-secondary"
          : "";

  return (
    <span className={cn("mono", variantClass, className)}>
      {prefix}
      {signPrefix}
      {text}
      {suffix}
    </span>
  );
}
