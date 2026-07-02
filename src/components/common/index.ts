/**
 * common/ barrel — SSOT for shared component imports.
 *
 * Convention: import from '@/components/common', not from internal files.
 * Enforced by ESLint no-restricted-imports.
 */

// Atomic UI helpers
export { TokenAvatar } from './TokenAvatar';
export { PriceChange, getPriceChangeColor, formatPriceChange } from './PriceChange';
export { Pagination } from './pagination';
export type { PaginationProps } from './pagination';
export { SearchBar } from './SearchBar';
export { ProtectedAction } from './ProtectedAction';
export { Sparkline } from './Sparkline';

// Cards / containers
export { StatsCard, StatsCardSkeleton } from './StatsCard';
export type { StatsCardProps } from './StatsCard';

// Loading skeletons (§7.f)
export { Skeleton, SkeletonCard, SkeletonGrid } from './Skeleton';
export { StatsPanel } from './StatsPanel';
export type { StatsPanelProps } from './StatsPanel';
export { WelcomePrompt } from './WelcomePrompt';
export { UserAccountCompact } from './UserAccountCompact';
export { ThemeToggle } from './ThemeToggle';

// Tables
export { TypedDataTable } from './DataTable';
export type { Column, ColumnType } from './DataTable';
export { ScrollableTable } from './ScrollableTable';
export {
  OverviewModule,
  ModuleTable,
  ModuleTableRow,
  ModuleAsset,
  ModuleRow,
  ModuleSubhead,
} from './OverviewModule';
export type { ModuleColumn, ModuleRowStat } from './OverviewModule';

// Numeric display
export { Num } from './Num';

// Prediction-market outcome row (§7.c)
export { OutcomeRow } from './OutcomeRow';
export type { OutcomeRowProps, OutcomeRowVariant } from './OutcomeRow';

// KPI ribbon (§7.b)
export { KpiRibbon } from './KpiRibbon';
export type { KpiCell, KpiTone, KpiRibbonProps } from './KpiRibbon';

// Dialogs
export { DeleteConfirmDialog } from './DeleteConfirmDialog';
export type { DeleteConfirmDialogProps } from './DeleteConfirmDialog';

// Labeled dominance bar with legend (stake-share concentration).
// Distinct from charts/StackedShareBar, the thin proportional track.
export { DominanceBar } from './DominanceBar';
export type { DominanceSegment, DominanceBarProps } from './DominanceBar';

// Layout / nav
export { SidebarToggle } from './SidebarToggle';
export { PageHeader } from './PageHeader';
export { PageSection } from './PageSection';
export { TimeframeTabs } from './TimeframeTabs';
export { LegalFooter } from './LegalFooter';
export { LegalPage } from './LegalPage';

// Re-exports from subpackages
export * from './animations';
export * from './charts';
export * from './forms';
export * from './settings';
export * from './tables';
export * from './tooltip';
