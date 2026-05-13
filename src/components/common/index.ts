/**
 * common/ barrel — SSOT for shared component imports.
 *
 * Convention: import from '@/components/common', not from internal files.
 * Enforced by ESLint no-restricted-imports.
 */

// Atomic UI helpers
export { AssetLogo } from './AssetLogo';
export { TokenIcon } from './TokenIcon';
export { PriceChange, getPriceChangeColor, formatPriceChange } from './PriceChange';
export { Pagination } from './pagination';
export type { PaginationProps } from './pagination';
export { SearchBar } from './SearchBar';
export { ProtectedAction } from './ProtectedAction';

// Cards / containers
export { StatsCard, StatsCardSkeleton } from './StatsCard';
export type { StatsCardProps } from './StatsCard';
export { StatsPanel } from './StatsPanel';
export type { StatsPanelProps } from './StatsPanel';
export { WelcomePrompt } from './WelcomePrompt';
export { UserAccountCompact } from './UserAccountCompact';

// Tables
export { DataTable, TypedDataTable } from './DataTable';
export type { Column } from './DataTable';
export { ScrollableTable } from './ScrollableTable';

// Layout / nav
export { SidebarToggle } from './SidebarToggle';

// Re-exports from subpackages
export * from './animations';
export * from './charts';
export * from './forms';
export * from './modal';
export * from './settings';
export * from './tables';
export * from './tooltip';
