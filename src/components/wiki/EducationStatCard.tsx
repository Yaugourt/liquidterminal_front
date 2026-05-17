import { StatsCard } from "@/components/common";
import type { StatItem } from "./education-meta";

/**
 * Compact stat tile used inside chapter hero blocks (label + value + hint).
 * Thin wrapper around the canonical `<StatsCard>` (compact density, no Card chrome).
 */
export function EducationStatCard({ stat }: { stat: StatItem }) {
  return (
    <StatsCard
      title={stat.label}
      value={stat.value}
      subValue={stat.hint}
      density="compact"
      withCard={false}
      className="rounded-lg border border-border-subtle bg-brand-dark/40 transition-colors hover:border-border-hover"
    />
  );
}
