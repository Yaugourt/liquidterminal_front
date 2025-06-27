import { PortfolioPeriodData, TransactionType, BlockDetails, BlockTransaction } from "@/services/explorer";
import { NumberFormatType } from "@/store/number-format.store";

/**
 * Types pour les composants Block
 */
export interface BlockHeaderProps {
  blockDetails: BlockDetails;
  onAddressClick: (address: string) => void;
}

export interface BlockTransactionListProps {
  transactions: BlockTransaction[];
  onTransactionClick: (hash: string) => void;
  onAddressClick: (address: string) => void;
}

/**
 * Types pour les composants Explorer
 */
export type ActivityTab = "transfers" | "deploy";

export interface Transaction {
  hash: string;
  method: string;
  age: string;
  from: string;
  data: string;
}

export interface ExplorerStatsCardProps {
  title: string;
  value: string;
  type: 'block' | 'blockTime' | 'transactions' | 'users' | 'hypeStaked';
}

export interface ExplorerStat {
  title: string;
  value: string;
  type: ExplorerStatsCardProps['type'];
}

export interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

/**
 * Types pour les composants Address
 */
export interface TransactionListProps {
  transactions: TransactionType[];
  isLoading: boolean;
  error: Error | null;
  currentAddress: string;
}

export interface AddressBalanceProps {
  address: string;
}

export interface AddressHeaderProps {
  address: string;
}

export type Tab = {
  id: string;
  label: string;
};

export interface TabNavigationProps {
  activeTab: string;
  onChange: (tabId: string) => void;
  tabs: Tab[];
}

export interface HoldingTabsProps {
  address: string;
  viewType?: "spot" | "perp";
}

/**
 * Types pour les composants Address Cards
 */
export interface Balance {
    totalBalance: number;
    spotBalance: number;
    vaultBalance: number;
    perpBalance: number;
    stakedBalance: number;
}

export interface Period {
    key: 'allTime' | 'day' | 'week' | 'month';
    label: string;
}

export interface PnLVariation {
    value: string | null;
    numericValue: number | null;
}

export interface OverviewCardProps {
    balances: Balance;
    isLoading: boolean;
    formatCurrency: (value: number) => string;
}

export interface PnLCardProps {
    portfolio: Array<[string, PortfolioPeriodData]>;
    isLoading: boolean;
    format: NumberFormatType;
}

export interface InfoCardProps {
    onAddClick: () => void;
}

export interface AddressCardsProps {
    portfolio: Array<[string, PortfolioPeriodData]>;
    loadingPortfolio: boolean;
    onAddClick: () => void;
    address: string;
} 