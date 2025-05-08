/**
 * Types pour les composants du dashboard
 */

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
    name: string;
    deployer: string;
    deployGas: string;
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
  }>;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Props pour le composant ChartSection
 */
export interface ChartSectionProps {
  chartHeight: number;
} 

/**
 * Props pour le composant TrendingTokens
 */
export interface TrendingTokensProps {
  type: "perp" | "spot";
  title?: string;
} 

/**
 * Interface pour définir une colonne du tableau de données
 */
export interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  align?: "left" | "right" | "center";
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
} 