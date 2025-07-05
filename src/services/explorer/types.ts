export interface BlockTransaction {
  time: number;
  user: string;
  action: {
    type: string;
   
  };
  block: number;
  error: null | string;
  hash: string;
}

export interface BlockDetails {
  height: number;
  blockTime: number;
  hash: string;
  numTxs: number;
  proposer: string;
  txs: BlockTransaction[];
}

export interface BlockDetailsResponse {
  type: "blockDetails";
  blockDetails: BlockDetails;
}

export interface UseBlockDetailsResult {
  blockDetails: BlockDetails | null;
  isLoading: boolean;
  error: Error | null;
}

export interface TransactionDetails {
  time: number;
  user: string;
  action: {
    type: string;
    cancels?: { a: number; o: number }[];
  };
  block: number;
  error: null | string;
  hash: string;
}

export interface TransactionDetailsResponse {
  type: "txDetails";
  tx: TransactionDetails;
}

export interface UseTransactionDetailsResult {
  transactionDetails: TransactionDetails | null;
  isLoading: boolean;
  error: Error | null;
}



// Types pour les transferts
export interface TransferData {
  time: number;
  user: string;
  action: {
    type: string;
    signatureChainId: string;
    hyperliquidChain: string;
    destination: string;
    token: string;
    amount: string;
    time: number;
  };
  block: number;
  hash: string;
  error: null | string;
}

export interface FormattedTransfer {
  hash: string;
  time: string;
  timestamp: number;
  from: string;
  to: string;
  amount: string;
  token: string;
  blockNumber: number;
}

export interface UseTransfersResult {
  transfers: FormattedTransfer[] | null;
  isLoading: boolean;
  error: Error | null;
}

// Types pour les déploiements
export interface DeployData {
  time: number;
  user: string;
  action: {
    type: string;
    registerToken2?: {
      spec?: {
        name: string;
        szDecimals: number;
        weiDecimals: number;
      };
      maxGas?: number;
    };
    // Autres propriétés possibles selon la structure API
  };
  block: number;
  hash: string;
  error: string | null;
}

export interface FormattedDeploy {
  hash: string;
  time: string;
  timestamp: number;
  user: string;
  action: string;
  blockNumber: number;
  status: 'success' | 'error';
  errorMessage?: string;
}

export interface UseDeploysResult {
  deploys: FormattedDeploy[] | null;
  isLoading: boolean;
  error: Error | null;
}

// Types pour les données WebSocket temps réel
export interface Block {
  height: number;
  blockTime: number;
  hash: string;
  numTxs: number;
  proposer: string;
}

export interface Transaction {
  time: number;
  user: string;
  hash: string;
  block: number;
  error: string | null;
  action: {
    type: string;
    cancels?: Array<{
      a: number;
      o: number;
    }>;
    // Add other action types as needed
  };
}

export interface ExplorerState {
  blocks: Block[];
  transactions: Transaction[];
  isBlocksConnected: boolean;
  isTransactionsConnected: boolean;
  error: string | null;
}

export interface ExplorerStore extends ExplorerState {
  connectBlocks: () => void;
  disconnectBlocks: () => void;
  connectTransactions: () => void;
  disconnectTransactions: () => void;
  connect: () => void;
  disconnect: () => void;
  addBlock: (block: Block) => void;
  addTransaction: (transaction: Transaction) => void;
  setError: (error: string | null) => void;
}

 