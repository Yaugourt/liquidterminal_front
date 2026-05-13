import type { StatItem } from "./education-meta";

/**
 * Compact stat tile used inside chapter hero blocks (label + value + hint).
 * Extracted from `EducationContent` so the layout file stays focused on
 * orchestration / data flow.
 */
export function EducationStatCard({ stat }: { stat: StatItem }) {
  return (
    <div className="rounded-xl border border-border-subtle bg-brand-dark/40 p-3 transition-colors hover:border-border-hover">
      <div className="text-[10px] font-medium uppercase tracking-wider text-text-muted">
        {stat.label}
      </div>
      <div className="mt-1 text-sm font-bold tracking-tight text-white tabular-nums md:text-[15px]">
        {stat.value}
      </div>
      {stat.hint && (
        <div className="mt-0.5 text-[10px] leading-snug text-text-muted">
          {stat.hint}
        </div>
      )}
    </div>
  );
}
