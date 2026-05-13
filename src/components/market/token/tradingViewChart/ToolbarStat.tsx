interface ToolbarStatProps {
  label: string;
  value: string;
  tone: "emerald" | "rose" | "accent";
}

/**
 * Compact stat pill used in the `TradingViewChart` top toolbar
 * (e.g. "Mark · $123.45", "24h · +1.23%").
 */
export function ToolbarStat({ label, value, tone }: ToolbarStatProps) {
  const dot =
    tone === "emerald"
      ? "bg-emerald-400"
      : tone === "rose"
        ? "bg-rose-400"
        : "bg-brand-accent";
  return (
    <div className="flex items-center gap-1.5 rounded-md border border-border-subtle bg-white/[0.02] px-1.5 py-0.5 sm:gap-2 sm:px-2">
      <span className={`h-1 w-1 rounded-full ${dot}`} />
      <span className="text-[9px] font-semibold uppercase tracking-wider text-text-muted">
        {label}
      </span>
      <span className="text-[11px] font-semibold text-white tabular-nums">{value}</span>
    </div>
  );
}
