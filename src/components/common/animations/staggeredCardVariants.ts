import type { Variants } from "framer-motion";

interface StaggeredCardVariantsOptions {
  /** Multiplier for the per-index delay (in seconds). Defaults to 0.06. */
  delay?: number;
  /** Initial Y offset before animating in. Defaults to 16. */
  yOffset?: number;
  /** Animation duration in seconds. Defaults to 0.35. */
  duration?: number;
}

/**
 * Variants for the "cards arrive one after the other" entrance pattern.
 *
 * Used by KPI grids and card lists (PriorityFeesKpiRow, BuilderIntelligenceKpis,
 * BuilderDetailStatsGrid, BuildersGlobalStatsStrip, BuildersTopTable,
 * ReadListContent, ReadListSidebar, ExplorerKpiBar, VaultDetailKpiRow).
 *
 * Usage:
 * ```tsx
 * const v = staggeredCardVariants();
 * cards.map((card, i) => (
 *   <motion.div key={card.id} custom={i} initial="hidden" animate="visible" variants={v}>
 *     ...
 *   </motion.div>
 * ));
 * ```
 *
 * Default values match the most common variant on the codebase
 * (`delay: i * 0.06`, `y: 16`, `duration: 0.35`). Tune via options to match
 * legacy call-sites without visual change.
 */
export function staggeredCardVariants({
  delay = 0.06,
  yOffset = 16,
  duration = 0.35,
}: StaggeredCardVariantsOptions = {}): Variants {
  return {
    hidden: { opacity: 0, y: yOffset },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * delay, duration },
    }),
  };
}
