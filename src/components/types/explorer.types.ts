import { BlockDetails, BlockTransaction } from "@/services/explorer";

/**
 * Types pour les composants Block
 */
export interface BlockHeaderProps {
  blockDetails: BlockDetails;
  onAddressClick: (address: string) => void;
}

export interface BlockTransactionListProps {
  transactions: BlockTransaction[];
}
