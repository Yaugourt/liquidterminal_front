/**
 * Types pour les composants du dashboard
 */

/**
 * Types pour les composants VaultStakingAuction
 */
export interface TableHeaderButtonProps {
  header: string;
  align?: string;
}

export interface TableRowCellProps {
  column: Column<any>;
  item: any;
}

/**
 * Types pour les composants Tokens
 */
import { PerpMarketData } from "@/services/market/perp/types";
import { SpotToken } from "@/services/market/spot/types";
import { PerpSortableFields } from "@/services/market/perp/types";

// Types pour TokensTable
export interface TableHeaderCellProps {
    label: string;
    onClick: () => void;
    className?: string;
}

export interface TokenRowProps {
    token: SpotToken | PerpMarketData;
    type: "spot" | "perp";
    formatValue: (value: number) => string;
}

export interface TokensTableProps {
    type: "spot" | "perp";
    data: SpotToken[] | PerpMarketData[];
    isLoading: boolean;
    onSort: (field: string) => void;
}

// Types pour TrendingTokens
export type SpotSortableFields = "volume" | "marketcap" | "change24h" | "price" | "name";
export type SortableFields = PerpSortableFields | SpotSortableFields;
export type SortOrder = "asc" | "desc";

// Types pour TokensHeader
export interface StatItemProps {
    label: string;
    value: number;
}

export interface TokensHeaderProps {
    type: "spot" | "perp";
    title?: string;
    totalVolume: number;
    dailyFees?: number;
    openInterest?: number;
}

/**
 * Types pour les composants Chart
 */
import { ChartPeriod } from '@/components/common/charts';

export type FilterType = "bridge" | "strict" | "gas";

export interface DashboardData {
  time: number;
  value: number;
}

export interface ChartData {
  usdcData: DashboardData[];
  hypeData: DashboardData[];
}

export interface ChartDisplayProps {
  data: DashboardData[];
  isLoading: boolean;
  selectedFilter: FilterType;
  selectedPeriod: ChartPeriod;
  selectedCurrency?: "HYPE" | "USDC";
  onCurrencyChange?: (currency: "HYPE" | "USDC") => void;
  chartHeight: number;
}

export interface FilterButtonsProps {
  selectedFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export interface PeriodButtonsProps {
  selectedPeriod: ChartPeriod;
  onPeriodChange: (period: ChartPeriod) => void;
}

/**
 * Props pour le composant StatsCard
 */
export interface StatsCardProps {
  title: string;
  value: string;
  change?: number;
  isLoading?: boolean;
} 

/**
 * Props pour le composant TabSection
 */
export interface TabSectionProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

/**
 * Props pour le composant TabButtons
 */
export interface TabButtonsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

/**
 * Props pour le composant ValidatorsTable
 */
export interface ValidatorsTableProps {
  validators: Array<{
    name: string;
    apr: number;
    stake: number;
  }>;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Props pour le composant AuctionsTable
 */
export interface AuctionsTableProps {
  auctions: Array<{
    time: number;
    name: string;
    deployer: string;
    deployGas: string;
    deployGasAbs: string;
    currency: "USDC" | "HYPE";
  }>;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Props pour le composant VaultTable
 */
export interface VaultTableProps {
  vaults: Array<{
    name: string;
    apr: number;
    tvl: number;
    vaultAddress?: string;
  }>;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Props pour le composant ChartSection
 */
export interface ChartSectionProps {
  selectedFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  selectedPeriod: ChartPeriod;
  onPeriodChange: (period: ChartPeriod) => void;
}

/**
 * Props pour le composant TrendingTokens
 */
export interface TrendingTokensProps {
  type: "perp" | "spot";
  title?: string;
  initialData?: SpotToken[] | PerpMarketData[];
} 

/**
 * Interface pour définir une colonne du tableau de données
 */
export interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  align?: "left" | "right" | "center";
  headerAlign?: "left" | "right" | "center";
  className?: string;
}

/**
 * Props pour le composant DataTable
 */
export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading: boolean;
  error: Error | null;
  emptyMessage?: string;
  paginationDisabled?: boolean;
  hidePageNavigation?: boolean;
} 