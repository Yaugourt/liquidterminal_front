import { BlockDetails, BlockTransaction } from "@/services/explorer";
import { TransactionType } from "@/services/explorer/address";

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
