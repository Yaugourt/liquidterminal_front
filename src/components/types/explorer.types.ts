import { BlockDetails, BlockTransaction } from "@/services/explorer";
import { PortfolioPeriodData, TransactionType } from "@/services/explorer/address";
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
 * Types pour les composants Address
 */
export interface TransactionListProps {
  transactions: TransactionType[];
  isLoading: boolean;
  error: Error | null;
  currentAddress: string;
}

/**
 * Types pour les composants Address Cards
 */
interface Balance {
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